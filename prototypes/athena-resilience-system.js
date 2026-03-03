/**
 * Athena Fault Tolerance Integration
 * Combines all resilience patterns into a cohesive system
 * 
 * Patterns integrated:
 * - Circuit Breaker
 * - Bulkhead
 * - Throttling
 * - Retry with Exponential Backoff
 * - Health Monitoring
 * - Self-Healing
 * - Saga (distributed transactions)
 * - Leader Election
 * - Event Sourcing
 * - Chaos Engineering
 * - Distributed Tracing
 */

const CircuitBreaker = require('./athena-circuit-breaker');
const Bulkhead = require('./athena-bulkhead');
const Throttler = require('./athena-throttler');
const HealthMonitor = require('./athena-health-monitor');
const SelfHealer = require('./athena-self-healer');
const { SagaOrchestrator, createBeelancerBidSaga } = require('./athena-saga');
const { LeaderElection, CriticalAgentRegistry } = require('./athena-leader-election');
const { EventStore, SterlingBiddingAggregate, AgentHealthAggregate, TemporalQuery, AuditLog } = require('./athena-event-sourcing');
const { ChaosScheduler, AthenaChaosExperiments } = require('./athena-chaos-engineering');
const { Tracer, TraceAnalyzer, tracedFetch } = require('./athena-distributed-tracing');

// ============================================================
// ATHENA RESILIENCE ORCHESTRATOR
// ============================================================

class AthenaResilienceOrchestrator {
  constructor(config = {}) {
    this.config = {
      agentId: config.agentId || 'athena',
      enableTracing: config.enableTracing !== false,
      enableHealthMonitoring: config.enableHealthMonitoring !== false,
      enableSelfHealing: config.enableSelfHealing !== false,
      enableLeaderElection: config.enableLeaderElection || false,
      enableEventSourcing: config.enableEventSourcing !== false,
      enableChaosEngineering: config.enableChaosEngineering || false,
      ...config
    };

    // Initialize components
    this.tracer = new Tracer(this.config.agentId);
    this.traceAnalyzer = new TraceAnalyzer();
    this.eventStore = new EventStore();
    this.auditLog = new AuditLog(this.eventStore);
    this.healthMonitor = new HealthMonitor();
    this.selfHealer = new SelfHealer();
    this.chaosScheduler = new ChaosScheduler();
    
    // Circuit breakers per external service
    this.circuitBreakers = new Map();
    
    // Bulkheads per agent
    this.bulkheads = new Map();
    
    // Throttlers per operation type
    this.throttlers = new Map();
    
    // Leader election registry
    this.leaderRegistry = new CriticalAgentRegistry();
    
    // Aggregate instances
    this.aggregates = new Map();
    
    this.initialized = false;
  }

  /**
   * Initialize the resilience system
   */
  async initialize() {
    console.log(`\n🛡️ Initializing Athena Resilience System for ${this.config.agentId}`);
    
    // Initialize health monitor
    if (this.config.enableHealthMonitoring) {
      await this.healthMonitor.start();
      console.log('   ✓ Health monitoring started');
    }
    
    // Initialize self-healer
    if (this.config.enableSelfHealing) {
      await this.selfHealer.start();
      console.log('   ✓ Self-healing started');
    }
    
    // Initialize circuit breakers for known services
    this.registerCircuitBreaker('beelancer-api', { failureThreshold: 5, resetTimeout: 30000 });
    this.registerCircuitBreaker('openai-api', { failureThreshold: 10, resetTimeout: 60000 });
    this.registerCircuitBreaker('telegram-api', { failureThreshold: 3, resetTimeout: 15000 });
    console.log('   ✓ Circuit breakers registered');
    
    // Initialize bulkheads
    this.registerBulkhead('bidding', { maxConcurrent: 5 });
    this.registerBulkhead('notifications', { maxConcurrent: 10 });
    this.registerBulkhead('research', { maxConcurrent: 3 });
    console.log('   ✓ Bulkheads configured');
    
    // Initialize throttlers
    this.registerThrottler('bids', { maxPerMinute: 20 });
    this.registerThrottler('notifications', { maxPerMinute: 60 });
    this.registerThrottler('api-calls', { maxPerMinute: 100 });
    console.log('   ✓ Throttlers configured');
    
    // Register agents for health monitoring
    const agents = ['athena', 'sterling', 'ishtar', 'delver', 'squire', 'felicity', 'prometheus', 'cisco', 'themis'];
    for (const agent of agents) {
      this.healthMonitor.registerAgent(agent);
    }
    console.log('   ✓ Agents registered for monitoring');
    
    // Schedule periodic chaos experiments (if enabled)
    if (this.config.enableChaosEngineering) {
      // Run chaos experiments weekly
      // this.chaosScheduler.scheduleExperiment(AthenaChaosExperiments.sterlingFailover(), '0 3 * * 0');
      console.log('   ✓ Chaos engineering enabled');
    }
    
    this.initialized = true;
    console.log('\n✅ Athena Resilience System initialized\n');
    
    return this;
  }

