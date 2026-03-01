#!/usr/bin/env node
/**
 * Generate sample historical data for analytics dashboard
 * This creates realistic-looking data for the past 30 days
 */

const fs = require('fs');
const path = require('path');

const ANALYTICS_DIR = '/root/.openclaw/workspace/athena-live/api/analytics';
const OUTPUT_FILE = path.join(ANALYTICS_DIR, 'historical.json');

// Agent configurations
const AGENTS = [
    { id: 'athena', name: 'Athena', baseTasks: 45, variance: 10 },
    { id: 'sterling', name: 'Sterling', baseTasks: 25, variance: 8 },
    { id: 'ishtar', name: 'Ishtar', baseTasks: 15, variance: 5 },
    { id: 'themis', name: 'THEMIS', baseTasks: 12, variance: 4 },
    { id: 'felicity', name: 'Felicity', baseTasks: 35, variance: 8 },
    { id: 'prometheus', name: 'Prometheus', baseTasks: 28, variance: 7 },
    { id: 'delver', name: 'Delver', baseTasks: 12, variance: 5 },
    { id: 'squire', name: 'Squire', baseTasks: 22, variance: 6 },
    { id: 'cisco', name: 'Cisco', baseTasks: 10, variance: 4 }
];

// Generate data for past N days
function generateHistoricalData(days = 30) {
    const now = new Date();
    const dailyMetrics = [];
    const hourlyMetrics = [];
    const agentHistory = {};
    const biddingStats = [];
    const systemHistory = {
        queueHistory: [],
        errorRateHistory: [],
        latencyHistory: []
    };

    // Initialize agent history
    AGENTS.forEach(agent => {
        agentHistory[agent.id] = { history: [] };
    });

    // Generate daily data
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Daily metrics with realistic variance
        const dayOfWeek = date.getDay();
        const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1;
        
        const totalTasks = Math.floor((150 + Math.random() * 80) * weekendFactor);
        const successRate = 96 + Math.random() * 3.5;
        const revenue = Math.floor((200 + Math.random() * 400) * weekendFactor);
        const bids = Math.floor((8 + Math.random() * 12) * weekendFactor);
        const wins = Math.floor(bids * (0.3 + Math.random() * 0.15));
        const errors = Math.floor(Math.random() * 3);
        
        dailyMetrics.push({
            date: dateStr,
            tasks: totalTasks,
            success: parseFloat(successRate.toFixed(2)),
            revenue,
            bids,
            wins,
            errors,
            latency: parseFloat((0.4 + Math.random() * 0.6).toFixed(3))
        });

        // Agent-specific daily data
        AGENTS.forEach(agent => {
            const tasks = Math.floor((agent.baseTasks + (Math.random() - 0.5) * agent.variance * 2) * weekendFactor);
            const success = 95 + Math.random() * 5;
            const status = Math.random() > 0.3 ? 'active' : 'idle';
            
            agentHistory[agent.id].history.push({
                date: dateStr,
                tasks,
                success: parseFloat(success.toFixed(1)),
                status
            });
        });

        // Bidding stats
        biddingStats.push({
            date: dateStr,
            bids,
            wins,
            revenue: wins * Math.floor(100 + Math.random() * 100),
            winRate: parseFloat(((wins / bids) * 100).toFixed(1))
        });

        // Generate hourly data for last 7 days only
        if (i < 7) {
            for (let h = 0; h < 24; h++) {
                const hourDate = new Date(date);
                hourDate.setHours(h, 0, 0, 0);
                
                const hourFactor = (h >= 9 && h <= 18) ? 1.2 : (h >= 0 && h <= 6) ? 0.3 : 0.7;
                
                hourlyMetrics.push({
                    timestamp: hourDate.toISOString(),
                    tasks: Math.floor((5 + Math.random() * 8) * hourFactor),
                    errors: Math.random() < 0.05 ? 1 : 0,
                    latency: parseFloat((0.3 + Math.random() * 0.5).toFixed(3)),
                    queueDepth: Math.floor(Math.random() * 10 * hourFactor),
                    activeAgents: Math.floor(5 + Math.random() * 4)
                });

                // System metrics
                systemHistory.queueHistory.push({
                    hour: hourDate.toISOString(),
                    depth: Math.floor(Math.random() * 8)
                });
                
                systemHistory.errorRateHistory.push({
                    hour: hourDate.toISOString(),
                    rate: parseFloat((Math.random() * 1.5).toFixed(2))
                });
                
                systemHistory.latencyHistory.push({
                    hour: hourDate.toISOString(),
                    latency: parseFloat((0.3 + Math.random() * 0.5).toFixed(3))
                });
            }
        }
    }

    return {
        metadata: {
            created: now.toISOString(),
            lastUpdated: now.toISOString(),
            dataPoints: days,
            retentionDays: 30,
            generated: true
        },
        metrics: {
            daily: dailyMetrics,
            hourly: hourlyMetrics
        },
        agents: agentHistory,
        bidding: {
            dailyStats: biddingStats,
            winRateHistory: biddingStats.slice(-7).map(b => ({
                date: b.date,
                rate: b.winRate
            })),
            revenueHistory: biddingStats.map(b => ({
                date: b.date,
                revenue: b.revenue
            }))
        },
        system: systemHistory
    };
}

// Main
console.log('Generating sample historical analytics data...');

const data = generateHistoricalData(30);

// Ensure directory exists
if (!fs.existsSync(ANALYTICS_DIR)) {
    fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
}

// Write to file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

console.log(`Generated ${data.metrics.daily.length} daily records`);
console.log(`Generated ${data.metrics.hourly.length} hourly records`);
console.log(`Output: ${OUTPUT_FILE}`);
console.log('Done!');
