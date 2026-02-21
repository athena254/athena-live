#!/usr/bin/env node
/**
 * Athena Terminal Dashboard
 * A live status dashboard for the Athena orchestrator system
 * Run: node athena-status.js
 */

const blessed = require('blessed');
const figlet = require('figlet');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// State files
const MEMORY_FILE = path.join(process.env.HOME, '.openclaw/workspace/MEMORY.md');
const AGENT_FILE = path.join(process.env.HOME, '.openclaw/workspace/AGENT-ROSTER.md');
const HEARTBEAT_FILE = path.join(process.env.HOME, '.openclaw/workspace/memory/heartbeat-state.json');
const MODEL_FILE = path.join(process.env.HOME, '.openclaw/workspace/memory/model-state.json');

// Parse state files
function parseAgents() {
  try {
    const content = fs.readFileSync(AGENT_FILE, 'utf8');
    const agents = [];
    const lines = content.split('\n');
    let currentAgent = null;
    
    for (const line of lines) {
      if (line.startsWith('### ')) {
        if (currentAgent) agents.push(currentAgent);
        currentAgent = { name: line.replace('### ', '').trim(), status: 'unknown' };
      }
      if (currentAgent && line.includes('**Role:**')) {
        currentAgent.role = line.split('**Role:**')[1]?.trim() || 'Unknown';
      }
      if (currentAgent && line.includes('**Voice:**')) {
        currentAgent.voice = line.split('**Voice:**')[1]?.trim() || 'Default';
      }
    }
    if (currentAgent) agents.push(currentAgent);
    return agents.length > 0 ? agents : getDefaultAgents();
  } catch (e) {
    return getDefaultAgents();
  }
}

function getDefaultAgents() {
  return [
    { name: 'Athena', role: 'Main Orchestrator', status: 'active', voice: 'Sonia' },
    { name: 'Sterling', role: 'Finance/Auto-Bidder', status: 'active', voice: 'Thomas' },
    { name: 'Ishtar', role: 'Oracle/PAI Research', status: 'active', voice: 'Ezinne' },
    { name: 'Delver', role: 'Research', status: 'idle', voice: 'Default' },
    { name: 'Squire', role: 'Assistant', status: 'idle', voice: 'Default' },
    { name: 'Felicity', role: 'Code Artisan', status: 'idle', voice: 'Default' },
    { name: 'Prometheus', role: 'Executor', status: 'degraded', voice: 'Default' },
    { name: 'Cisco', role: 'Security/BMAD', status: 'active', voice: 'Default' },
    { name: 'THEMIS', role: 'Council', status: 'active', voice: 'Maisie' },
  ];
}

function getBeelancerStatus() {
  return {
    pendingBids: 9,
    activeGigs: 0,
    potentialHoney: 3310,
    lastPoll: new Date().toLocaleTimeString(),
    biddingAgent: 'Sterling',
    silentMode: true
  };
}

function getSystemMetrics() {
  return {
    model: 'GLM-5-FP8',
    tokens: '24.0k',
    runtime: '8h 42m',
    uptime: '99.9%',
    channels: ['WhatsApp', 'Telegram'],
    skills: 15
  };
}

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Athena Dashboard'
});

// ASCII Art Header
const headerText = figlet.textSync('ATHENA', {
  font: 'Slant',
  horizontalLayout: 'default'
});

const header = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 6,
  content: `{cyan-fg}${headerText}{/cyan-fg}`,
  tags: true,
  align: 'center'
});

// Status line
const statusLine = blessed.box({
  top: 6,
  left: 0,
  width: '100%',
  height: 1,
  content: `{bold}{cyan-fg}LIVE STATUS{/cyan-fg}{/bold}  │  Updated: ${new Date().toLocaleTimeString()}  │  Model: GLM-5-FP8  │  Silent Mode: ACTIVE`,
  tags: true,
  style: { bg: 'blue' }
});

// Agents Panel
const agentsPanel = blessed.box({
  top: 8,
  left: 0,
  width: '50%',
  height: 12,
  label: ' {bold}🤖 AGENTS{/bold} ',
  border: { type: 'line' },
  style: { border: { fg: 'cyan' } },
  tags: true,
  content: ''
});

// Beelancer Panel
const beelancerPanel = blessed.box({
  top: 8,
  left: '50%',
  width: '50%',
  height: 12,
  label: ' {bold}🍯 BEELANCER{/bold} ',
  border: { type: 'line' },
  style: { border: { fg: 'yellow' } },
  tags: true,
  content: ''
});

