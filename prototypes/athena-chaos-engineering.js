/**
 * Athena Chaos Engineering Framework
 * Proactively test fault tolerance through controlled failures
 * 
 * Principle: "You don't know if your system is resilient until you break it"
 */

const fs = require('fs').promises;
const path = require('path');

// ============================================================
// CHAOS EXPERIMENT DEFINITION
// ============================================================

class ChaosExperiment {
  constructor(config) {
    this.id = config.id || `exp-${Date.now()}`;
    this.name = config.name;
    this.description = config.description;
    this.target = config.target;          // What to attack
    this.attack = config.attack;          // Type of failure to inject
    this.duration = config.duration || 60000; // How long to run
    this.intensity = config.intensity || 'medium'; // low | medium | high
    this.hypothesis = config.hypothesis;  // What we expect to happen
    
    this.status = 'pending';    // pending | running | completed | failed | aborted
    this.startTime = null;
    this.endTime = null;
    this.observations = [];
    this.metrics = {
      before: {},
      during: {},
      after: {}
    };
    
    this.safetyChecks = config.safetyChecks || [];
    this.abortConditions = config.abortConditions || [];
    this.rollbackFn = config.rollback;
  }

  /**
   * Run the chaos experiment
   */
  async run() {
    this.status = 'running';
    this.startTime = Date.now();
    
    console.log(`\n🔬 CHAOS EXPERIMENT: ${this.name}`);
    console.log(`   Target: ${this.target}`);
    console.log(`   Attack: ${this.attack}`);
    console.log(`   Duration: ${this.duration}ms`);
    console.log(`   Hypothesis: ${this.hypothesis}\n`);
    
    try {
      // 1. Capture baseline metrics
      this.metrics.before = await this.captureMetrics();
      
      // 2. Run safety checks
      const safetyPassed = await this.runSafetyChecks();
      if (!safetyPassed) {
        this.status = 'aborted';
        this.observations.push({
          time: Date.now(),
          event: 'safety_check_failed',
          details: 'One or more safety checks failed'
        });
        return this.getResults();
      }
      
      // 3. Inject failure
      await this.injectFailure();
      
      // 4. Monitor during attack
      const monitorInterval = setInterval(async () => {
        this.metrics.during = await this.captureMetrics();
        
        // Check abort conditions
        if (await this.shouldAbort()) {
          clearInterval(monitorInterval);
          await this.abort();
        }
      }, 5000);
      
      // 5. Wait for duration
      await this.delay(this.duration);
      
      clearInterval(monitorInterval);
      
      // 6. Stop the attack
      await this.stopFailure();
      
      // 7. Capture recovery metrics
      this.metrics.after = await this.captureMetrics();
      
      this.status = 'completed';
      this.endTime = Date.now();
      
      // 8. Generate report
      const results = this.getResults();
      await this.saveResults(results);
      
      return results;
      
    } catch (error) {
      this.status = 'failed';
      this.observations.push({
        time: Date.now(),
        event: 'error',
        details: error.message
      });
      
      // Attempt rollback
      if (this.rollbackFn) {
        await this.rollbackFn();
      }
      
      throw error;
    }
  }

  /**
   * Inject the failure
   */
  async injectFailure() {
    this.observations.push({
      time: Date.now(),
      event: 'attack_started',
      attack: this.attack
    });
    
    // Actual injection happens via ChaosMonkey
  }

  /**
   * Stop the failure
   */
  async stopFailure() {
    this.observations.push({
      time: Date.now(),
      event: 'attack_stopped'
    });
  }

  /**
   * Capture system metrics
   */
  async captureMetrics() {
    return {
      timestamp: Date.now(),
      agents: await this.getAgentMetrics(),
      system: await this.getSystemMetrics()
    };
  }

  async getAgentMetrics() {
    // Placeholder - would integrate with actual agent monitoring
    return {
      active: 9,
      healthy: 8,
      degraded: 1
    };
  }

  async getSystemMetrics() {
    const usage = process.memoryUsage();
    return {
      memoryUsed: usage.heapUsed,
      memoryTotal: usage.heapTotal,
      uptime: process.uptime()
    };
  }

