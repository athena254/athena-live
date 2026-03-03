/**
 * Athena Fault Tolerance - Usage Examples
 * 
 * Demonstrates how to integrate fault tolerance patterns
 * into the Athena multi-agent system.
 * 
 * @module athena-fault-tolerance-usage
 */

const {
  FaultToleranceManager,
  CircuitBreaker,
  Bulkhead,
  Throttler,
  RetryPolicy,
  HealthMonitor,
  SelfHealer
} = require('./athena-fault-tolerance');

// ============================================================================
// EXAMPLE 1: Basic API Protection
// ============================================================================

async function exampleBasicApiProtection() {
  // Create a fault tolerance manager
  const ft = new FaultToleranceManager({
    apis: [
      { name: 'openrouter', maxRequests: 50, windowMs: 60000 },
      { name: 'gemini', maxRequests: 100, windowMs: 60000 }
    ]
  });

  // Make a protected API call
  try {
    const response = await ft.execute({
      fn: async () => {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer xxx' },
          body: JSON.stringify({ model: 'gpt-4', messages: [{ role: 'user', content: 'Hello' }] })
        });
        return res.json();
      },
      circuitBreaker: 'openrouter',
      throttler: 'openrouter',
      priority: 'NORMAL',
      retry: { maxRetries: 2, baseDelay: 1000 },
      fallback: () => ({ error: 'Service unavailable', fallback: true })
    });
    
    console.log('Response:', response);
  } catch (error) {
    console.error('API call failed:', error.message);
  }

  // Check status
  console.log('Fault Tolerance Status:', ft.getStatus());
}

// ============================================================================
// EXAMPLE 2: Agent Resource Isolation (Bulkhead)
// ============================================================================

function exampleAgentBulkheads() {
  const ft = new FaultToleranceManager();

  // Create dedicated bulkheads for critical agents
  ft.createBulkhead('sterling-bidding', { 
    maxConcurrent: 3,  // Sterling can make 3 concurrent bidding operations
    maxQueueSize: 50 
  });

  ft.createBulkhead('athena-main', { 
    maxConcurrent: 10,  // Athena main has higher capacity
    maxQueueSize: 100 
  });

  ft.createBulkhead('general-agents', { 
    maxConcurrent: 5,   // Shared pool for non-critical agents
    maxQueueSize: 50 
  });

  return ft;
}

// ============================================================================
// EXAMPLE 3: Multi-Provider Fallback
// ============================================================================

async function exampleMultiProviderFallback() {
  const ft = new FaultToleranceManager({
    apis: [
      { name: 'openrouter', failureThreshold: 3 },
      { name: 'gemini', failureThreshold: 5 },
      { name: 'openai', failureThreshold: 3 }
    ]
  });

  async function callWithFallback(prompt) {
    const providers = [
      { name: 'openrouter', call: () => callOpenRouter(prompt) },
      { name: 'gemini', call: () => callGemini(prompt) },
      { name: 'openai', call: () => callOpenAI(prompt) }
    ];

    for (const provider of providers) {
      const cb = ft.getCircuitBreaker(provider.name);
      if (!cb || !cb.isOpen()) {
        try {
          return await ft.execute({
            fn: provider.call,
            circuitBreaker: provider.name,
            throttler: provider.name,
            retry: { maxRetries: 1 }
          });
        } catch (error) {
          console.warn(`${provider.name} failed:`, error.message);
          continue;
        }
      }
    }

    throw new Error('All providers failed or circuits are open');
  }

  return callWithFallback('Hello, world!');
}

// Placeholder API functions
async function callOpenRouter(prompt) { /* ... */ }
async function callGemini(prompt) { /* ... */ }
async function callOpenAI(prompt) { /* ... */ }

// ============================================================================
// EXAMPLE 4: Health Monitoring with Custom Checks
// ============================================================================

function setupHealthMonitoring() {
  const monitor = new HealthMonitor({ checkInterval: 30000 });

  // Add custom health checks for Athena-specific components

  // GitHub authentication check
  monitor.registerCheck('github_auth', async () => {
    try {
      const { execSync } = require('child_process');
      execSync('gh auth status', { encoding: 'utf8', timeout: 5000 });
      return { status: 'HEALTHY', authenticated: true };
    } catch (error) {
      return { 
        status: 'UNHEALTHY', 
        authenticated: false, 
        error: 'GitHub auth expired or not configured' 
      };
    }
  }, { critical: true, description: 'GitHub CLI authentication' });

  // Swap usage check
  monitor.registerCheck('swap', async () => {
    const fs = require('fs');
    try {
      const swapInfo = fs.readFileSync('/proc/swaps', 'utf8');
      const lines = swapInfo.trim().split('\n').slice(1);
      let totalSize = 0, usedSize = 0;
      
      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 4) {
          totalSize += parseInt(parts[2], 10);
          usedSize += parseInt(parts[3], 10);
        }
      }
      
      const usagePercent = totalSize > 0 ? (usedSize / totalSize * 100) : 0;
      
      return {
        status: usagePercent > 80 ? 'UNHEALTHY' : usagePercent > 60 ? 'DEGRADED' : 'HEALTHY',
        totalKB: totalSize,
        usedKB: usedSize,
        usagePercent: parseFloat(usagePercent.toFixed(1))
      };
    } catch (error) {
      return { status: 'UNKNOWN', error: error.message };
    }
  }, { critical: true, description: 'System swap usage' });

  // Agent connectivity check
  monitor.registerCheck('agents', async () => {
    // Check if agent sessions are responsive
    const agentSessions = ['athena-main', 'sterling', 'ishtar', 'felicity'];
    let healthy = 0;
    
    for (const agent of agentSessions) {
      // In real implementation, check session heartbeat
      healthy++;
    }
    
    const healthRatio = healthy / agentSessions.length;
    
    return {
      status: healthRatio === 1 ? 'HEALTHY' : healthRatio > 0.5 ? 'DEGRADED' : 'UNHEALTHY',
      total: agentSessions.length,
      healthy,
      unhealthy: agentSessions.length - healthy
    };
  }, { critical: false, description: 'Agent session health' });

  return monitor;
}

