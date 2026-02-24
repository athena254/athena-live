// Athena Live Dashboard Data Refresh
// Fetches Beelancer status and updates data.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');

// Default data structure
const defaultData = {
  lastUpdated: new Date().toISOString(),
  pendingBids: 10,
  activeGigs: 0,
  skillsTracked: 16,
  agents: 10,
  status: 'operational'
};

async function refreshData() {
  console.log('🔄 Refreshing Athena Live data...');
  
  try {
    // Load current data
    let data = defaultData;
    
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
      data = JSON.parse(fileContent);
    }
    
    // Update timestamp
    data.lastUpdated = new Date().toISOString();
    
    // Try to fetch from Beelancer API (if credentials exist)
    try {
      const credsPath = '/root/.openclaw/credentials/beelancer/credentials.json';
      if (fs.existsSync(credsPath)) {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        const apiKey = creds.api_key;
        
        if (apiKey) {
          // Check pending bids
          const bidsRes = await fetch('https://beelancer.ai/api/bees/bids?status=pending', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          
          if (bidsRes.ok) {
            const bidsData = await bidsRes.json();
            data.pendingBids = bidsData.length || 0;
          }
          
          // Check active assignments
          const assignRes = await fetch('https://beelancer.ai/api/bees/assignments', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          
          if (assignRes.ok) {
            const assignData = await assignRes.json();
            data.activeGigs = assignData.filter(a => a.status === 'active').length || 0;
          }
        }
      }
    } catch (e) {
      // Silently continue if API fails
      console.log('⚠️ Beelancer API unavailable, using cached data');
    }
    
    // Write updated data
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    console.log(`✅ Data refreshed: ${data.pendingBids} pending bids, ${data.activeGigs} active gigs`);
    
  } catch (error) {
    console.error('❌ Error refreshing data:', error.message);
    process.exit(1);
  }
}

refreshData();
