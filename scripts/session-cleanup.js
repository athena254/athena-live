#!/usr/bin/env node
/**
 * Session Cleanup Utility
 * Removes stale sessions and cleans up old session data
 * 
 * Usage: node session-cleanup.js [options]
 * 
 * Options:
 *   --dry-run      Show what would be cleaned without doing it
 *   --age N        Sessions older than N hours (default: 24)
 *   --agents       Comma-separated list of agents to clean (default: all)
 *   --json         Output JSON format
 *   --verbose      Show detailed output
 *   --archive      Archive sessions before deletion
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

const GATEWAY_URL = 'http://127.0.0.1:18789';

const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  age: parseInt(args.find(a => a.startsWith('--age='))?.split('=')[1] || '24'),
  agents: args.find(a => a.startsWith('--agents='))?.split('=')[1]?.split(',') || null,
  json: args.includes('--json'),
  verbose: args.includes('--verbose'),
  archive: args.includes('--archive')
};

const ARCHIVE_DIR = '/root/.openclaw/workspace/session-archives';

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
      const result = execSync('openclaw gateway call status --json 2>&1', {
        encoding: 'utf8', timeout: 10000
      });
      return JSON.parse(result);
    } catch (e2) {
      throw new Error('Cannot connect to gateway');
    }
  }
}

function findStaleSessions(status) {
  const now = Date.now();
  const ageMs = options.age * 60 * 60 * 1000;
  const stale = [];
  
  if (!status.sessions?.byAgent) return stale;
  
  for (const agent of status.sessions.byAgent) {
    // Filter by agent if specified
    if (options.agents && !options.agents.includes(agent.agentId)) {
      if (options.verbose) log(`Skipping ${agent.agentId} (not in target list)`, 'dim');
      continue;
    }
    
    if (!agent.recent) continue;
    
    for (const session of agent.recent) {
      const age = now - session.updatedAt;
      
      if (age > ageMs) {
        stale.push({
          agentId: agent.agentId,
          sessionId: session.sessionId || session.id || 'unknown',
          updatedAt: session.updatedAt,
          age: age,
          ageHours: Math.round(age / 3600000 * 10) / 10,
          model: session.model,
          inputTokens: session.inputTokens || 0,
          outputTokens: session.outputTokens || 0
        });
      }
    }
  }
  
  return stale;
}

async function cleanupSession(session) {
  // Try to remove via gateway RPC
  try {
    const postData = JSON.stringify({
      method: 'session.remove',
      params: {
        agentId: session.agentId,
        sessionId: session.sessionId
      }
    });
    
    await new Promise((resolve, reject) => {
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
      req.write(postData);
      req.end();
    });
    
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function archiveSession(session) {
  if (!options.archive) return null;
  
  try {
    // Ensure archive directory exists
    if (!fs.existsSync(ARCHIVE_DIR)) {
      fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${session.agentId}-${session.sessionId}-${timestamp}.json`;
    const filepath = path.join(ARCHIVE_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(session, null, 2), 'utf8');
    
    return filepath;
  } catch (e) {
    return null;
  }
}

async function main() {
  log('\n🧹 Session Cleanup Utility', 'cyan');
  log('═'.repeat(50), 'gray');
  log(`Finding sessions older than ${options.age} hours\n`, 'dim');
  
  if (options.dryRun) {
    log('[DRY-RUN MODE - No sessions will be modified]\n', 'yellow');
  }
  
  if (options.archive && !options.dryRun) {
    log(`Archiving to: ${ARCHIVE_DIR}\n`, 'dim');
  }
  
  try {
    const status = await getGatewayStatus();
    const staleSessions = findStaleSessions(status);
    
    if (staleSessions.length === 0) {
      log('No stale sessions found.', 'green');
      return;
    }
    
    log(`Found ${staleSessions.length} stale session(s):\n`, 'cyan');
    
    // Group by agent
    const byAgent = {};
    for (const session of staleSessions) {
      if (!byAgent[session.agentId]) byAgent[session.agentId] = [];
      byAgent[session.agentId].push(session);
    }
    
    for (const [agentId, sessions] of Object.entries(byAgent)) {
      log(`\n🤖 ${agentId}: ${sessions.length} stale session(s)`, 'yellow');
      for (const session of sessions) {
        log(`   - ${session.sessionId} (${session.ageHours}h old)`, 'dim');
        if (options.verbose && session.model) {
          log(`     Model: ${session.model}`, 'dim');
        }
      }
    }
    
    if (options.dryRun) {
      log(`\n[Dry run complete. Run without --dry-run to clean up sessions.]`, 'yellow');
      return;
    }
    
    // Clean up
    let cleaned = 0;
    let archived = 0;
    let failed = 0;
    
    for (const session of staleSessions) {
      // Archive first if enabled
      if (options.archive) {
        const archivePath = archiveSession(session);
        if (archivePath) {
          archived++;
          log(`📦 Archived: ${session.agentId}/${session.sessionId}`, 'dim');
        }
      }
      
      // Then try to clean
      const result = await cleanupSession(session);
      
      if (result.success) {
        cleaned++;
        log(`🗑️  Removed: ${session.agentId}/${session.sessionId}`, 'green');
      } else {
        failed++;
        log(`❌ Failed to remove ${session.agentId}/${session.sessionId}: ${result.error}`, 'red');
      }
    }
    
    log(`\n📊 Summary:`, 'cyan');
    log(`  Total stale: ${staleSessions.length}`, 'reset');
    log(`  Archived: ${archived}`, archived > 0 ? 'green' : 'dim');
    log(`  Cleaned: ${cleaned}`, cleaned > 0 ? 'green' : 'dim');
    log(`  Failed: ${failed}`, failed > 0 ? 'red' : 'dim');
    
  } catch (e) {
    log(`Error: ${e.message}`, 'red');
    process.exit(1);
  }
}

main();
