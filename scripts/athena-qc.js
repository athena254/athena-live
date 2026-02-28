#!/usr/bin/env node
/**
 * Athena Quick Command - CLI for quick agent interactions
 * Usage: node athena-qc.js <command> [args]
 * 
 * Commands:
 *   status          - Show all agent statuses
 *   session <agent> - Show session info for specific agent
 *   sessions        - List all active sessions
 *   send <agent> <message> - Send message to agent
 *   health          - Check gateway health
 *   metrics         - Show system metrics
 */

const http = require('http');
const https = require('https');
const { execSync, spawn } = require('child_process');

const GATEWAY_URL = 'http://127.0.0.1:18789';
const API_SERVER_URL = 'http://127.0.0.1:3847';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

function log(text, color = 'reset') {
  console.log(colorize(text, color));
}

function error(text) {
  console.error(colorize(`Error: ${text}`, 'red'));
}

function fetchJson(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON: ${data.slice(0, 100)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function getGatewayStatus() {
  try {
    return await fetchJson(`${GATEWAY_URL}/rpc?method=gateway.status`);
  } catch (e) {
    // Fallback to CLI
    try {
      const result = execSync('openclaw gateway call status --json 2>&1', {
        encoding: 'utf8',
        timeout: 10000
      });
      return JSON.parse(result);
    } catch (e2) {
      throw new Error('Cannot connect to gateway');
    }
  }
}

async function getLiveStatus() {
  try {
    return await fetchJson(`${API_SERVER_URL}/api/live-status`, 10000);
  } catch (e) {
    return { error: e.message };
  }
}

async function showStatus() {
  log('\n📊 Athena Agent Status', 'cyan');
  log('═'.repeat(50), 'gray');
  
  try {
    const status = await getGatewayStatus();
    
    if (status.error) {
      error(status.error);
      return;
    }
    
    // Show channel summary
    if (status.channelSummary) {
      log('\n📡 Channels:', 'yellow');
      for (const ch of status.channelSummary) {
        const icon = ch.active ? '🟢' : '⚪';
        log(`  ${icon} ${ch.channelId}: ${ch.sessionCount} sessions`, ch.active ? 'green' : 'gray');
      }
    }
    
    // Show sessions by agent
    if (status.sessions?.byAgent) {
      log('\n🤖 Agents:', 'yellow');
      const now = Date.now();
      const activeThreshold = 5 * 60 * 1000;
      
      for (const agent of status.sessions.byAgent) {
        if (agent.recent && agent.recent.length > 0) {
          const latest = agent.recent[0];
          const age = now - latest.updatedAt;
          const isActive = age < activeThreshold;
          
          const statusIcon = isActive ? '🔵' : '⚪';
          const statusText = isActive ? 'ACTIVE' : 'IDLE';
          const ageStr = age < 60000 ? `${Math.round(age/1000)}s ago` : `${Math.round(age/60000)}m ago`;
          
          log(`  ${statusIcon} ${colorize(agent.agentId, 'bright')}: ${colorize(statusText, isActive ? 'green' : 'gray')} (${ageStr})`, isActive ? 'green' : 'dim');
          
          if (latest.model) {
            log(`     └─ Model: ${latest.model}`, 'dim');
          }
        } else {
          log(`  ⚪ ${colorize(agent.agentId, 'bright')}: ${colorize('NO SESSIONS', 'gray')}`, 'dim');
        }
      }
    }
    
    log('\n' + '─'.repeat(50), 'gray');
  } catch (e) {
    error(e.message);
  }
}

async function showSession(agentId) {
  log(`\n📋 Session: ${agentId}`, 'cyan');
  log('═'.repeat(50), 'gray');
  
  try {
    const status = await getGatewayStatus();
    
    if (!status.sessions?.byAgent) {
      log('No session data available', 'yellow');
      return;
    }
    
    const agent = status.sessions.byAgent.find(a => a.agentId === agentId);
    
    if (!agent) {
      error(`Agent '${agentId}' not found`);
      log('\nAvailable agents:', 'yellow');
      for (const a of status.sessions.byAgent) {
        log(`  - ${a.agentId}`, 'reset');
      }
      return;
    }
    
    if (!agent.recent || agent.recent.length === 0) {
      log(`No sessions for ${agentId}`, 'yellow');
      return;
    }
    
    log(`\nTotal sessions: ${agent.count}`, 'reset');
    
    for (let i = 0; i < Math.min(agent.recent.length, 5); i++) {
      const s = agent.recent[i];
      const age = Date.now() - s.updatedAt;
      const ageStr = age < 60000 ? `${Math.round(age/1000)}s ago` : `${Math.round(age/60000)}m ago`;
      
      log(`\n[${i + 1}] ${ageStr}`, 'dim');
      if (s.model) log(`    Model: ${s.model}`, 'reset');
      if (s.inputTokens) log(`    Input tokens: ${s.inputTokens.toLocaleString()}`, 'reset');
      if (s.outputTokens) log(`    Output tokens: ${s.outputTokens.toLocaleString()}`, 'reset');
    }
  } catch (e) {
    error(e.message);
  }
}

async function showSessions() {
  log('\n📋 All Active Sessions', 'cyan');
  log('═'.repeat(50), 'gray');
  
  try {
    const status = await getGatewayStatus();
    const now = Date.now();
    const activeThreshold = 5 * 60 * 1000;
    
    if (!status.sessions?.byAgent) {
      log('No session data', 'yellow');
      return;
    }
    
    let totalSessions = 0;
    let activeCount = 0;
    
    for (const agent of status.sessions.byAgent) {
      if (agent.recent && agent.recent.length > 0) {
        totalSessions += agent.count;
        
        for (const s of agent.recent) {
          const age = now - s.updatedAt;
          const isActive = age < activeThreshold;
          if (isActive) activeCount++;
          
          const icon = isActive ? '🔵' : '⚪';
          const ageStr = age < 60000 ? `${Math.round(age/1000)}s` : `${Math.round(age/60000)}m`;
          
          log(`\n${icon} ${agent.agentId}`, isActive ? 'green' : 'dim');
          log(`   Age: ${ageStr}`, 'gray');
          if (s.model) log(`   Model: ${s.model}`, 'gray');
          if (s.inputTokens || s.outputTokens) {
            log(`   Tokens: ${(s.inputTokens || 0).toLocaleString()} in / ${(s.outputTokens || 0).toLocaleString()} out`, 'gray');
          }
        }
      }
    }
    
    log('\n' + '─'.repeat(50), 'gray');
    log(`Total: ${totalSessions} sessions, ${activeCount} active`, 'cyan');
  } catch (e) {
    error(e.message);
  }
}

async function checkHealth() {
  log('\n💚 Gateway Health', 'cyan');
  log('═'.repeat(50), 'gray');
  
  try {
    const status = await getGatewayStatus();
    
    log(`\nStatus: ${colorize(status.status || 'unknown', 'green')}`, 'green');
    
    if (status.startTime) {
      const uptime = Date.now() - new Date(status.startTime).getTime();
      const hours = Math.round(uptime / 3600000);
      log(`Uptime: ${hours} hours`, 'reset');
    }
    
    if (status.queuedSystemEvents) {
      log(`Queued events: ${status.queuedSystemEvents.length}`, 'reset');
    }
    
    // Try live status API
    try {
      const live = await getLiveStatus();
      if (!live.error) {
        log(`\nLive API: ${colorize('connected', 'green')}`, 'green');
        log(`  Sessions: ${live.sessions?.total || 0}`, 'gray');
        log(`  Active agents: ${live.sessions?.activeAgents || 0}`, 'gray');
      }
    } catch (e) {
      log(`\nLive API: ${colorize('not available', 'yellow')}`, 'yellow');
    }
  } catch (e) {
    error(e.message);
  }
}

async function showMetrics() {
  log('\n📈 System Metrics', 'cyan');
  log('═'.repeat(50), 'gray');
  
  try {
    const live = await getLiveStatus();
    
    if (live.error) {
      error(live.error);
      return;
    }
    
    log(`\nTimestamp: ${new Date(live.timestamp).toLocaleString()}`, 'dim');
    
    if (live.sessions) {
      log(`\nSessions:`, 'yellow');
      log(`  Total: ${live.sessions.total}`, 'reset');
      log(`  Active agents: ${live.sessions.activeAgents}`, 'reset');
      log(`  Total tokens: ${live.sessions.totalTokens.toLocaleString()}`, 'reset');
      
      if (live.sessions.byAgent && live.sessions.byAgent.length > 0) {
        log(`\nBy Agent:`, 'yellow');
        for (const a of live.sessions.byAgent) {
          const icon = a.isActive ? '🔵' : '⚪';
          log(`  ${icon} ${a.agentId}: ${a.sessions} sessions, ${(a.inputTokens + a.outputTokens).toLocaleString()} tokens`, a.isActive ? 'green' : 'dim');
        }
      }
    }
    
    if (live.heartbeat) {
      log(`\nHeartbeat:`, 'yellow');
      log(`  Last: ${live.heartbeat.last || 'unknown'}`, 'reset');
      log(`  Interval: ${live.heartbeat.intervalMs || 'unknown'}ms`, 'reset');
    }
  } catch (e) {
    error(e.message);
  }
}

async function sendToAgent(agentId, message) {
  log(`\n📤 Sending to ${agentId}: "${message}"`, 'cyan');
  
  try {
    // Try to send via gateway RPC
    const postData = JSON.stringify({
      method: 'session.send',
      params: {
        target: agentId,
        message: message
      }
    });
    
    const result = await new Promise((resolve, reject) => {
      const req = http.request(`${GATEWAY_URL}/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.write(postData);
      req.end();
    });
    
    log(`\n✅ Message sent!`, 'green');
    log(result.slice(0, 500), 'dim');
  } catch (e) {
    error(`Failed to send: ${e.message}`);
    log('\nNote: Gateway may not support direct messaging', 'yellow');
  }
}

function showHelp() {
  log(`
${colorize('Athena Quick Command', 'cyan')} - CLI for Athena agent interactions

${colorize('Usage:', 'yellow')}
  node athena-qc.js <command> [args]

${colorize('Commands:', 'yellow')}
  status              Show all agent statuses
  session <agent>     Show session info for specific agent  
  sessions            List all active sessions
  send <agent> <msg>  Send message to an agent
  health              Check gateway health
  metrics             Show system metrics
  help                Show this help

${colorize('Examples:', 'yellow')}
  node athena-qc.js status
  node athena-qc.js session sterling
  node athena-qc.js sessions
  node athena-qc.js health
  node athena-qc.js metrics
  node athena-qc.js send sterling "Hello!"
`);
}

// Main
const args = process.argv.slice(2);
const command = args[0] || 'help';

(async () => {
  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'session':
      if (!args[1]) {
        error('Usage: session <agent-id>');
        process.exit(1);
      }
      await showSession(args[1]);
      break;
    case 'sessions':
      await showSessions();
      break;
    case 'send':
      if (!args[1] || !args[2]) {
        error('Usage: send <agent-id> <message>');
        process.exit(1);
      }
      await sendToAgent(args[1], args.slice(2).join(' '));
      break;
    case 'health':
      await checkHealth();
      break;
    case 'metrics':
      await showMetrics();
      break;
    case 'help':
    default:
      showHelp();
  }
})();
