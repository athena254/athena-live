import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = ['tools', 'dashboards', 'research', 'automations'];
const projects = {
  tools: ['CLI utility', 'API wrapper', 'data processor', 'Web scraper', 'File organizer', 'Batch converter'],
  dashboards: ['Analytics dashboard', 'System monitor', 'Data visualization', 'Real-time metrics', 'Performance tracker'],
  research: ['Trend report', 'Competitive analysis', 'Literature review', 'Market research', 'Tech landscape survey'],
  automations: ['Cron job scheduler', 'Webhook handler', 'API integration', 'Data sync pipeline', 'Auto-backup system']
};

const backlogPath = '/root/.openclaw/workspace/memory/daily-build-backlog.md';
const todayPath = '/root/.openclaw/workspace/memory/daily-build-today.md';
const historyPath = '/root/.openclaw/workspace/memory/daily-build-history.json';

// Load history
let history = [];
try {
  history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
} catch (e) {
  // No history yet
}

// Get today's date
const today = new Date().toISOString().split('T')[0];

// Check if we already generated today
const alreadyBuilt = history.find(h => h.date === today);
if (alreadyBuilt) {
  console.log(`Today's build already assigned: ${alreadyBuilt.category}: ${alreadyBuilt.project}`);
  fs.writeFileSync(todayPath, `# Today's Build — ${today}\n\n**Category:** ${alreadyBuilt.category}\n**Project:** ${alreadyBuilt.project}\n\n**Status:** Already assigned\n`);
  process.exit(0);
}

// Generate new assignment
const category = categories[Math.floor(Math.random() * categories.length)];
const projectList = projects[category];
const project = projectList[Math.floor(Math.random() * projectList.length)];

// Avoid repeats from last 7 days
const recentBuilds = history.slice(-7).map(h => `${h.category}:${h.project}`);
if (recentBuilds.includes(`${category}:${project}`)) {
  console.log('Regenerating to avoid recent repeat...');
  // Just pick a different one
  const otherProjects = projectList.filter(p => !recentBuilds.includes(`${category}:${p}`));
  if (otherProjects.length > 0) {
    project = otherProjects[Math.floor(Math.random() * otherProjects.length)];
  }
}

// Save to history
history.push({
  date: today,
  category,
  project,
  assignedAt: new Date().toISOString()
});

fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

// Write today's assignment
const assignment = `# Today's Build — ${today}\n\n**Category:** ${category.charAt(0).toUpperCase() + category.slice(1)}\n**Project:** ${project}\n\n**Assigned:** ${new Date().toISOString()}\n\n**Status:** Ready to start\n\n---\n\n## Notes\nBuild something tangible and cool. Ship it today.\n`;

fs.writeFileSync(todayPath, assignment);
console.log(`✅ Today's build assigned: ${category}: ${project}`);
