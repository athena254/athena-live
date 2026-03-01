#!/usr/bin/env node
/**
 * API Health Check Script for Athena System
 * Tests all critical endpoints and reports status
 * 
 * Usage: node api-health-check.js [--watch] [--interval=5000]
 */

const ENDPOINTS = [
  { name: 'Gateway Health', url: '/health', method: 'GET', critical: true },
  { name: 'Gateway Status', url: '/status', method: 'GET', critical: true },
  { name: 'List Sessions', url: '/sessions', method: 'GET', critical: false },
  { name: 'List Agents', url: '/agents', method: 'GET', critical: false },
  { name: 'Metrics', url: '/metrics', method: 'GET', critical: false },
];

const CONFIG = {
  baseUrl: process.env.ATHENA_URL || 'http://localhost:3000',
  timeout: 5000,
  retries: 2,
};

class HealthCheck {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async checkEndpoint(endpoint) {
    const start = Date.now();
    let lastError = null;

    for (let attempt = 0; attempt <= CONFIG.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.timeout);

        const response = await fetch(`${CONFIG.baseUrl}${endpoint.url}`, {
          method: endpoint.method,
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });

        clearTimeout(timeout);
        
        const latency = Date.now() - start;
        const status = response.ok ? 'healthy' : 'degraded';
        
        return {
          name: endpoint.name,
          url: endpoint.url,
          status,
          latency,
          code: response.status,
          critical: endpoint.critical,
          error: null
        };
      } catch (error) {
        lastError = error.message;
        if (attempt < CONFIG.retries) await this.delay(500);
      }
    }

    return {
      name: endpoint.name,
      url: endpoint.url,
      status: 'down',
      latency: Date.now() - start,
      code: 0,
      critical: endpoint.critical,
      error: lastError
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runHealthCheck() {
    console.clear();
    console.log('🏥 Athena API Health Check');
    console.log('─'.repeat(50));
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Base URL: ${CONFIG.baseUrl}`);
    console.log('');

    this.results = await Promise.all(
      ENDPOINTS.map(ep => this.checkEndpoint(ep))
    );

    this.displayResults();
    this.summarize();
  }

  displayResults() {
    const statusIcons = { healthy: '✅', degraded: '⚠️', down: '❌' };
    
    this.results.forEach(result => {
      const icon = statusIcons[result.status];
      const latencyStr = result.latency < 1000 
        ? `${result.latency}ms` 
        : `${(result.latency / 1000).toFixed(1)}s`;
      
      console.log(`${icon} ${result.name}`);
      console.log(`   URL: ${result.url} | Status: ${result.code || 'N/A'} | Latency: ${latencyStr}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
  }

  summarize() {
    console.log('');
    console.log('─'.repeat(50));
    
    const healthy = this.results.filter(r => r.status === 'healthy').length;
    const degraded = this.results.filter(r => r.status === 'degraded').length;
    const down = this.results.filter(r => r.status === 'down').length;
    const criticalDown = this.results.filter(r => r.critical && r.status === 'down').length;

    console.log(`Summary: ${healthy} ✅ | ${degraded} ⚠️ | ${down} ❌`);
    
    const avgLatency = this.results.reduce((sum, r) => sum + r.latency, 0) / this.results.length;
    console.log(`Avg Latency: ${avgLatency.toFixed(0)}ms`);
    
    const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(`Check Duration: ${totalTime}s`);

    if (criticalDown > 0) {
      console.log('');
      console.log('🚨 CRITICAL: One or more critical endpoints are DOWN!');
      process.exit(1);
    }
  }

  startWatching(intervalMs = 5000) {
    console.log(`\n🔄 Watching mode enabled (interval: ${intervalMs}ms)\n`);
    this.runHealthCheck();
    setInterval(() => this.runHealthCheck(), intervalMs);
  }
}

// CLI Handling
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const intervalArg = args.find(a => a.startsWith('--interval='));
const interval = intervalArg ? parseInt(intervalArg.split('=')[1]) : 5000;

const healthCheck = new HealthCheck();

if (watchMode) {
  healthCheck.startWatching(interval);
} else {
  healthCheck.runHealthCheck().then(() => {
    const criticalDown = healthCheck.results.filter(r => r.critical && r.status === 'down').length;
    process.exit(criticalDown > 0 ? 1 : 0);
  });
}
