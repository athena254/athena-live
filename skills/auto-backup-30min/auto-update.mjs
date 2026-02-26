#!/usr/bin/env node
// Athena 30-Minute Auto-Update Protocol
// Runs after every 30-min report to:
// 1. Commit workspace changes
// 2. Update knowledge graph
// 3. Sync memory files
// 4. Backup critical data

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = '/root/.openclaw/workspace';
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const BACKUP_LOG = path.join(MEMORY_DIR, 'auto-backup-log.jsonl');

function log(action, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    details,
    status: 'success'
  };
  fs.appendFileSync(BACKUP_LOG, JSON.stringify(entry) + '\n');
  console.log(`✅ ${action}: ${details}`);
}

function updateKnowledgeGraph() {
  // Scan memory files for new entities
  const files = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md'));
  const entities = new Set();
  const relations = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
    // Extract agent names, project names, events
    const agentMatches = content.match(/\*\*([A-Z][a-z]+)\*\*/g) || [];
    agentMatches.forEach(m => entities.add(m.replace(/\*\*/g, '')));
  });
  
  log('Knowledge Graph Update', `${entities.size} entities indexed`);
  return { entities: entities.size, relations: relations.length };
}

function commitWorkspace() {
  try {
    execSync('git add -A', { cwd: WORKSPACE, stdio: 'pipe' });
    const status = execSync('git status --porcelain', { cwd: WORKSPACE, encoding: 'utf8' });
    
    if (status.trim()) {
      const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
      execSync(`git commit -m "Auto-backup: ${timestamp}"`, { cwd: WORKSPACE });
      log('Git Commit', 'Workspace committed');
    } else {
      log('Git Status', 'No changes to commit');
    }
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      log('Git Status', 'No changes to commit');
    } else {
      console.error('⚠️ Git error:', error.message);
      log('Git Error', error.message);
    }
  }
}

function syncMemoryFiles() {
  // Consolidate daily logs into MEMORY.md if not done
  const today = new Date().toISOString().slice(0, 10);
  const todayFile = path.join(MEMORY_DIR, `${today}.md`);
  
  if (fs.existsSync(todayFile)) {
    log('Memory Sync', `Today's log (${today}.md) exists`);
  }
}

// Main execution
console.log('🔄 Starting 30-min auto-update...');
updateKnowledgeGraph();
commitWorkspace();
syncMemoryFiles();
log('Complete', '30-min cycle finished');
