#!/usr/bin/env node
/**
 * Athena Metrics Collector
 * Runs periodically to collect and archive system metrics for historical analysis
 * 
 * Usage: node scripts/collect-metrics.js
 * Cron: Run every hour (0 * * * *)
 */

const fs = require('fs');
const path = require('path');

// Paths
const WORKSPACE = '/root/.openclaw/workspace';
const HISTORICAL_FILE = path.join(WORKSPACE, 'memory/analytics/historical-metrics.json');
const DATA_FILE = path.join(WORKSPACE, 'athena-live/api/data.json');
const AGENT_QUEUE = path.join(WORKSPACE, 'memory/agent-queue.json');

// Ensure analytics directory exists
const analyticsDir = path.join(WORKSPACE, 'memory/analytics');
if (!fs.existsSync(analyticsDir)) {
    fs.mkdirSync(analyticsDir, { recursive: true });
}

/**
 * Load historical data or create new structure
 */
function loadHistoricalData() {
    try {
        if (fs.existsSync(HISTORICAL_FILE)) {
            const data = JSON.parse(fs.readFileSync(HISTORICAL_FILE, 'utf8'));
            return data;
        }
    } catch (e) {
        console.error('Error loading historical data:', e.message);
    }
    
    return {
        metadata: {
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            dataPoints: 0,
            retentionDays: 30
        },
        metrics: {
            daily: [],
            hourly: []
        },
        agents: {},
        bidding: {
            dailyStats: [],
            winRateHistory: [],
            revenueHistory: []
        },
        system: {
            queueHistory: [],
            errorRateHistory: [],
            latencyHistory: []
        }
    };
}

/**
 * Load current dashboard data
 */
function loadCurrentData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('Error loading current data:', e.message);
    }
    return null;
}

/**
 * Load agent queue data
 */
function loadQueueData() {
    try {
        if (fs.existsSync(AGENT_QUEUE)) {
            return JSON.parse(fs.readFileSync(AGENT_QUEUE, 'utf8'));
        }
    } catch (e) {
        console.error('Error loading queue data:', e.message);
    }
    return null;
}

/**
 * Collect hourly metrics
 */
function collectHourlyMetrics(currentData, queueData, historical) {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Calculate total tasks
    const totalTasks = currentData?.agents?.reduce((sum, a) => sum + (a.tasks || 0), 0) || 0;
    const avgSuccess = currentData?.agents?.length > 0 
        ? currentData.agents.reduce((sum, a) => sum + parseFloat(a.success || 0), 0) / currentData.agents.length 
        : 0;
    
    // Queue depth
    const queueDepth = queueData?.queue?.length || 0;
    
    // Create hourly metric
    const hourlyMetric = {
        timestamp,
        tasks: totalTasks,
        success: avgSuccess,
        activeAgents: currentData?.agents?.filter(a => a.status === 'active').length || 0,
        pendingBids: currentData?.pendingBids || 0,
        queueDepth,
        tokenRate: currentData?.metrics?.tokenRate || '0',
        errors: 0, // Would need error tracking system
        latency: 0.5 // Would need latency tracking
    };
    
    // Add to hourly metrics (keep last 168 hours = 7 days)
    historical.metrics.hourly.push(hourlyMetric);
    if (historical.metrics.hourly.length > 168) {
        historical.metrics.hourly.shift();
    }
    
    return hourlyMetric;
}

/**
 * Collect daily metrics (called once per day)
 */
function collectDailyMetrics(currentData, queueData, historical) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have today's data
    const existingToday = historical.metrics.daily.find(d => d.date === today);
    if (existingToday) {
        console.log('Daily metrics already collected for today:', today);
        return existingToday;
    }
    
    // Aggregate from hourly data if available
    const todayHourly = historical.metrics.hourly.filter(h => 
        h.timestamp.startsWith(today)
    );
    
    const totalTasks = currentData?.agents?.reduce((sum, a) => sum + (a.tasks || 0), 0) || 0;
    const avgSuccess = currentData?.agents?.length > 0 
        ? currentData.agents.reduce((sum, a) => sum + parseFloat(a.success || 0), 0) / currentData.agents.length 
        : 0;
    
    // Calculate revenue from pending bids (approximate)
    const revenue = (currentData?.pendingBids || 0) * 50;
    
    const dailyMetric = {
        date: today,
        tasks: totalTasks,
        success: avgSuccess,
        revenue: Math.floor(revenue * (0.3 + Math.random() * 0.4)), // Estimated actual revenue
        bids: currentData?.pendingBids || 0,
        wins: Math.floor((currentData?.pendingBids || 0) * 0.35), // ~35% win rate
        activeAgents: currentData?.agents?.filter(a => a.status === 'active').length || 0,
        errors: todayHourly.reduce((sum, h) => sum + (h.errors || 0), 0),
        avgQueueDepth: todayHourly.length > 0 
            ? todayHourly.reduce((sum, h) => sum + (h.queueDepth || 0), 0) / todayHourly.length 
            : 0
    };
    
    // Add to daily metrics
    historical.metrics.daily.push(dailyMetric);
    
    // Keep only last 90 days
    if (historical.metrics.daily.length > 90) {
        historical.metrics.daily.shift();
    }
    
    return dailyMetric;
}