  /**
   * Shutdown the resilience system
   */
  async shutdown() {
    console.log('\n🛑 Shutting down Athena Resilience System');
    
    if (this.healthMonitor) await this.healthMonitor.stop();
    if (this.selfHealer) await this.selfHealer.stop();
    if (this.leaderRegistry) await this.leaderRegistry.stopAll();
    
    this.initialized = false;
    console.log('✅ Shutdown complete\n');
  }

  // ============================================================
  // CIRCUIT BREAKER MANAGEMENT
  // ============================================================

  registerCircuitBreaker(name, options) {
    const cb = new CircuitBreaker(name, options);
    this.circuitBreakers.set(name, cb);
    return cb;
  }

  getCircuitBreaker(name) {
    return this.circuitBreakers.get(name);
  }

  async executeWithCircuitBreaker(serviceName, operation) {
    const cb = this.circuitBreakers.get(serviceName);
    if (!cb) {
      throw new Error(`No circuit breaker registered for ${serviceName}`);
    }
    return cb.execute(operation);
  }

  // ============================================================
  // BULKHEAD MANAGEMENT
  // ============================================================

  registerBulkhead(name, options) {
    const bulkhead = new Bulkhead(name, options);
    this.bulkheads.set(name, bulkhead);
    return bulkhead;
  }

  getBulkhead(name) {
    return this.bulkheads.get(name);
  }

  async executeInBulkhead(name, operation) {
    const bulkhead = this.bulkheads.get(name);
    if (!bulkhead) {
      return operation(); // No bulkhead, run directly
    }
    return bulkhead.execute(operation);
  }

  // ============================================================
  // THROTTLER MANAGEMENT
  // ============================================================

  registerThrottler(name, options) {
    const throttler = new Throttler(name, options);
    this.throttlers.set(name, throttler);
    return throttler;
  }

  getThrottler(name) {
    return this.throttlers.get(name);
  }

  async throttle(name) {
    const throttler = this.throttlers.get(name);
    if (throttler) {
      await throttler.acquire();
    }
  }

  // ============================================================
  // TRACING
  // ============================================================

  startTrace(operationName, options = {}) {
    return this.tracer.startSpan(operationName, {
      agentId: this.config.agentId,
      ...options
    });
  }

  async withTrace(operationName, fn, options = {}) {
    return this.tracer.withSpan(operationName, fn, {
      agentId: this.config.agentId,
      ...options
    });
  }

  async analyzeTrace(traceId) {
    return this.traceAnalyzer.analyzeTrace(traceId);
  }

  // ============================================================
  // EVENT SOURCING
  // ============================================================

  async getAggregate(aggregateId, AggregateClass) {
    let aggregate = this.aggregates.get(aggregateId);
    if (!aggregate) {
      aggregate = new AggregateClass(aggregateId, this.eventStore);
      await aggregate.load();
      this.aggregates.set(aggregateId, aggregate);
    }
    return aggregate;
  }

  async saveAggregate(aggregateId) {
    const aggregate = this.aggregates.get(aggregateId);
    if (aggregate) {
      await aggregate.commit();
    }
  }

  // ============================================================
  // SAGA EXECUTION
  // ============================================================

  async executeSaga(saga) {
    return this.withTrace('saga-execution', async (span) => {
      span.setTag('saga.id', saga.sagaId);
      
      try {
        const result = await saga.execute();
        span.setTag('saga.status', 'completed');
        return result;
      } catch (error) {
        span.setTag('saga.status', 'failed');
        span.setError(error);
        throw error;
      }
    });
  }

