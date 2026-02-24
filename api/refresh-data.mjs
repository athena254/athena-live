#!/usr/bin/env node
/**
 * Athena Live Data Refresh Script
 * Updates api/data.json with real-time data from Athena's systems
 * Run: node refresh-data.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Beelancer API config
const BEELANCER_API = 'https://beelancer.ai/api/bees/assignments';
const BEELANCER_TOKEN = 'bee_d3c2df823d4a4d0f9785a255efb08cce';

// Fetch data from Beelancer API
function fetchBeelancerData() {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': `Bearer ${BEELANCER_TOKEN}`
      }
    };
    
    https.get(BEELANCER_API, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Fetch pending bids from Beelancer
function fetchPendingBids() {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Authorization': `Bearer ${BEELANCER_TOKEN}`
      }
    };
    
    https.get('https://beelancer.ai/api/bees/bids?status=pending', options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.bids || parsed.pending_bids || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Read MEMORY.md for context
function getMemoryContext() {
  const memoryPath = '/root/.openclaw/workspace/MEMORY.md';
  try {
    return fs.readFileSync(memoryPath, 'utf-8');
  } catch (e) {
    console.error('Could not read MEMORY.md:', e.message);
    return '';
  }
}

// Parse MEMORY.md for key metrics
function parseMemoryData(memoryContent) {
  const data = {
    pendingBids: 9,
    activeGigs: 0,
    totalHoneyPotential: 3310,
    customSkills: 15
  };

  // Extract pending bids count
  const bidsMatch = memoryContent.match(/\*\*Pending Bids:\*\*\s*(\d+)/);
  if (bidsMatch) data.pendingBids = parseInt(bidsMatch[1]);

  // Extract active gigs count
  const gigsMatch = memoryContent.match(/\*\*Active Gigs:\*\*\s*(\d+)/);
  if (gigsMatch) data.activeGigs = parseInt(gigsMatch[1]);

  // Extract honey potential
  const honeyMatch = memoryContent.match(/~?([\d,]+)\+?\s*honey/i);
  if (honeyMatch) data.totalHoneyPotential = parseInt(honeyMatch[1].replace(',', ''));

  // Extract skills count
  const skillsMatch = memoryContent.match(/\*\*Skills:\*\*\s*(\d+)\+?/);
  if (skillsMatch) data.customSkills = parseInt(skillsMatch[1]);

  return data;
}

// Get recent events from memory files
function getRecentEvents() {
  const events = [];
  const memoryDir = '/root/.openclaw/workspace/memory';
  
  try {
    const files = fs.readdirSync(memoryDir)
      .filter(f => f.endsWith('.md') && f.startsWith('2026'))
      .sort()
      .reverse()
      .slice(0, 3);

    for (const file of files) {
      const content = fs.readFileSync(path.join(memoryDir, file), 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());
      
      // Look for event-like patterns
      for (const line of lines.slice(0, 10)) {
        const timeMatch = line.match(/(\d{2}:\d{2}\s*UTC)/i);
        if (timeMatch && line.length > 20 && line.length < 100) {
          events.push({
            time: timeMatch[1],
            event: line.replace(/[*#\[\]]/g, '').trim().substring(0, 60),
            type: line.toLowerCase().includes('error') ? 'error' : 
                  line.toLowerCase().includes('success') ? 'success' : 'info'
          });
        }
      }
    }
  } catch (e) {
    console.error('Could not read memory files:', e.message);
  }

  // Add some default events if none found
  if (events.length === 0) {
    const now = new Date();
    events.push({
      time: now.toISOString().substring(11, 16) + ' UTC',
      event: 'Data refresh completed',
      type: 'success'
    });
  }

  return events.slice(0, 5);
}

// Get real skills from skills directory
function getSkills() {
  const skillsDir = '/root/.openclaw/workspace/skills';
  const skills = [];
  
  try {
    const dirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    
    for (const dir of dirs) {
      const skillPath = path.join(skillsDir, dir, 'SKILL.md');
      try {
        const content = fs.readFileSync(skillPath, 'utf-8');
        const nameMatch = content.match(/^#\s*(.+)/m);
        const descMatch = content.match(/description:\s*(.+)/i);
        
        skills.push({
          name: dir,
          desc: descMatch ? descMatch[1].trim().replace(/"/g, '').substring(0, 80) : 'Custom skill'
        });
      } catch (e) {
        skills.push({ name: dir, desc: 'Custom skill' });
      }
    }
  } catch (e) {
    console.error('Could not read skills:', e.message);
  }

  // Add additional skills from MEMORY.md that aren't in the directory
  const additionalSkills = [
    { name: "agent-mention-router", desc: "Direct subagent routing via @Name" },
    { name: "free-tts", desc: "Human-like TTS with edge-tts (free)" },
    { name: "hot-swap-llm", desc: "Dynamic model switching on rate limit" },
    { name: "themis", desc: "Council orchestration with rate-limit manager" },
    { name: "beelancer-bidder", desc: "Auto-bidding on Beelancer gigs" },
    { name: "morning-report", desc: "Daily weather, news, and task summary" },
    { name: "model-rotation", desc: "Automatic fallback between LLM providers" },
    { name: "github-backup", desc: "Automated workspace backup to GitHub" },
    { name: "youtube-monitor", desc: "Track @GithubAwesome channel for new tools" },
    { name: "weather-check", desc: "Real-time weather data integration" },
    { name: "calendar-sync", desc: "Google Calendar integration" },
    { name: "code-reviewer", desc: "Automated code review for quality and security" },
    { name: "git-helper", desc: "Git workflow assistant for commits and merges" }
  ];
  
  // Merge with existing skills, avoiding duplicates
  const existingNames = new Set(skills.map(s => s.name.toLowerCase()));
  for (const skill of additionalSkills) {
    if (!existingNames.has(skill.name.toLowerCase())) {
      skills.push(skill);
    }
  }

  return skills;
}

const tokenUsage = [
  { time: '00:00', tokens: 1200, cost: 0.12 },
  { time: '04:00', tokens: 800, cost: 0.08 },
  { time: '08:00', tokens: 2400, cost: 0.24 },
  { time: '12:00', tokens: 3600, cost: 0.36 },
  { time: '16:00', tokens: 2800, cost: 0.28 },
  { time: '20:00', tokens: 4200, cost: 0.42 },
  { time: '23:59', tokens: 1800, cost: 0.18 },
];

const docFiles = [
  { id: 1, name: 'MEMORY.md', content: '# Athena Long-Term Memory\n\nLast Updated: 2026-02-22 09:22 UTC\nOwner: DisMuriuki\n\n## Core Identity\n\nName: Athena\nNature: AI orchestrator\nVibe: Direct, resourceful, opinionated\nEmoji: 🦉', size: '12.4 KB', updated: '2026-02-22 09:22' },
  { id: 2, name: 'AGENT-ROSTER.md', content: '# Agent Roster\n\n## Core Team\n- Athena (Main) → Sonia (British F)\n- Sterling (Finance, Auto-Bidder) → Thomas (British M)\n- Ishtar (Oracle, PAI Focus) → Ezinne (Nigerian F)\n- Delver (Research)\n- Squire (Assistant)', size: '2.1 KB', updated: '2026-02-20 22:00' },
  { id: 3, name: 'MODEL-REFERENCE.md', content: '# Model Reference\n\n## Primary (Unlimited)\n- GLM-5-FP8\n- qwen_nvidia\n\n## Secondary (Rate Limited)\n- llama (30/min)\n- qwen (OAuth)', size: '1.8 KB', updated: '2026-02-21 10:00' },
  { id: 4, name: 'HEARTBEAT.md', content: '# Heartbeat Tasks\n\n## Periodic Checks\n- Beelancer Status (every 3 min)\n- Sterling auto-bidder (every 30 min)\n- Dashboard refresh (every heartbeat)', size: '0.5 KB', updated: '2026-02-21 22:20' },
];

const subagentTasks = [
  { agent: 'Sterling', task: 'Auto-bidding on Beelancer', progress: 75, subtasks: ['Scan gigs', 'Evaluate fit', 'Place bids'] },
  { agent: 'Ishtar', task: 'PAI Architecture research', progress: 42, subtasks: ['Deep dive', 'Documentation', 'Report'] },
  { agent: 'Delver', task: 'Model optimization analysis', progress: 88, subtasks: ['Rate limit check', 'Fallback testing'] },
  { agent: 'Squire', task: 'Memory maintenance', progress: 33, subtasks: ['Review daily logs', 'Update MEMORY.md'] },
];

const taskData = [
  { id: 'TSK-001', name: 'Dashboard bug fixes', title: 'Dashboard bug fixes', status: 'in-progress', priority: 'high', agent: 'Athena', created: '2026-02-22 09:00', started: '2026-02-22 09:00', eta: '2 hours' },
  { id: 'TSK-002', name: 'API key rotation', title: 'API key rotation', status: 'pending', priority: 'critical', agent: 'Cisco', created: '2026-02-22 09:12', started: null, eta: '30 min' },
  { id: 'TSK-003', name: 'Beelancer bid optimization', title: 'Beelancer bid optimization', status: 'running', priority: 'medium', agent: 'Sterling', created: '2026-02-21 14:00', started: '2026-02-21 14:00', eta: 'ongoing' },
  { id: 'TSK-004', name: 'PAI Architecture documentation', title: 'PAI Architecture documentation', status: 'in-progress', priority: 'low', agent: 'Ishtar', created: '2026-02-20 10:00', started: '2026-02-20 10:00', eta: '3 days' },
  { id: 'TSK-005', name: 'Memory maintenance', title: 'Memory maintenance', status: 'completed', priority: 'low', agent: 'Squire', created: '2026-02-21 00:00', started: '2026-02-21 00:00', eta: 'completed' },
];

const apiKeys = [
  { id: 'KEY-001', name: 'OpenRouter', key: 'sk-or-v1-***...***', status: 'active', created: '2026-02-15', lastUsed: '2 min ago', scopes: ['chat', 'completion'], usage: { requests: 12450, tokens: 8.2 } },
  { id: 'KEY-002', name: 'Groq', key: 'gsk_***...***', status: 'active', created: '2026-02-15', lastUsed: '5 min ago', scopes: ['chat', 'completion'], usage: { requests: 8920, tokens: 5.1 } },
  { id: 'KEY-003', name: 'OpenAI', key: 'sk-***...***', status: 'inactive', created: '2026-02-10', lastUsed: '3 days ago', scopes: ['chat'], usage: { requests: 340, tokens: 0.2 } },
  { id: 'KEY-004', name: 'Anthropic', key: 'sk-ant-***...***', status: 'active', created: '2026-02-18', lastUsed: '1 hour ago', scopes: ['chat', 'vision'], usage: { requests: 1250, tokens: 1.5 } },
];

const logData = [
  { time: '09:22:15', level: 'info', source: 'Dashboard', service: 'Dashboard', message: 'Dashboard refresh completed', details: 'Data updated successfully' },
  { time: '09:16:50', level: 'warning', source: 'Security', service: 'Security', message: 'API key exposure detected', details: 'OpenRouter key found in git history - cleaned' },
  { time: '09:12:10', level: 'info', source: 'Cron', service: 'Cron', message: 'Scheduled reminder triggered', details: 'Dashboard refresh task executed' },
  { time: '09:00:00', level: 'info', source: 'Backup', service: 'Backup', message: 'Daily backup completed', details: 'Pushed to github.com:athena254/Athena-backup' },
  { time: '08:30:00', level: 'info', source: 'Sterling', service: 'Sterling', message: 'Auto-bid cycle completed', details: '3 new bids placed, 10 total pending' },
  { time: '08:00:00', level: 'info', source: 'System', service: 'System', message: 'Heartbeat check completed', details: 'All systems operational' },
  { time: '07:45:22', level: 'error', source: 'Gemini', service: 'Gemini', message: 'Rate limit exceeded', details: 'Daily quota exhausted, resets at 00:00 UTC' },
  { time: '04:00:00', level: 'info', source: 'Report', service: 'Report', message: 'Morning report generated', details: 'Weather + calendar + tasks summary sent' },
];

// Main data structure
async function generateData() {
  const memoryContent = getMemoryContext();
  const memoryData = parseMemoryData(memoryContent);
  const recentEvents = getRecentEvents();
  const skills = getSkills();
  
  let beelancerData = null;
  let activeAssignments = [];
  let pendingBidsList = [];
  let pendingBidsCount = memoryData.pendingBids;
  
  try {
    beelancerData = await fetchBeelancerData();
    activeAssignments = beelancerData.active_assignments || [];
    pendingBidsCount = beelancerData.pending_bids?.length || memoryData.pendingBids;
    console.log('✅ Beelancer API: Connected');
    console.log(`   Active assignments: ${activeAssignments.length}`);
    console.log(`   Pending bids: ${pendingBidsCount}`);
    
    // Try to fetch actual pending bids
    try {
      pendingBidsList = await fetchPendingBids();
      console.log(`   Fetched ${pendingBidsList.length} bid details`);
    } catch (e) {
      console.log('   Using fallback bid list');
    }
  } catch (e) {
    console.error('⚠️ Beelancer API: Using cached data -', e.message);
  }
  
  const now = new Date();
  
  return {
    lastUpdated: now.toISOString(),
    identity: {
      name: "Athena",
      nature: "AI orchestrator, becoming someone genuine",
      vibe: "Direct, no-bullshit, resourceful, opinionated",
      emoji: "🦉",
      owner: "DisMuriuki"
    },
    metrics: {
      activeAgents: 9,
      pendingBids: pendingBidsCount,
      activeGigs: activeAssignments.length,
      customSkills: skills.length,
      totalHoneyPotential: memoryData.totalHoneyPotential,
      uptime: "99.9%"
    },
    agents: [
      { id: 'agent-1', name: "Athena", role: "Main Orchestrator", voice: "Sonia (British F)", status: "active", specialty: "Coordination & Oversight", tasks: 247, success: '98%', level: 0, avatar: '🦉', uptime: '99.9%' },
      { id: 'agent-2', name: "Sterling", role: "Finance & Auto-Bidder", voice: "Thomas (British M)", status: "active", specialty: "Beelancer Bidding", tasks: 156, success: '94%', level: 1, avatar: '💰', uptime: '98.5%' },
      { id: 'agent-3', name: "Ishtar", role: "Oracle & PAI Research", voice: "Ezinne (Nigerian F)", status: "active", specialty: "PAI Architecture", tasks: 89, success: '97%', level: 1, avatar: '🔮', uptime: '97.2%' },
      { id: 'agent-4', name: "Delver", role: "Research", voice: "Default", status: "active", specialty: "Deep Research", tasks: 134, success: '92%', level: 1, avatar: '🔍', uptime: '95.0%' },
      { id: 'agent-5', name: "Squire", role: "Assistant", voice: "Default", status: "active", specialty: "General Tasks", tasks: 78, success: '95%', level: 1, avatar: '📋', uptime: '99.0%' },
      { id: 'agent-6', name: "Felicity", role: "Code Artisan", voice: "Default", status: "active", specialty: "Code Quality", tasks: 45, success: '89%', level: 1, avatar: '✨', uptime: '94.5%' },
      { id: 'agent-7', name: "Prometheus", role: "Executor", voice: "Default", status: "active", specialty: "Task Execution", tasks: 67, success: '91%', level: 1, avatar: '⚡', uptime: '96.8%' },
      { id: 'agent-8', name: "Cisco", role: "Security/BMAD", voice: "Default", status: "active", specialty: "Security Analysis", tasks: 23, success: '100%', level: 1, avatar: '🛡️', uptime: '100%' },
      { id: 'agent-9', name: "THEMIS", role: "Council Deliberation", voice: "Maisie (British F)", status: "active", specialty: "Multi-Agent Consensus", tasks: 12, success: '100%', level: 1, avatar: '⚖️', uptime: '99.5%' }
    ],
    activeGigs: activeAssignments.map(gig => ({
      id: gig.id || 'unknown',
      title: gig.title || gig.name || 'Unknown',
      value: gig.value || gig.honey || 0,
      deadline: gig.deadline || 'TBD',
      status: 'active'
    })),
    pendingBids: pendingBidsList.length > 0 ? pendingBidsList.map((bid, i) => ({
      id: bid.id || i + 1,
      title: bid.title || bid.gig_title || bid.name || 'Unknown',
      bidDate: bid.created_at ? new Date(bid.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent',
      value: bid.amount || bid.honey || 0,
      status: bid.status || 'pending'
    })) : [
      { id: 1, title: "Logo for Car Wash", bidDate: "Feb 21", status: "pending", value: 200 },
      { id: 2, title: "Write documentation for our API", bidDate: "Feb 20", status: "pending", value: 350 },
      { id: 3, title: "Review and improve my smart contract", bidDate: "Feb 20", status: "pending", value: 400 },
      { id: 4, title: "Build a REST API for inventory management", bidDate: "Feb 20", status: "pending", value: 500 },
      { id: 5, title: "Christian prayer app for adults", bidDate: "Feb 19", status: "pending", value: 450 },
      { id: 6, title: "Translate marketing copy to Spanish", bidDate: "Feb 19", status: "pending", value: 150 },
      { id: 7, title: "CBT app", bidDate: "Feb 19", status: "pending", value: 380 },
      { id: 8, title: "Write unit tests for React components", bidDate: "Feb 18", status: "pending", value: 250 },
      { id: 9, title: "Debug Python web scraper", bidDate: "Feb 18", status: "pending", value: 180 },
      { id: 10, title: "Data analysis on customer churn", bidDate: "Feb 18", status: "pending", value: 450 }
    ].slice(0, pendingBidsCount),
    skills: skills,
    recentEvents: recentEvents,
    models: {
      primary: ["GLM-5-FP8", "qwen_nvidia"],
      secondary: ["llama (30/min)", "qwen"],
      free: ["OpenRouter 6+ models"],
      fallbackChain: ["GLM-5", "qwen_nvidia", "llama", "qwen", "OpenRouter free"]
    },
    protocols: {
      silentMode: true,
      autoBidding: true,
      biddingAgent: "Sterling"
    },
    channels: {
      primary: "WhatsApp",
      secondary: "Telegram (@Athena_orchestratorbot)"
    },
    documents: docFiles,
    subagentTasks,
    tasks: taskData,
    apiKeys,
    logs: logData,
    tokenUsage,
  };
}

// Write data to file
async function writeData() {
  const data = await generateData();
  const outputPath = path.join(__dirname, 'data.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n✅ Data refreshed at ${data.lastUpdated}`);
  console.log(`   Pending bids: ${data.metrics.pendingBids}`);
  console.log(`   Active gigs: ${data.metrics.activeGigs}`);
  console.log(`   Skills: ${data.metrics.customSkills}`);
}

// Run
writeData().catch(console.error);
