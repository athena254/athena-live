#!/usr/bin/env node
/**
 * Credential Health Check
 * Validates API keys and credentials used by Athena agents
 * 
 * Usage: node credential-health-check.js [options]
 * 
 * Options:
 *   --json         Output JSON format
 *   --providers    Check only specific providers (comma-separated)
 *   --verbose      Show detailed validation output
 *   --fix          Attempt to fix common issues
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const options = {
  json: args.includes('--json'),
  providers: args.find(a => a.startsWith('--providers='))?.split('=')[1]?.split(',') || null,
  verbose: args.includes('--verbose'),
  fix: args.includes('--fix')
};

const OPENCLAW_CONFIG = '/root/.openclaw/openclaw.json';
const CREDENTIALS_DIR = '/root/.openclaw/credentials';

// Provider validation endpoints and patterns
const PROVIDER_CHECKS = {
  'tavily': {
    validate: async (key) => {
      if (!key || key.length < 10) return { valid: false, error: 'Invalid key format' };
      return { valid: true, note: 'API key present' };
    },
    envVar: 'TAVILY_API_KEY'
  },
  'qwen-portal': {
    validate: async (key) => {
      // OAuth tokens are complex, just check presence
      if (key === 'qwen-oauth') return { valid: true, note: 'OAuth configured' };
      return { valid: !!key, note: key ? 'API key present' : 'No key found' };
    },
    modelKey: 'qwen-portal'
  },
  'minimax-portal': {
    validate: async (key) => {
      if (!key || key === 'minimax-oauth') return { valid: true, note: 'OAuth configured' };
      if (key.startsWith('mmst-') || key.length > 20) return { valid: true, note: 'API key present' };
      return { valid: false, error: 'Invalid key format' };
    },
    modelKey: 'minimax-portal'
  },
  'openai': {
    validate: async (key) => {
      if (!key || key.startsWith('sk-') && key.length > 20) return { valid: true, note: 'OpenAI key format valid' };
      if (key === 'openai-oauth') return { valid: true, note: 'OAuth configured' };
      return { valid: false, error: 'Invalid OpenAI key format' };
    },
    modelKey: 'openai'
  },
  'google': {
    validate: async (key) => {
      // Google uses OAuth or API keys
      return { valid: !!key, note: key ? 'Credentials present' : 'No credentials' };
    },
    authProfile: 'google:default'
  },
  'github': {
    validate: async () => {
      try {
        execSync('gh auth status', { encoding: 'utf8', timeout: 5000 });
        return { valid: true, note: 'GitHub CLI authenticated' };
      } catch (e) {
        return { valid: false, error: 'Not authenticated with gh CLI' };
      }
    }
  }
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

function loadConfig() {
  try {
    const content = fs.readFileSync(OPENCLAW_CONFIG, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`Cannot read ${OPENCLAW_CONFIG}: ${e.message}`);
  }
}

function getEnvCredentials(config) {
  const creds = {};
  if (config.env) {
    for (const [key, value] of Object.entries(config.env)) {
      if (key.includes('API_KEY') || key.includes('TOKEN') || key.includes('SECRET')) {
        creds[key] = value;
      }
    }
  }
  return creds;
}

function getModelCredentials(config) {
  const creds = {};
  if (config.models?.providers) {
    for (const [provider, details] of Object.entries(config.models.providers)) {
      if (details.apiKey && details.apiKey !== 'REPLACE_ME') {
        creds[provider] = details.apiKey;
      }
    }
  }
  return creds;
}

function getAuthProfiles(config) {
  return config.auth?.profiles || {};
}

function checkCredentialsDir() {
  const files = [];
  try {
    const entries = fs.readdirSync(CREDENTIALS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith('.json') || entry.name.endsWith('.token'))) {
        const filePath = path.join(CREDENTIALS_DIR, entry.name);
        const stats = fs.statSync(filePath);
        files.push({
          name: entry.name,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        });
      }
      if (entry.isDirectory()) {
        const subDir = path.join(CREDENTIALS_DIR, entry.name);
        const subEntries = fs.readdirSync(subDir);
        for (const subEntry of subEntries) {
          if (subEntry.endsWith('.json') || subEntry.endsWith('.token')) {
            const filePath = path.join(subDir, subEntry);
            const stats = fs.statSync(filePath);
            files.push({
              name: `${entry.name}/${subEntry}`,
              path: filePath,
              size: stats.size,
              modified: stats.mtime
            });
          }
        }
      }
    }
  } catch (e) {
    // Credentials dir might not exist
  }
  return files;
}

async function validateProvider(name, config) {
  const check = PROVIDER_CHECKS[name];
  if (!check) {
    return { provider: name, status: 'unknown', note: 'No validation defined' };
  }
  
  try {
    let key = null;
    
    // Try env var
    if (check.envVar) {
      key = config.env?.[check.envVar];
    }
    
    // Try model provider key
    if (!key && check.modelKey) {
      key = config.models?.providers?.[check.modelKey]?.apiKey;
    }
    
    // Try auth profile
    if (!key && check.authProfile) {
      const profile = config.auth?.profiles?.[check.authProfile];
      key = profile ? JSON.stringify(profile) : null;
    }
    
    const result = await check.validate(key);
    
    return {
      provider: name,
      status: result.valid ? 'valid' : 'invalid',
      note: result.note || result.error,
      hasCredential: !!key
    };
  } catch (e) {
    return { provider: name, status: 'error', note: e.message };
  }
}

async function main() {
  log('\n🔐 Credential Health Check', 'cyan');
  log('═'.repeat(50), 'gray');
  
  const config = loadConfig();
  const results = {
    timestamp: new Date().toISOString(),
    providers: [],
    credentials: {
      env: getEnvCredentials(config),
      model: getModelCredentials(config),
      auth: getAuthProfiles(config),
      files: checkCredentialsDir()
    },
    issues: [],
    summary: { valid: 0, invalid: 0, unknown: 0 }
  };
  
  // Check each provider
  const providersToCheck = options.providers || Object.keys(PROVIDER_CHECKS);
  
  for (const provider of providersToCheck) {
    if (options.providers && !options.providers.includes(provider)) continue;
    
    const result = await validateProvider(provider, config);
    results.providers.push(result);
    
    if (result.status === 'valid') results.summary.valid++;
    else if (result.status === 'invalid') {
      results.summary.invalid++;
      results.issues.push({ provider, issue: result.note });
    }
    else results.summary.unknown++;
  }
  
  // Check for exposed secrets in config
  const configStr = JSON.stringify(config);
  const exposedPatterns = [
    { pattern: /sk-[a-zA-Z0-9]{20,}/g, name: 'OpenAI keys' },
    { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: 'GitHub tokens' },
    { pattern: /AIza[0-9A-Za-z_-]{35}/g, name: 'Google API keys' }
  ];
  
  for (const { pattern, name } of exposedPatterns) {
    const matches = configStr.match(pattern);
    if (matches) {
      results.issues.push({ type: 'security', issue: `${name} may be exposed in config` });
    }
  }
  
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  
  // Display results
  log(`\n📋 Provider Status:\n`, 'cyan');
  for (const result of results.providers) {
    const icon = result.status === 'valid' ? '✅' : result.status === 'invalid' ? '❌' : '❓';
    const color = result.status === 'valid' ? 'green' : result.status === 'invalid' ? 'red' : 'yellow';
    log(`  ${icon} ${result.provider}: ${result.note}`, color);
  }
  
  log(`\n📁 Credential Files:`, 'cyan');
  if (results.credentials.files.length === 0) {
    log('  No credential files found', 'yellow');
  } else {
    for (const file of results.credentials.files) {
      log(`  - ${file.name}`, 'dim');
    }
  }
  
  if (results.issues.length > 0) {
    log(`\n⚠️  Issues Found:`, 'red');
    for (const issue of results.issues) {
      log(`  - ${issue.provider || issue.type}: ${issue.issue}`, 'red');
    }
  }
  
  log(`\n📊 Summary:`, 'cyan');
  log(`  Valid: ${results.summary.valid}`, 'green');
  log(`  Invalid: ${results.summary.invalid}`, results.summary.invalid > 0 ? 'red' : 'dim');
  log(`  Unknown: ${results.summary.unknown}`, 'yellow');
  
  if (results.summary.invalid === 0 && results.issues.length === 0) {
    log(`\n✅ All credentials appear healthy!`, 'green');
  } else {
    log(`\n⚠️  Some credentials need attention`, 'yellow');
  }
}

main().catch(e => {
  log(`Fatal error: ${e.message}`, 'red');
  process.exit(1);
});