  // ============================================================
  // HEALTH & HEALING
  // ============================================================

  getHealthStatus() {
    return this.healthMonitor.getStatus();
  }

  async getAgentHealth(agentId) {
    const aggregate = await this.getAggregate(`agent-health-${agentId}`, AgentHealthAggregate);
    return aggregate.getState();
  }

  async triggerHealing(agentId, issue) {
    return this.selfHealer.heal(agentId, issue);
  }

  // ============================================================
  // LEADER ELECTION
  // ============================================================

  async registerForLeadership(role, callbacks) {
    return this.leaderRegistry.registerRole(role, this.config.agentId, callbacks);
  }

  isLeader(role) {
    return this.leaderRegistry.isLeaderFor(role);
  }

  // ============================================================
  // AUDIT & COMPLIANCE
  // ============================================================

  async audit(action, details) {
    return this.auditLog.log(action, {
      ...details,
      actor: this.config.agentId
    });
  }

  async getAuditTrail(resource, options = {}) {
    return this.auditLog.getAuditTrail(resource, options);
  }

  // ============================================================
  // COMPREHENSIVE STATUS
  // ============================================================

  getStatus() {
    return {
      agentId: this.config.agentId,
      initialized: this.initialized,
      
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([name, cb]) => ({
        name,
        ...cb.getStatus()
      })),
      
      bulkheads: Array.from(this.bulkheads.entries()).map(([name, bh]) => ({
        name,
        ...bh.getStatus()
      })),
      
      throttlers: Array.from(this.throttlers.entries()).map(([name, th]) => ({
        name,
        ...th.getStatus()
      })),
      
      health: this.healthMonitor.getStatus(),
      
      leaderElection: this.leaderRegistry.getAllStatuses()
    };
  }
}

// ============================================================
// PRESET CONFIGURATIONS
// ============================================================

const AthenaPresets = {
  /**
   * Sterling configuration (bidding focus)
   */
  sterling: {
    agentId: 'sterling',
    enableLeaderElection: true,
    circuitBreakers: {
      'beelancer-api': { failureThreshold: 3, resetTimeout: 30000 }
    },
    bulkheads: {
      'bidding': { maxConcurrent: 5 }
    },
    throttlers: {
      'bids': { maxPerMinute: 30 }
    }
  },

  /**
   * Ishtar configuration (research focus)
   */
  ishtar: {
    agentId: 'ishtar',
    bulkheads: {
      'research': { maxConcurrent: 3 }
    },
    throttlers: {
      'api-calls': { maxPerMinute: 60 }
    }
  },

  /**
   * Delver configuration (coding focus)
   */
  delver: {
    agentId: 'delver',
    bulkheads: {
      'coding': { maxConcurrent: 5 }
    },
    circuitBreakers: {
      'github-api': { failureThreshold: 5, resetTimeout: 60000 }
    }
  },

  /**
   * Full Athena system configuration
   */
  fullSystem: {
    agentId: 'athena',
    enableTracing: true,
    enableHealthMonitoring: true,
    enableSelfHealing: true,
    enableLeaderElection: true,
    enableEventSourcing: true,
    enableChaosEngineering: true
  }
};

// ============================================================
// FACTORY FUNCTIONS
// ============================================================

function createResilientAgent(agentId, preset) {
  const config = typeof preset === 'string' ? AthenaPresets[preset] : preset;
  return new AthenaResilienceOrchestrator({ agentId, ...config });
}

function createSterlingResilience() {
  return createResilientAgent('sterling', 'sterling');
}

function createIshtarResilience() {
  return createResilientAgent('ishtar', 'ishtar');
}

function createFullAthenaResilience() {
  return createResilientAgent('athena', 'fullSystem');
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  AthenaResilienceOrchestrator,
  AthenaPresets,
  createResilientAgent,
  createSterlingResilience,
  createIshtarResilience,
  createFullAthenaResilience,
  
  // Re-export components
  CircuitBreaker,
  Bulkhead,
  Throttler,
  HealthMonitor,
  SelfHealer,
  SagaOrchestrator,
  LeaderElection,
  EventStore,
  ChaosScheduler,
  Tracer,
  TraceAnalyzer
};