  /**
   * Run safety checks before experiment
   */
  async runSafetyChecks() {
    for (const check of this.safetyChecks) {
      const result = await check();
      if (!result.passed) {
        console.log(`   ⚠️  Safety check failed: ${check.name}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Check if experiment should be aborted
   */
  async shouldAbort() {
    for (const condition of this.abortConditions) {
      const triggered = await condition(this.metrics.during);
      if (triggered) {
        console.log(`   🛑 Abort condition triggered: ${condition.name}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Abort the experiment
   */
  async abort() {
    console.log(`\n   🛑 ABORTING EXPERIMENT: ${this.name}`);
    await this.stopFailure();
    this.status = 'aborted';
    this.endTime = Date.now();
    
    if (this.rollbackFn) {
      await this.rollbackFn();
    }
  }

  /**
   * Get experiment results
   */
  getResults() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      hypothesis: this.hypothesis,
      hypothesisValidated: this.validateHypothesis(),
      duration: this.endTime ? (this.endTime - this.startTime) : null,
      metrics: this.metrics,
      observations: this.observations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate if hypothesis was correct
   */
  validateHypothesis() {
    // To be implemented based on specific experiment
    return null; // Unknown
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveResults(results) {
    const resultsDir = '/root/.openclaw/workspace/memory/chaos-results';
    await fs.mkdir(resultsDir, { recursive: true });
    await fs.writeFile(
      path.join(resultsDir, `${this.id}.json`),
      JSON.stringify(results, null, 2)
    );
  }
}

// ============================================================
// CHAOS MONKEY - Failure Injector
// ============================================================

class ChaosMonkey {
  constructor() {
    this.activeAttacks = new Map();
    this.experiments = [];
  }

  /**
   * Kill a random agent
   */
  async killRandomAgent() {
    const agents = ['athena', 'sterling', 'ishtar', 'delver', 'squire', 'felicity', 'prometheus', 'cisco', 'themis'];
    const target = agents[Math.floor(Math.random() * agents.length)];
    
    console.log(`🐵 Chaos Monkey: Killing ${target}`);
    
    // In production, this would send a kill signal to the actual agent
    return {
      attack: 'kill_agent',
      target,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add latency to agent communication
   */
  async addLatency(agentId, latencyMs) {
    console.log(`🐵 Chaos Monkey: Adding ${latencyMs}ms latency to ${agentId}`);
    
    this.activeAttacks.set(`latency-${agentId}`, {
      type: 'latency',
      target: agentId,
      latencyMs
    });
    
    return { attack: 'latency', target: agentId, latencyMs };
  }

  /**
   * Simulate network partition between agents
   */
  async partitionAgents(agent1, agent2) {
    console.log(`🐵 Chaos Monkey: Partitioning ${agent1} <-> ${agent2}`);
    
    const partitionId = `partition-${agent1}-${agent2}`;
    this.activeAttacks.set(partitionId, {
      type: 'partition',
      agents: [agent1, agent2]
    });
    
    return { attack: 'partition', agents: [agent1, agent2] };
  }

  /**
   * Exhaust memory
   */
  async stressMemory(mb) {
    console.log(`🐵 Chaos Monkey: Stressing memory with ${mb}MB allocation`);
    
    const buffer = Buffer.alloc(mb * 1024 * 1024);
    this.activeAttacks.set('memory-stress', {
      type: 'memory_stress',
      buffer
    });
    
    return { attack: 'memory_stress', mb };
  }

  /**
   * Simulate CPU exhaustion
   */
  async stressCpu(durationMs) {
    console.log(`🐵 Chaos Monkey: Stressing CPU for ${durationMs}ms`);
    
    const startTime = Date.now();
    const stressId = `cpu-stress-${startTime}`;
    
    // CPU intensive loop
    const stress = () => {
      while (Date.now() - startTime < durationMs) {
        Math.random() * Math.random();
      }
    };
    
    // Run in separate "thread" (immediate Promise)
    setImmediate(stress);
    
    return { attack: 'cpu_stress', durationMs };
  }

  /**
   * Corrupt state file
   */
  async corruptStateFile(filePath) {
    console.log(`🐵 Chaos Monkey: Corrupting ${filePath}`);
    
    // Backup first
    const content = await fs.readFile(filePath, 'utf8').catch(() => null);
    if (content) {
      await fs.writeFile(`${filePath}.backup`, content);
    }
    
    // Write corrupted data
    await fs.writeFile(filePath, 'CORRUPTED_BY_CHAOS_MONKEY');
    
    return {
      attack: 'corrupt_file',
      file: filePath,
      backup: `${filePath}.backup`
    };
  }

  /**
   * Clear all active attacks
   */
  async clearAllAttacks() {
    console.log('🐵 Chaos Monkey: Clearing all attacks');
    
    for (const [id, attack] of this.activeAttacks) {
      if (attack.type === 'memory_stress' && attack.buffer) {
        attack.buffer.fill(0); // Clear memory
      }
    }
    
    this.activeAttacks.clear();
  }

  /**
   * Get active attacks
   */
  getActiveAttacks() {
    return Array.from(this.activeAttacks.entries()).map(([id, attack]) => ({
      id,
      ...attack
    }));
  }
}

// ============================================================
// PREDEFINED EXPERIMENTS FOR ATHENA
// ============================================================

const AthenaChaosExperiments = {
  /**
   * Test Sterling bidding failover
   */
  sterlingFailover: () => new ChaosExperiment({
    id: 'sterling-failover-test',
    name: 'Sterling Bidding Failover',
    description: 'Kill Sterling and verify bidding pauses or fails over',
    target: 'sterling',
    attack: 'kill_agent',
    duration: 60000,
    hypothesis: 'Bidding should pause within 30 seconds and resume when Sterling restarts',
    safetyChecks: [
      async () => ({ passed: true, name: 'No active bids in progress' })
    ],
    abortConditions: [
      async (metrics) => metrics?.agents?.healthy < 7 // Abort if too many agents unhealthy
    ]
  }),

  /**
   * Test dashboard resilience
   */
  dashboardLatency: () => new ChaosExperiment({
    id: 'dashboard-latency-test',
    name: 'Dashboard Under Latency',
    description: 'Add network latency and verify dashboard remains responsive',
    target: 'dashboard',
    attack: 'latency',
    duration: 30000,
    hypothesis: 'Dashboard should show loading states but remain functional',
    safetyChecks: [
      async () => ({ passed: true, name: 'Dashboard accessible' })
    ]
  }),

  /**
   * Test saga rollback
   */
  sagaRollback: () => new ChaosExperiment({
    id: 'saga-rollback-test',
    name: 'Saga Rollback During Failure',
    description: 'Fail mid-saga and verify compensation runs correctly',
    target: 'saga_orchestrator',
    attack: 'mid_saga_failure',
    duration: 15000,
    hypothesis: 'All completed steps should be compensated within 60 seconds'
  }),

  /**
   * Test leader election
   */
  leaderElection: () => new ChaosExperiment({
    id: 'leader-election-test',
    name: 'Leader Election During Partition',
    description: 'Partition leader and verify new leader is elected',
    target: 'leader_election',
    attack: 'leader_partition',
    duration: 45000,
    hypothesis: 'New leader should be elected within 15 seconds of partition'
  }),

  /**
   * Test circuit breaker
   */
  circuitBreakerTrip: () => new ChaosExperiment({
    id: 'circuit-breaker-test',
    name: 'Circuit Breaker Activation',
    description: 'Force failures to trip circuit breaker',
    target: 'external_api',
    attack: 'api_failures',
    duration: 60000,
    hypothesis: 'Circuit breaker should open after 5 failures and retry after 30s'
  })
};

// ============================================================
// CHAOS SCHEDULER
// ============================================================

class ChaosScheduler {
  constructor() {
    this.monkey = new ChaosMonkey();
    this.experiments = [];
    this.schedule = [];
  }

  /**
   * Schedule regular chaos experiments
   */
  scheduleExperiment(experiment, cronExpression) {
    this.schedule.push({
      experiment,
      cron: cronExpression,
      lastRun: null,
      nextRun: null
    });
  }

  /**
   * Run all due experiments
   */
  async runDue() {
    const now = new Date();
    const results = [];
    
    for (const scheduled of this.schedule) {
      // Check if due (simplified - would use proper cron parsing)
      if (this.isDue(scheduled, now)) {
        const result = await scheduled.experiment.run();
        scheduled.lastRun = now;
        results.push(result);
      }
    }
    
    return results;
  }

  isDue(scheduled, now) {
    // Simplified - check if never run or due based on cron
    if (!scheduled.lastRun) return true;
    return false;
  }

  /**
   * Run a random experiment (Game Day style)
   */
  async runRandom() {
    const experiments = Object.values(AthenaChaosExperiments).map(fn => fn());
    const random = experiments[Math.floor(Math.random() * experiments.length)];
    return random.run();
  }

  /**
   * Run all experiments (full suite)
   */
  async runAll() {
    const results = [];
    for (const experimentFactory of Object.values(AthenaChaosExperiments)) {
      const experiment = experimentFactory();
      results.push(await experiment.run());
    }
    return results;
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  ChaosExperiment,
  ChaosMonkey,
  ChaosScheduler,
  AthenaChaosExperiments
};
