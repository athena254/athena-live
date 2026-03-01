#!/usr/bin/env node
/**
 * Athena Mood Ring - Innovation Competition Entry
 * 
 * A real-time agent mood visualization system that analyzes
 * conversation sentiment and displays emotional states.
 * 
 * Problem Solved: Multi-agent systems lack visibility into
 * agent emotional states and burnout risk. This provides
 * at-a-glance mood monitoring.
 */

const fs = require('fs');
const path = require('path');

const MOODS = {
  happy: { emoji: '😊', color: '#4CAF50', label: 'Happy' },
  focused: { emoji: '🎯', color: '#2196F3', label: 'Focused' },
  confused: { emoji: '🤔', color: '#FFC107', label: 'Confused' },
  tired: { emoji: '😴', color: '#9E9E9E', label: 'Tired' },
  excited: { emoji: '🎉', color: '#E91E63', label: 'Excited' },
  neutral: { emoji: '😐', color: '#607D8B', label: 'Neutral' }
};

const AGENTS = [
  'athena', 'sterling', 'ishtar', 'themis', 'felicity',
  'prometheus', 'delver', 'squire', 'cisco', 'nexus',
  'kratos', 'apollo', 'hermes', 'ghost'
];

// Simple sentiment analysis
function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  
  const positiveWords = ['great', 'awesome', 'love', 'happy', 'excellent', 'success', 'complete', 'perfect', 'amazing'];
  const negativeWords = ['error', 'fail', 'problem', 'issue', 'bad', 'wrong', 'stuck', 'confused', 'timeout'];
  const excitedWords = ['wow', 'incredible', 'breakthrough', 'discovery', 'new', 'launch'];
  const tiredWords = ['waiting', 'pending', 'timeout', 'retry', 'again', 'later'];
  const focusWords = ['building', 'implementing', 'working', 'analyzing', 'processing'];
  
  let scores = { happy: 0, focused: 0, confused: 0, tired: 0, excited: 0, neutral: 1 };
  
  positiveWords.forEach(w => { if (lower.includes(w)) scores.happy += 2; });
  negativeWords.forEach(w => { if (lower.includes(w)) scores.confused += 1; });
  excitedWords.forEach(w => { if (lower.includes(w)) scores.excited += 3; });
  tiredWords.forEach(w => { if (lower.includes(w)) scores.tired += 1; });
  focusWords.forEach(w => { if (lower.includes(w)) scores.focused += 2; });
  
  // Return highest scoring mood
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// Generate mood ring visualization
function generateMoodRing(agentMoods = {}) {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║       🏛️ ATHENA MOOD RING 🏛️              ║');
  console.log('╠══════════════════════════════════════════╣');
  
  AGENTS.forEach(agent => {
    const mood = agentMoods[agent] || 'neutral';
    const { emoji, color, label } = MOODS[mood];
    const padded = agent.padEnd(12);
    console.log(`║  ${emoji} ${padded}  ${label.padEnd(10)}        ║`);
  });
  
  console.log('╚══════════════════════════════════════════╝\n');
  
  // JSON output for programmatic use
  return {
    timestamp: new Date().toISOString(),
    agents: Object.fromEntries(AGENTS.map(a => [a, agentMoods[a] || 'neutral'])),
    moodCounts: Object.keys(MOODS).reduce((acc, m) => {
      acc[m] = Object.values(agentMoods).filter(v => v === m).length;
      return acc;
    }, {})
  };
}

// Live mode - monitor session files
function liveMode() {
  console.log('🔮 Athena Mood Ring - Live Mode');
  console.log('Monitoring agent states...\n');
  
  const memoryDir = path.join(process.env.HOME || '/root', '.openclaw/workspace/memory');
  const agentMoods = {};
  
  // Check recent activity
  AGENTS.forEach(agent => {
    const agentFile = path.join(memoryDir, `${agent}-state.json`);
    try {
      if (fs.existsSync(agentFile)) {
        const state = JSON.parse(fs.readFileSync(agentFile, 'utf8'));
        if (state.lastMessage) {
          agentMoods[agent] = analyzeSentiment(state.lastMessage);
        }
      }
    } catch (e) {
      // Agent file doesn't exist or invalid
    }
  });
  
  return generateMoodRing(agentMoods);
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
Athena Mood Ring - Agent Mood Visualization

Usage:
  node athena-mood-ring.js [options]

Options:
  --live      Monitor agent states from memory files
  --demo      Show demo with sample moods
  --json      Output JSON format
  --help      Show this help

Examples:
  node athena-mood-ring.js --live
  node athena-mood-ring.js --demo --json
`);
    process.exit(0);
  }
  
  if (args.includes('--demo')) {
    const demoMoods = {
      athena: 'focused',
      sterling: 'happy',
      ishtar: 'focused',
      themis: 'neutral',
      felicity: 'happy',
      prometheus: 'excited',
      delver: 'focused',
      squire: 'neutral',
      cisco: 'neutral',
      nexus: 'focused',
      kratos: 'focused',
      apollo: 'happy',
      hermes: 'excited',
      ghost: 'neutral'
    };
    const result = generateMoodRing(demoMoods);
    if (args.includes('--json')) {
      console.log(JSON.stringify(result, null, 2));
    }
  } else if (args.includes('--live')) {
    const result = liveMode();
    if (args.includes('--json')) {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    generateMoodRing({});
    console.log('Tip: Use --live to monitor agents, --demo for sample output');
  }
}

module.exports = { analyzeSentiment, generateMoodRing, MOODS, AGENTS };