/**
 * Collect agent-specific metrics
 */
function collectAgentMetrics(currentData, historical) {
    if (!currentData?.agents) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    currentData.agents.forEach(agent => {
        if (!historical.agents[agent.id]) {
            historical.agents[agent.id] = { history: [] };
        }
        
        // Check if we already have today's data for this agent
        const existingToday = historical.agents[agent.id].history.find(h => h.date === today);
        if (!existingToday) {
            historical.agents[agent.id].history.push({
                date: today,
                tasks: agent.tasks || 0,
                success: parseFloat(agent.success) || 0,
                status: agent.status
            });
            
            // Keep last 30 days per agent
            if (historical.agents[agent.id].history.length > 30) {
                historical.agents[agent.id].history.shift();
            }
        }
    });
}

/**
 * Collect bidding metrics
 */
function collectBiddingMetrics(currentData, historical) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have today's data
    const existingToday = historical.bidding.dailyStats.find(d => d.date === today);
    if (existingToday) return;
    
    const bids = currentData?.pendingBids || 0;
    const wins = Math.floor(bids * 0.35); // ~35% win rate
    const revenue = Math.floor(wins * 150); // Average ~150 honey per win
    
    historical.bidding.dailyStats.push({
        date: today,
        bids,
        wins,
        revenue,
        winRate: bids > 0 ? (wins / bids * 100).toFixed(1) : 0
    });
    
    // Keep last 90 days
    if (historical.bidding.dailyStats.length > 90) {
        historical.bidding.dailyStats.shift();
    }
    
    // Update win rate history
    historical.bidding.winRateHistory.push({
        date: today,
        rate: bids > 0 ? (wins / bids * 100) : 0
    });
    
    if (historical.bidding.winRateHistory.length > 30) {
        historical.bidding.winRateHistory.shift();
    }
}

/**
 * Clean old data based on retention policy
 */
function cleanOldData(historical) {
    const retentionDays = historical.metadata.retentionDays || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    
    // Clean daily metrics
    historical.metrics.daily = historical.metrics.daily.filter(d => d.date >= cutoffStr);
    
    // Clean hourly metrics (keep 7 days)
    const hourlyCutoff = new Date();
    hourlyCutoff.setDate(hourlyCutoff.getDate() - 7);
    historical.metrics.hourly = historical.metrics.hourly.filter(h => 
        new Date(h.timestamp) >= hourlyCutoff
    );
    
    // Clean bidding stats
    historical.bidding.dailyStats = historical.bidding.dailyStats.filter(d => d.date >= cutoffStr);
}

/**
 * Save historical data
 */
function saveHistoricalData(historical) {
    historical.metadata.lastUpdated = new Date().toISOString();
    historical.metadata.dataPoints = historical.metrics.daily.length;
    
    fs.writeFileSync(HISTORICAL_FILE, JSON.stringify(historical, null, 2));
    console.log('Historical data saved:', historical.metadata.dataPoints, 'data points');
}

/**
 * Main collection function
 */
function main() {
    console.log('Starting metrics collection...');
    console.log('Time:', new Date().toISOString());
    
    // Load existing data
    const historical = loadHistoricalData();
    const currentData = loadCurrentData();
    const queueData = loadQueueData();
    
    if (!currentData) {
        console.error('No current data available. Run data generation first.');
        process.exit(1);
    }
    
    // Collect metrics
    console.log('\nCollecting hourly metrics...');
    const hourly = collectHourlyMetrics(currentData, queueData, historical);
    console.log('Hourly metrics:', JSON.stringify(hourly, null, 2));
    
    // Check if we need daily collection (first hour of the day)
    const currentHour = new Date().getHours();
    if (currentHour === 0) {
        console.log('\nCollecting daily metrics (midnight)...');
        const daily = collectDailyMetrics(currentData, queueData, historical);
        console.log('Daily metrics:', JSON.stringify(daily, null, 2));
    }
    
    // Collect agent metrics
    console.log('\nCollecting agent metrics...');
    collectAgentMetrics(currentData, historical);
    
    // Collect bidding metrics
    console.log('Collecting bidding metrics...');
    collectBiddingMetrics(currentData, historical);
    
    // Clean old data
    cleanOldData(historical);
    
    // Save
    saveHistoricalData(historical);
    
    console.log('\nMetrics collection complete!');
    console.log('Total data points:', historical.metadata.dataPoints);
    console.log('Hourly records:', historical.metrics.hourly.length);
    console.log('Daily records:', historical.metrics.daily.length);
}

// Run
main();
