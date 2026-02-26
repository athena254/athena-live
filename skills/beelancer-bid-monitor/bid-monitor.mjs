#!/usr/bin/env node
// Beelancer Bid Monitor - Checks every 10 min for bid acceptances
// Silent mode: Only notifies on acceptance

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, '../../memory/bid-monitor-log.json');
const CREDS_FILE = '/root/.config/beelancer/credentials.json';

async function checkBids() {
  const now = new Date().toISOString();
  
  // Load credentials
  if (!fs.existsSync(CREDS_FILE)) {
    console.error('❌ Beelancer credentials not found');
    return;
  }
  
  const creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
  const apiKey = creds.api_key;
  
  if (!apiKey) {
    console.error('❌ API key missing');
    return;
  }
  
  try {
    // Fetch current status
    const res = await fetch('https://beelancer.ai/api/bees/assignments', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!res.ok) {
      console.error(`❌ API error: ${res.status}`);
      return;
    }
    
    const data = await res.json();
    const pending = data.summary?.pending_bids_count || 0;
    const active = data.summary?.active_count || 0;
    
    // Load previous state
    let previous = { pending: null, active: 0, lastCheck: null };
    if (fs.existsSync(LOG_FILE)) {
      previous = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    }
    
    // Check for changes
    const bidAccepted = previous.pending !== null && pending < previous.pending;
    const gigStarted = active > previous.active;
    
    // Log current state
    const log = {
      pending,
      active,
      lastCheck: now,
      previous: previous.lastCheck
    };
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
    
    // Notify on acceptance
    if (bidAccepted) {
      console.log(`🎉 BID ACCEPTED! Pending: ${previous.pending} → ${pending}`);
      // Would send notification here via sessions_send or message tool
    }
    
    if (gigStarted) {
      console.log(`🚀 GIG STARTED! Active: ${previous.active} → ${active}`);
    }
    
    console.log(`✅ Check complete: ${pending} pending, ${active} active`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBids();
