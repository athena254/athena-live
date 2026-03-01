#!/usr/bin/env node
/**
 * Agent Heartbeat Monitor
 * Tracks all agent sessions and monitors their activity status
 * 
 * Usage: node agent-heartbeat-monitor.js [options]
 * 
 * Options:
 *   --watch        Continuous monitoring mode
 *   --interval N   Check interval in seconds (default: 30)
 *   --json         Output JSON format
 *   --alerts       Show only alerts (inactive agents)
 *   --threshold N  Inactivity threshold in minutes (default: 5)
 */

const http = require('http');
const https = require('https');

const GATEWAY_URL = 'http://127.0.0.1:18789';
const API_SERVER_URL = 'http://127.0.0.1:3847';

const args = process.argv.slice(2);
const options = {
  watch: args.includes('--watch'),
  interval: parseInt(args.find(a => a.startsWith('--interval='))?.split('=')[1] || '30') * 1000,
  json: args.includes('--json'),
  alerts: args.includes('--alerts'),
  threshold: parseInt(args.find(a => a.startsWith('--threshold='))?.split('=')[1] || '5') * 60 * 1000
};

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan: '\x1b[36m', gray: '\x1b[90m', bright: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function log(text, color = 'reset') {
  if (!options.json) console.log(colorize(text, color));
}

function fetchJson(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function getGatewayStatus() {
  try {
    return await fetchJson(`${GATEWAY_URL}/rpc?method=gateway.status`);
  } catch (e) {
    try {
      const { execSync } = require('child_process');
      const result = execSync('openclaw gateway call status --json 2>&1', {
        encoding: 'utf8', timeout: 10000
      });
      return JSON.parse(result);
    } catch (e2) {
      throw new Error('Cannot connect to gateway');
    }
  }
}

function analyzeAgents(status) {
  const now = Date.now();
  const agents = [];
  
  if (!status.sessions?.byAgent) return agents;
  
  for (const agent of status.sessions.byAgent) {
    const latest = agent.recent?.[0];
    const age = latest ? now - latest.updatedAt : null;
    const isActive = age !== null && age < options.threshold;
    
    agents.push({
      agentId: agent.agentId,
      sessionCount: agent.count || 0,
      isActive,
      lastActivity: latest ? new Date(latest.updatedAt).toISOString() : null,
      inactiveFor: age ? Math.round(age / 60000) : null,
      model: latest?.model || null,
      inputTokens: latest?.inputTokens || 0,
      outputTokens: latest?.outputTokens || 0
    });
  }
  
  return agents;
}

function formatOutput(agents) {
  const output = { timestamp: new Date().toISOString(), agents };
  
  if (options.json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  
  const activeAgents = agents.filter(a => a.isActive);
  const inactiveAgents = agents.filter(a => !a.isActive);
  
  console.clear?.();
  log(`\n💓 Agent Heartbeat Monitor`, 'cyan');
  log(`═`.repeat(50), 'gray');
  log(`Time: ${new Date().toLocaleString()}`, 'dim');
  log(`Threshold: ${options.threshold / 60000} minutes\n`, 'dim');
  
  if (activeAgents.length > 0) {
    log(`🔵 Active Agents (${activeAgents.length})`, 'green');
    for (const agent of activeAgents) {
      const icon = agent.isActive ? '🟢' : '⚪';
      log(`  ${icon} ${colorize(agent.agentId, 'bright')}: ${agent.sessionCount} sessions`, 'green');
      if (agent.model) log(`     └─ ${agent.model}`, 'dim');
    }
  }
  
  if (!options.alerts && inactiveAgents.length > 0) {
    log(`\n⚪ Inactive Agents (${inactiveAgents.length})`, 'yellow');
    for (const agent of inactiveAgents) {
      const age = agent.inactiveFor;
      const ageStr = age < 60 ? `${age}m` : `${Math.round(age / 60)}h`;
      log(`  ⚪ ${agent.agentId}: idle ${ageStr}`, 'yellow');
    }
  }
  
  if (inactiveAgents.length > 0) {
    log(`\n⚠️  Alerts (${inactiveAgents.length} inactive)`, 'red');
    for (const agent of inactiveAgents) {
      const age = agent.inactiveFor;
      const ageStr = age < 60 ? `${age}m` : `${Math.round(age / 60)}h`;
      log(`  ❌ ${agent.agentId}: inactive for ${ageStr}`, 'red');
    }
  }
  
  log(`\nTotal: ${agents.length} agents | ${activeAgents.length} active | ${inactiveAgents.length} inactive`, 'cyan');
}

async function run() {
  try {
    const status = await getGatewayStatus();
    const agents = analyzeAgents(status);
    formatOutput(agents);
    
    if (options.watch) {
      setTimeout(run, options.interval);
    }
  } catch (e) {
    if (options.json) {
      console.log(JSON.stringify({ error: e.message, timestamp: new Date().toISOString() }));
    } else {
      log(`Error: ${e.message}`, 'red');
      if (options.watch) setTimeout(run, options.interval);
    }
  }
}

run();
