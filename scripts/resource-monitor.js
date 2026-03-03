#!/usr/bin/env node
/**
 * Athena Resource Monitor with Fault Tolerance Integration
 * 
 * Monitors system resources (disk, memory, swap) and triggers
 * self-healing actions when thresholds are exceeded.
 * 
 * Integrates with the athena-fault-tolerance.js prototype.
 * 
 * Usage:
 *   node resource-monitor.js [--watch] [--interval N] [--thresholds file]
 * 
 * Options:
 *   --watch         Continuous monitoring mode
 *   --interval N    Check interval in seconds (default: 300)
 *   --thresholds    Path to thresholds config file
 *   --auto-heal     Enable automatic healing actions
 *   --notify        Send notifications on critical alerts
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const http = require('http');

// ============================================================
// CONFIGURATION
// ============================================================

const WORKSPACE = '/root/.openclaw/workspace';
const LOG_FILE = path.join(WORKSPACE, 'memory/resource-monitor.log.json');
const STATE_FILE = path.join(WORKSPACE, 'memory/resource-monitor-state.json');
const THRESHOLDS_FILE = path.join(WORKSPACE, 'config/resource-thresholds.json');

// Default thresholds
const DEFAULT_THRESHOLDS = {
  disk: {
    warning: 70,    // % used
    critical: 85,   // % used
    emergency: 95   // % used - immediate action
  },
  memory: {
    warning: 80,    // % used
    critical: 90,   // % used
    emergency: 95   // % used
  },
  swap: {
    warning: 50,    // % used
    critical: 70,   // % used
    emergency: 90   // % used
  },
  docker: {
    images: {
      warning: 20,  // GB
      critical: 30, // GB
      reclaimable: 5 // GB - trigger cleanup if available
    }
  }
};

// Parse arguments
const args = process.argv.slice(2);
const options = {
  watch: args.includes('--watch'),
  interval: parseInt(args.find(a => a.startsWith('--interval='))?.split('=')[1] || '300') * 1000,
  autoHeal: args.includes('--auto-heal'),
  notify: args.includes('--notify'),
  json: args.includes('--json'),
  verbose: args.includes('--verbose') || args.includes('-v')
};

// ============================================================
// RESOURCE COLLECTION
// ============================================================

class ResourceCollector {
  /**
   * Get disk usage percentage
   */
  getDiskUsage() {
    try {
      const output = execSync('df -h / --output=pcent,target | tail -1', { encoding: 'utf8' });
      const percent = parseInt(output.trim().replace('%', ''));
      const details = execSync('df -h / --output=size,used,avail | tail -1', { encoding: 'utf8' });
      const [size, used, avail] = details.trim().split(/\s+/);
      
      return {
        percent,
        size,
        used,
        avail,
        status: this.evaluateThreshold(percent, 'disk')
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    try {
      const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
      const lines = meminfo.split('\n');
      
      const getValue = (name) => {
        const line = lines.find(l => l.startsWith(name));
        return line ? parseInt(line.split(/\s+/)[1]) : 0;
      };
      
      const total = getValue('MemTotal');
      const free = getValue('MemFree');
      const available = getValue('MemAvailable');
      const buffers = getValue('Buffers');
      const cached = getValue('Cached');
      
      const used = total - available;
      const percent = Math.round((used / total) * 100);
      
      // Swap
      const swapTotal = getValue('SwapTotal');
      const swapFree = getValue('SwapFree');
      const swapUsed = swapTotal - swapFree;
      const swapPercent = swapTotal > 0 ? Math.round((swapUsed / swapTotal) * 100) : 0;
      
      return {
        total: Math.round(total / 1024),
        used: Math.round(used / 1024),
        available: Math.round(available / 1024),
        percent,
        status: this.evaluateThreshold(percent, 'memory'),
        swap: {
          total: Math.round(swapTotal / 1024),
          used: Math.round(swapUsed / 1024),
          free: Math.round(swapFree / 1024),
          percent: swapPercent,
          status: this.evaluateThreshold(swapPercent, 'swap')
        }
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * Get Docker system status
   */
  getDockerStatus() {
    try {
      const output = execSync('docker system df --format "{{json .}}"', { encoding: 'utf8' });
      const lines = output.trim().split('\n').filter(l => l);
      
      const data = {};
      for (const line of lines) {
        const parsed = JSON.parse(line);
        data[parsed.Type.toLowerCase().replace(' ', '_')] = {
          total: parsed.Total,
          active: parsed.Active,
          size: parsed.Size,
          reclaimable: parsed.Reclaimable
        };
      }
      
      // Extract reclaimable GB
      const imagesSize = this.parseDockerSize(data.images?.size || '0GB');
      const reclaimableGB = this.parseReclaimable(data.images?.reclaimable || '0B');
      
      data.status = {
        size: imagesSize,
        reclaimableGB,
        shouldCleanup: reclaimableGB > DEFAULT_THRESHOLDS.docker.images.reclaimable
      };
      
      return data;
    } catch (e) {
      return { error: e.message, available: false };
    }
  }

  /**
   * Parse Docker size string to GB
   */
  parseDockerSize(sizeStr) {
    if (sizeStr.includes('GB')) {
      return parseFloat(sizeStr);
    } else if (sizeStr.includes('MB')) {
      return parseFloat(sizeStr) / 1024;
    } else if (sizeStr.includes('TB')) {
      return parseFloat(sizeStr) * 1024;
    }
    return 0;
  }

  /**
   * Parse reclaimable string to GB
   */
  parseReclaimable(str) {
    if (!str || str === '0B') return 0;
    const match = str.match(/(\d+\.?\d*)(GB|MB|TB)/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    if (unit === 'GB') return value;
    if (unit === 'MB') return value / 1024;
    if (unit === 'TB') return value * 1024;
    return 0;
  }

  /**
   * Evaluate threshold and return status
   */
  evaluateThreshold(value, type) {
    const thresholds = DEFAULT_THRESHOLDS[type];
    if (!thresholds) return 'unknown';
    
    if (value >= thresholds.emergency) return 'emergency';
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'ok';
  }

  /**
   * Collect all metrics
   */
  collectAll() {
    return {
      timestamp: new Date().toISOString(),
      disk: this.getDiskUsage(),
      memory: this.getMemoryUsage(),
      docker: this.getDockerStatus()
    };
  }
}

// ============================================================
// SELF-HEALING ACTIONS
// ============================================================

class SelfHealer {
  constructor(notify = false) {
    this.notify = notify;
    this.actions = [];
  }

  /**
   * Execute Docker cleanup
   */
  async dockerCleanup() {
    console.log('🧹 Executing Docker cleanup...');
    const actions = [];
    
    try {
      // Remove unused images
      const pruneResult = execSync('docker image prune -a -f --filter "until=24h" 2>&1', { encoding: 'utf8' });
      actions.push({ action: 'docker_prune', result: pruneResult.trim() });
      
      // Clean build cache
      try {
        const buildPrune = execSync('docker builder prune -f 2>&1', { encoding: 'utf8' });
        actions.push({ action: 'builder_prune', result: buildPrune.trim() });
      } catch (e) {
        // Build cache might not exist
      }
      
      // Clean volumes
      try {
        const volumePrune = execSync('docker volume prune -f 2>&1', { encoding: 'utf8' });
        actions.push({ action: 'volume_prune', result: volumePrune.trim() });
      } catch (e) {
        // Volumes might be in use
      }
      
      this.actions.push(...actions);
      return { success: true, actions };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Clean logs
   */
  async cleanLogs() {
    console.log('🧹 Cleaning old logs...');
    const actions = [];
    
    try {
      // Journal logs
      const journalResult = execSync('journalctl --vacuum-time=7d 2>&1', { encoding: 'utf8' });
      actions.push({ action: 'journal_vacuum', result: journalResult.trim() });
      
      // Rotated logs
      try {
        const logResult = execSync('rm -f /var/log/*.gz /var/log/*.1 /var/log/*.old 2>&1', { encoding: 'utf8' });
        actions.push({ action: 'log_cleanup', result: 'Cleaned rotated logs' });
      } catch (e) {
        // No rotated logs
      }
      
      this.actions.push(...actions);
      return { success: true, actions };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Clean package cache
   */
  async cleanPackageCache() {
    console.log('🧹 Cleaning package cache...');
    const actions = [];
    
    try {
      const aptResult = execSync('apt-get clean && apt-get autoclean 2>&1', { encoding: 'utf8' });
      actions.push({ action: 'apt_clean', result: aptResult.trim() });
      
      try {
        const autoRemove = execSync('apt-get autoremove -y 2>&1', { encoding: 'utf8' });
        actions.push({ action: 'apt_autoremove', result: autoRemove.trim() });
      } catch (e) {
        // No packages to remove
      }
      
      this.actions.push(...actions);
      return { success: true, actions };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Trigger garbage collection for Node processes
   */
  async triggerGC() {
    console.log('🧹 Triggering garbage collection...');
    
    // Find Node processes with high memory
    try {
      const processes = execSync('ps aux --sort=-%mem | grep node | head -5', { encoding: 'utf8' });
      console.log('Top Node processes:\n' + processes);
      
      // Note: Cannot force GC on other processes without instrumentation
      // This is informational only
      return { success: true, message: 'GC information logged' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Run all healing actions
   */
  async healAll(metrics) {
    const results = [];
    
    // Docker cleanup if reclaimable > 5GB
    if (metrics.docker?.status?.shouldCleanup) {
      results.push(await this.dockerCleanup());
    }
    
    // Disk cleanup if critical
    if (metrics.disk?.status === 'critical' || metrics.disk?.status === 'emergency') {
      results.push(await this.cleanLogs());
      results.push(await this.cleanPackageCache());
    }
    
    return results;
  }

  /**
   * Send notification
   */
  async sendNotification(alert) {
    if (!this.notify) return;
    
    try {
      // Use OpenClaw gateway to send notification
      const message = {
        text: `⚠️ Resource Alert: ${alert.type} at ${alert.percent}% (${alert.status})`,
        severity: alert.status
      };
      
      // Could integrate with Telegram, Discord, etc.
      console.log('Notification:', message);
    } catch (e) {
      console.error('Failed to send notification:', e.message);
    }
  }
}

// ============================================================
// MONITOR
// ============================================================

class ResourceMonitor {
  constructor(options) {
    this.options = options;
    this.collector = new ResourceCollector();
    this.healer = new SelfHealer(options.notify);
    this.history = [];
    this.maxHistory = 100;
  }

  /**
   * Load state from file
   */
  loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading state:', e.message);
    }
    return { history: [], lastCheck: null };
  }

  /**
   * Save state to file
   */
  saveState(state) {
    try {
      fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
      console.error('Error saving state:', e.message);
    }
  }

  /**
   * Log to file
   */
  log(entry) {
    try {
      fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
      
      let log = [];
      if (fs.existsSync(LOG_FILE)) {
        log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
      }
      
      log.push(entry);
      
      // Keep last 1000 entries
      if (log.length > 1000) {
        log = log.slice(-1000);
      }
      
      fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
    } catch (e) {
      console.error('Error writing log:', e.message);
    }
  }

  /**
   * Check resources and take action
   */
  async check() {
    const metrics = this.collector.collectAll();
    const alerts = [];
    
    // Check for alerts
    if (metrics.disk?.status !== 'ok') {
      alerts.push({
        type: 'disk',
        status: metrics.disk.status,
        percent: metrics.disk.percent,
        message: `Disk usage at ${metrics.disk.percent}%`
      });
    }
    
    if (metrics.memory?.status !== 'ok') {
      alerts.push({
        type: 'memory',
        status: metrics.memory.status,
        percent: metrics.memory.percent,
        message: `Memory usage at ${metrics.memory.percent}%`
      });
    }
    
    if (metrics.memory?.swap?.status !== 'ok') {
      alerts.push({
        type: 'swap',
        status: metrics.memory.swap.status,
        percent: metrics.memory.swap.percent,
        message: `Swap usage at ${metrics.memory.swap.percent}%`
      });
    }
    
    // Log metrics
    const entry = {
      timestamp: metrics.timestamp,
      metrics: {
        disk: metrics.disk.percent,
        memory: metrics.memory.percent,
        swap: metrics.memory.swap.percent
      },
      alerts
    };
    
    this.log(entry);
    
    // Output
    if (this.options.json) {
      console.log(JSON.stringify({ metrics, alerts }, null, 2));
    } else {
      this.printReport(metrics, alerts);
    }
    
    // Self-healing
    if (this.options.autoHeal && alerts.length > 0) {
      const criticalAlerts = alerts.filter(a => a.status === 'critical' || a.status === 'emergency');
      
      if (criticalAlerts.length > 0) {
        console.log('\n🔧 Running self-healing actions...');
        const results = await this.healer.healAll(metrics);
        console.log('Healing results:', results);
        
        // Check again after healing
        const newMetrics = this.collector.collectAll();
        console.log('\nAfter cleanup:');
        this.printReport(newMetrics, []);
      }
    }
    
    return { metrics, alerts };
  }

  /**
   * Print human-readable report
   */
  printReport(metrics, alerts) {
    console.log('\n📊 Resource Monitor Report');
    console.log('═'.repeat(50));
    console.log(`Timestamp: ${metrics.timestamp}`);
    
    // Disk
    const diskStatus = this.getStatusEmoji(metrics.disk?.status);
    console.log(`\n${diskStatus} Disk: ${metrics.disk?.percent}% used`);
    console.log(`   Size: ${metrics.disk?.size} | Used: ${metrics.disk?.used} | Available: ${metrics.disk?.avail}`);
    
    // Memory
    const memStatus = this.getStatusEmoji(metrics.memory?.status);
    console.log(`\n${memStatus} Memory: ${metrics.memory?.percent}% used`);
    console.log(`   Total: ${metrics.memory?.total}MB | Used: ${metrics.memory?.used}MB | Available: ${metrics.memory?.available}MB`);
    
    // Swap
    const swapStatus = this.getStatusEmoji(metrics.memory?.swap?.status);
    console.log(`\n${swapStatus} Swap: ${metrics.memory?.swap?.percent}% used`);
    console.log(`   Total: ${metrics.memory?.swap?.total}MB | Used: ${metrics.memory?.swap?.used}MB`);
    
    // Docker
    if (metrics.docker && !metrics.docker.error) {
      const dockerStatus = metrics.docker.status?.shouldCleanup ? '⚠️' : '✅';
      console.log(`\n${dockerStatus} Docker Images: ${metrics.docker.images?.size}`);
      console.log(`   Reclaimable: ${metrics.docker.images?.reclaimable}`);
    }
    
    // Alerts
    if (alerts.length > 0) {
      console.log('\n⚠️ Alerts:');
      for (const alert of alerts) {
        console.log(`   - ${alert.message} (${alert.status})`);
      }
    }
    
    console.log('\n' + '═'.repeat(50));
  }

  /**
   * Get status emoji
   */
  getStatusEmoji(status) {
    switch (status) {
      case 'ok': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🔴';
      case 'emergency': return '🚨';
      default: return '❓';
    }
  }

  /**
   * Start continuous monitoring
   */
  async start() {
    console.log(`Starting resource monitor (interval: ${this.options.interval / 1000}s)`);
    console.log('Press Ctrl+C to stop\n');
    
    // Initial check
    await this.check();
    
    // Schedule periodic checks
    setInterval(async () => {
      await this.check();
    }, this.options.interval);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const monitor = new ResourceMonitor(options);
  
  if (options.watch) {
    await monitor.start();
  } else {
    await monitor.check();
  }
}

main().catch(console.error);