// ============================================================================
// EXAMPLE 5: Self-Healing Actions
// ============================================================================

function setupSelfHealing(healthMonitor) {
  const healer = new SelfHealer(healthMonitor, { enabled: true });

  // Register healing action for high swap usage
  healer.registerHealingAction(
    'reduce_agent_activity',
    (health) => {
      const swapCheck = health.checks.swap;
      return swapCheck && swapCheck.usagePercent > 80;
    },
    async () => {
      // Signal agents to reduce activity
      console.log('SelfHealer: Signaling agents to reduce activity due to high swap');
      // In real implementation, this would notify agents via the agent bus
      return { action: 'reduce_activity', success: true };
    },
    { cooldown: 120000 } // 2 minutes cooldown
  );

  // Register healing action for GitHub auth expiry
  healer.registerHealingAction(
    'refresh_github_auth',
    (health) => {
      const githubCheck = health.checks.github_auth;
      return githubCheck && githubCheck.status === 'UNHEALTHY';
    },
    async () => {
      console.log('SelfHealer: Attempting to refresh GitHub auth');
      // In real implementation, this could:
      // 1. Send notification to user to re-auth
      // 2. Attempt automated token refresh if using app auth
      return { action: 'notify_user', message: 'GitHub auth needs refresh' };
    },
    { cooldown: 300000 } // 5 minutes cooldown
  );

  return healer;
}

// ============================================================================
// EXAMPLE 6: Full Athena Integration
// ============================================================================

class AthenaFaultTolerance {
  constructor() {
    this.manager = new FaultToleranceManager({
      apis: [
        { name: 'openrouter', failureThreshold: 3, maxRequests: 50 },
        { name: 'gemini', failureThreshold: 5, maxRequests: 100 },
        { name: 'github', failureThreshold: 3, maxRequests: 30 }
      ],
      healthMonitor: { checkInterval: 30000 },
      selfHealer: { enabled: true }
    });

    // Setup agent bulkheads
    this.setupAgentBulkheads();
    
    // Setup custom health checks
    this.setupHealthChecks();
    
    // Setup self-healing actions
    this.setupSelfHealing();
  }

  setupAgentBulkheads() {
    // Critical agents get dedicated resources
    this.manager.createBulkhead('sterling', { 
      maxConcurrent: 5, 
      maxQueueSize: 50 
    });
    
    this.manager.createBulkhead('athena-main', { 
      maxConcurrent: 15, 
      maxQueueSize: 200 
    });
    
    // Non-critical agents share a pool
    this.manager.createBulkhead('general', { 
      maxConcurrent: 10, 
      maxQueueSize: 100 
    });
  }

  setupHealthChecks() {
    // Add system health checks
    this.manager.healthMonitor.registerCheck('disk_space', async () => {
      const { execSync } = require('child_process');
      try {
        const output = execSync('df -h /', { encoding: 'utf8' });
        const match = output.match(/(\d+)%/);
        if (match) {
          const usage = parseInt(match[1], 10);
          return {
            status: usage > 90 ? 'UNHEALTHY' : usage > 80 ? 'DEGRADED' : 'HEALTHY',
            usagePercent: usage
          };
        }
        return { status: 'UNKNOWN' };
      } catch {
        return { status: 'UNKNOWN', error: 'Could not check disk space' };
      }
    }, { critical: true });
  }

  setupSelfHealing() {
    this.manager.selfHealer.registerHealingAction(
      'high_memory_pressure',
      (health) => {
        const mem = health.checks.memory;
        return mem && mem.usagePercent > 85;
      },
      async () => {
        console.log('Memory pressure detected, clearing caches');
        if (global.gc) global.gc();
        return { action: 'gc', success: true };
      },
      { cooldown: 60000 }
    );
  }

  // Execute with full protection
  async executeAgentTask(agentName, fn, options = {}) {
    const bulkheadName = ['sterling', 'athena-main'].includes(agentName) 
      ? agentName 
      : 'general';

    return this.manager.execute({
      fn,
      bulkhead: bulkheadName,
      circuitBreaker: options.api,
      throttler: options.api,
      priority: options.priority || 'NORMAL',
      retry: options.retry || false,
      fallback: options.fallback
    });
  }

  // Get comprehensive status
  getStatus() {
    return this.manager.getStatus();
  }

  // Perform maintenance cycle
  async maintenance() {
    return this.manager.performMaintenance();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  AthenaFaultTolerance,
  exampleBasicApiProtection,
  exampleAgentBulkheads,
  exampleMultiProviderFallback,
  setupHealthMonitoring,
  setupSelfHealing
};

// Run examples if executed directly
if (require.main === module) {
  console.log('Running fault tolerance examples...\n');
  
  // Example: Get status
  const athena = new AthenaFaultTolerance();
  console.log('Initial Status:', JSON.stringify(athena.getStatus(), null, 2));
}