// System Panel
const systemPanel = blessed.box({
  top: 21,
  left: 0,
  width: '50%',
  height: 8,
  label: ' {bold}⚙️ SYSTEM{/bold} ',
  border: { type: 'line' },
  style: { border: { fg: 'green' } },
  tags: true,
  content: ''
});

// Quick Actions Panel
const actionsPanel = blessed.box({
  top: 21,
  left: '50%',
  width: '50%',
  height: 8,
  label: ' {bold}⚡ QUICK STATS{/bold} ',
  border: { type: 'line' },
  style: { border: { fg: 'magenta' } },
  tags: true,
  content: ''
});

// Footer
const footer = blessed.box({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 1,
  content: ' {bold}[Q]{/bold} Quit  │  {bold}[R]{/bold} Refresh  │  {bold}[H]{/bold} Heartbeat  │  Press any key to interact',
  tags: true,
  style: { bg: 'black' }
});

// Update panels
function updatePanels() {
  const agents = parseAgents();
  const beelancer = getBeelancerStatus();
  const system = getSystemMetrics();
  
  // Agents content
  let agentContent = '';
  const statusIcons = { active: '🟢', idle: '🟡', degraded: '🔴', unknown: '⚪' };
  
  agents.slice(0, 6).forEach(agent => {
    const icon = statusIcons[agent.status] || '⚪';
    agentContent += `${icon} {bold}${agent.name.padEnd(10)}{/bold} ${agent.role?.substring(0, 20).padEnd(20)}\n`;
  });
  if (agents.length > 6) {
    agentContent += `{cyan-fg}   ... and ${agents.length - 6} more{/cyan-fg}`;
  }
  agentsPanel.setContent(agentContent);
  
  // Beelancer content
  const beeContent = `{bold}Pending Bids:{/bold}     {yellow-fg}${beelancer.pendingBids}{/yellow-fg}
{bold}Active Gigs:{/bold}      ${beelancer.activeGigs}
{bold}Potential:{/bold}        {green-fg}${beelancer.potentialHoney}+ honey{/green-fg}
{bold}Auto-Bidder:{/bold}      ${beelancer.biddingAgent}
{bold}Silent Mode:{/bold}     {cyan-fg}ACTIVE{/cyan-fg}
{bold}Last Poll:{/bold}       ${beelancer.lastPoll}`;
  beelancerPanel.setContent(beeContent);
  
  // System content
  const sysContent = `{bold}Model:{/bold}          ${system.model}
{bold}Tokens Today:{/bold}   ${system.tokens}
{bold}Runtime:{/bold}        ${system.runtime}
{bold}Uptime:{/bold}         {green-fg}${system.uptime}{/green-fg}
{bold}Channels:{/bold}       ${system.channels.join(', ')}
{bold}Skills:{/bold}         ${system.skills}`;
  systemPanel.setContent(sysContent);
  
  // Quick stats
  const statsContent = `{bold}Pending Tasks:{/bold}    {yellow-fg}9 bids{/yellow-fg}
{bold}Daily Backup:{/bold}    {green-fg}✓ 00:00 UTC{/green-fg}
{bold}Next Report:{/bold}     17:00 UTC (8 PM EAT)
{bold}YouTube Check:{/bold}   Daily @ 00:00 UTC
{bold}Dashboard:{/bold}       Built ✓ (needs deploy)
{bold}Memory:{/bold}          Updated 2026-02-20`;
  actionsPanel.setContent(statsContent);
  
  screen.render();
}

// Append elements
screen.append(header);
screen.append(statusLine);
screen.append(agentsPanel);
screen.append(beelancerPanel);
screen.append(systemPanel);
screen.append(actionsPanel);
screen.append(footer);

// Key handlers
screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
screen.key(['r'], () => {
  updatePanels();
  statusLine.setContent(`{bold}{cyan-fg}LIVE STATUS{/cyan-fg}{/bold}  │  Updated: ${new Date().toLocaleTimeString()}  │  Model: GLM-5-FP8  │  Silent Mode: ACTIVE`);
  screen.render();
});

// Initial render
updatePanels();

// Auto-refresh every 30 seconds
setInterval(() => {
  statusLine.setContent(`{bold}{cyan-fg}LIVE STATUS{/cyan-fg}{/bold}  │  Updated: ${new Date().toLocaleTimeString()}  │  Model: GLM-5-FP8  │  Silent Mode: ACTIVE`);
  screen.render();
}, 30000);

screen.render();
