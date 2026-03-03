#!/usr/bin/env node
/**
 * Athena Agent Health Check with Fault Tolerance Integration
 * 
 * Monitors all Athena agents and reports their health status.
 * Integrates with circuit breakers and event sourcing.
 * 
 * Usage:
 *   node agent-health-check.js [--verbose] [--json]
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const http = require('http');

const WORKSPACE = '/root/.openclaw/workspace';
const PROTOTYPES_DIR = path.join(WORKSPACE, 'prototypes');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');

// Agent definitions from SOUL.md
const AGENTS = {
  athena: { name: 'Athena', role: 'Main Agent', priority: 'critical' },
  sterling: { name: 'Sterling', role: 'Finance/Bidding', priority: 'high' },
  ishtar: { name: 'Ishtar', role: 'PAI Architecture', priority: 'high' },
  delver: { name: 'Delver', role: 'Research', priority: 'medium' },
  squire: { name: 'Squire', role: 'Housekeeping', priority: 'medium' },
  felicity: { name: 'Felicity', role: 'Coding', priority: 'high' },
  prometheus: { name: 'Prometheus', role: 'Deployment', priority: 'medium' },
  cisco: { name: 'Cisco', role: 'Network', priority: 'medium' },
  themis: { name: 'THEMIS', role: 'Oversight', priority: 'low' }
};

// ============================================================
// HEALTH CHECK FUNCTIONS
// ============================================================

class AgentHealthChecker {
  constructor() {
    this.results = {};
    this.eventStore = null;
  }

  /**
   * Check if an agent session is active
   */
  checkSessionActive(agentId) {
    try {
      // Check if there's a session file for this agent
      const sessionFile = path.join(WORKSPACE, 'memory', `${agentId}-session.json`);
      if (fs.existsSync(sessionFile)) {
        const session = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        const lastActive = new Date(session.lastActive);
        const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
        
        return {
          active: hoursSinceActive < 24,
          lastActive: session.lastActive,
          hoursSinceActive: Math.round(hoursSinceActive * 10) / 10
        };
      }
      
      // Check process list for agent
      const processes = execSync(`ps aux | grep -i "${agentId}" | grep -v grep || true`, { encoding: 'utf8' });
      if (processes.trim()) {
        return { active: true, process: processes.trim().split('\n')[0] };
      }
      
      return { active: false, reason: 'No session or process found' };
    } catch (e) {
      return { active: false, error: e.message };
    }
  }

  /**
   * Check agent memory file
   */
  checkMemoryFile(agentId) {
    try {
      const memoryFile = path.join(MEMORY_DIR, `${agentId}-state.json`);
      if (fs.existsSync(memoryFile)) {
        const content = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
        const lastUpdated = content.last_updated ? new Date(content.last_updated) : null;
        
        return {
          exists: true,
          lastUpdated: lastUpdated?.toISOString(),
          status: content.status,
          topic: content.current_topic
        };
      }
      
      // Check for daily memory files
      const today = new Date().toISOString().split('T')[0];
      const dailyFile = path.join(MEMORY_DIR, `${today}.md`);
      if (fs.existsSync(dailyFile)) {
        const stats = fs.statSync(dailyFile);
        return {
          exists: true,
          type: 'daily',
          lastModified: stats.mtime.toISOString(),
          size: stats.size
        };
      }
      
      return { exists: false };
    } catch (e) {
      return { exists: false, error: e.message };
    }
  }

  /**
   * Check OpenClaw gateway health
   */
  async checkGatewayHealth() {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 18789,
        path: '/health',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              healthy: res.statusCode === 200,
              statusCode: res.statusCode,
              response: data.substring(0, 200)
            });
          } catch (e) {
            resolve({ healthy: false, error: e.message });
          }
        });
      });
      
      req.on('error', (e) => {
        resolve({ healthy: false, error: e.message });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({ healthy: false, error: 'timeout' });
      });
      
      req.end();
    });
  }

  /**
   * Check circuit breaker states
   */
  checkCircuitBreakers() {
    try {
      const stateFile = path.join(WORKSPACE, 'memory', 'circuit-breaker-state.json');
      if (fs.existsSync(stateFile)) {
        return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      }
      
      // Default state
      return {
        openai: { state: 'closed', failures: 0 },
        telegram: { state: 'closed', failures: 0 },
        github: { state: 'closed', failures: 0 },
        beelancer: { state: 'closed', failures: 0 }
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * Check system resources
   */
  checkSystemResources() {
    try {
      // Memory
      const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
      const getValue = (name) => {
        const line = meminfo.split('\n').find(l => l.startsWith(name));
        return line ? parseInt(line.split(/\s+/)[1]) : 0;
      };
      
      const totalMem = getValue('MemTotal');
      const availMem = getValue('MemAvailable');
      const memPercent = Math.round((1 - availMem / totalMem) * 100);
      
      // Swap
      const swapTotal = getValue('SwapTotal');
      const swapFree = getValue('SwapFree');
      const swapPercent = swapTotal > 0 ? Math.round((1 - swapFree / swapTotal) * 100) : 0;
      
      // Disk
      const dfOutput = execSync('df -h / --output=pcent | tail -1', { encoding: 'utf8' });
      const diskPercent = parseInt(dfOutput.trim().replace('%', ''));
      
      return {
        memory: { percent: memPercent, status: memPercent > 90 ? 'critical' : memPercent > 80 ? 'warning' : 'ok' },
        swap: { percent: swapPercent, status: swapPercent > 90 ? 'critical' : swapPercent > 70 ? 'warning' : 'ok' },
        disk: { percent: diskPercent, status: diskPercent > 85 ? 'critical' : diskPercent > 70 ? 'warning' : 'ok' }
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * Run full health check for all agents
   */
  async runFullCheck() {
    const timestamp = new Date().toISOString();
    const results = {
      timestamp,
      overall: 'healthy',
      gateway: null,
      system: null,
      agents: {},
      circuitBreakers: null
    };
    
    // Check gateway
    results.gateway = await this.checkGatewayHealth();
    if (!results.gateway.healthy) {
      results.overall = 'degraded';
    }
    
    // Check system resources
    results.system = this.checkSystemResources();
    if (results.system.memory?.status === 'critical' || 
        results.system.swap?.status === 'critical' ||
        results.system.disk?.status === 'critical') {
      results.overall = 'critical';
    } else if (results.system.memory?.status === 'warning' || 
               results.system.swap?.status === 'warning' ||
               results.system.disk?.status === 'warning') {
      results.overall = 'degraded';
    }
    
    // Check each agent
    for (const [id, config] of Object.entries(AGENTS)) {
      const sessionCheck = this.checkSessionActive(id);
      const memoryCheck = this.checkMemoryFile(id);
      
      results.agents[id] = {
        ...config,
        session: sessionCheck,
        memory: memoryCheck,
        status: sessionCheck.active ? 'active' : 'inactive'
      };
      
      if (config.priority === 'critical' && !sessionCheck.active) {
        results.overall = 'critical';
      }
    }
    
    // Check circuit breakers
    results.circuitBreakers = this.checkCircuitBreakers();
    
    return results;
  }

  /**
   * Print human-readable report
   */
  printReport(results, verbose = false) {
    console.log('\n🏥 Athena Agent Health Report');
    console.log('═'.repeat(60));
    console.log(`Timestamp: ${results.timestamp}`);
    console.log(`Overall Status: ${this.getStatusEmoji(results.overall)} ${results.overall.toUpperCase()}`);
    
    // Gateway
    console.log('\n📡 Gateway:');
    console.log(`   Status: ${results.gateway?.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    if (!results.gateway?.healthy && results.gateway?.error) {
      console.log(`   Error: ${results.gateway.error}`);
    }
    
    // System Resources
    console.log('\n💻 System Resources:');
    const { memory, swap, disk } = results.system;
    console.log(`   Memory: ${this.getStatusEmoji(memory?.status)} ${memory?.percent}% used`);
    console.log(`   Swap:   ${this.getStatusEmoji(swap?.status)} ${swap?.percent}% used`);
    console.log(`   Disk:   ${this.getStatusEmoji(disk?.status)} ${disk?.percent}% used`);
    
    // Agents
    console.log('\n🤖 Agents:');
    for (const [id, agent] of Object.entries(results.agents)) {
      const status = agent.status === 'active' ? '✅' : '❌';
      console.log(`   ${status} ${agent.name} (${agent.role})`);
      if (verbose && agent.session?.lastActive) {
        console.log(`      Last active: ${agent.session.lastActive}`);
      }
    }
    
    // Circuit Breakers
    if (results.circuitBreakers && !results.circuitBreakers.error) {
      console.log('\n🔌 Circuit Breakers:');
      for (const [api, state] of Object.entries(results.circuitBreakers)) {
        if (typeof state === 'object' && state.state) {
          const emoji = state.state === 'closed' ? '✅' : 
                       state.state === 'open' ? '🔴' : '🟡';
          console.log(`   ${emoji} ${api}: ${state.state} (${state.failures} failures)`);
        }
      }
    }
    
    console.log('\n' + '═'.repeat(60));
  }

  /**
   * Get status emoji
   */
  getStatusEmoji(status) {
    switch (status) {
      case 'healthy': case 'ok': return '✅';
      case 'degraded': case 'warning': return '⚠️';
      case 'critical': return '🔴';
      case 'inactive': return '❌';
      default: return '❓';
    }
  }

  /**
   * Save health check to event store
   */
  async saveToEventStore(results) {
    try {
      const eventStorePath = path.join(MEMORY_DIR, 'events', 'system-health.jsonl');
      fs.mkdirSync(path.dirname(eventStorePath), { recursive: true });
      
      const event = {
        eventId: `evt_${Date.now()}`,
        aggregateId: 'system-health',
        eventType: 'health_check',
        timestamp: results.timestamp,
        payload: results
      };
      
      fs.appendFileSync(eventStorePath, JSON.stringify(event) + '\n');
    } catch (e) {
      console.error('Failed to save to event store:', e.message);
    }
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const checker = new AgentHealthChecker();
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  const json = process.argv.includes('--json');
  const save = process.argv.includes('--save');
  
  const results = await checker.runFullCheck();
  
  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    checker.printReport(results, verbose);
  }
  
  if (save) {
    await checker.saveToEventStore(results);
    console.log('Saved to event store');
  }
  
  // Exit with error code if critical
  if (results.overall === 'critical') {
    process.exit(1);
  }
}

main().catch(console.error);
