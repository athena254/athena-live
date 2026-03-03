/**
 * Athena Fault Tolerance Module
 * 
 * Comprehensive fault tolerance system for multi-agent architecture.
 * Combines Circuit Breaker, Bulkhead, Throttling, Retry, and Health Monitoring.
 * 
 * @module athena-fault-tolerance
 * @author Ishtar (PAI Architecture)
 * @version 1.0.0
 */

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by stopping requests to failing services.
 * States: CLOSED (normal) → OPEN (failing) → HALF-OPEN (testing recovery)
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.resetTimeout = options.resetTimeout || 30000;
    
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.lastFailure = null;
    this.lastStateChange = Date.now();
    
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      stateChanges: 0
    };
  }

  async execute(fn, fallback = null) {
    this.stats.totalCalls++;
    
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailure > this.resetTimeout) {
        this.transitionTo('HALF-OPEN');
      } else {
        this.stats.rejectedCalls++;
        if (fallback) {
          return fallback();
        }
        throw new CircuitBreakerError(
          `Circuit breaker [${this.name}] is OPEN`,
          this.getStats()
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.stats.successfulCalls++;
    
    if (this.state === 'HALF-OPEN') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.transitionTo('CLOSED');
      }
    } else {
      this.failures = 0;
    }
  }

  onFailure() {
    this.stats.failedCalls++;
    this.failures++;
    this.lastFailure = Date.now();
    this.successes = 0;
    
    if (this.state === 'HALF-OPEN') {
      this.transitionTo('OPEN');
    } else if (this.failures >= this.failureThreshold) {
      this.transitionTo('OPEN');
    }
  }

  transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = Date.now();
    this.stats.stateChanges++;
    
    console.log(`CircuitBreaker [${this.name}]: ${oldState} → ${newState}`);
    
    if (newState === 'CLOSED') {
      this.failures = 0;
      this.successes = 0;
    }
  }

  getStats() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      ...this.stats,
      uptime: Date.now() - this.lastStateChange
    };
  }

  isOpen() {
    return this.state === 'OPEN';
  }

  isClosed() {
    return this.state === 'CLOSED';
  }

  reset() {
    this.transitionTo('CLOSED');
    this.failures = 0;
    this.successes = 0;
    this.lastFailure = null;
  }
}

class CircuitBreakerError extends Error {
  constructor(message, stats) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.stats = stats;
  }
}

// ============================================================================
// BULKHEAD (Resource Isolation)
// ============================================================================

/**
 * Bulkhead Pattern Implementation
 * 
 * Isolates resources to prevent cascade failures.
 * Like ship compartments - if one floods, others stay dry.
 */
class Bulkhead {
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.maxConcurrent = options.maxConcurrent || 10;
    this.maxQueueSize = options.maxQueueSize || 100;
    this.timeout = options.timeout || 30000;
    
    this.active = 0;
    this.queue = [];
    this.stats = {
      totalCalls: 0,
      acceptedCalls: 0,
      rejectedCalls: 0,
      queueTimeouts: 0
    };
  }

  async execute(fn, priority = 'NORMAL') {
    this.stats.totalCalls++;
    
    if (this.active >= this.maxConcurrent) {
      if (this.queue.length >= this.maxQueueSize) {
        this.stats.rejectedCalls++;
        throw new BulkheadError(
          `Bulkhead [${this.name}] queue full (${this.queue.length}/${this.maxQueueSize})`,
          this.getStats()
        );
      }
      
      return this.queueCall(fn, priority);
    }
    
    this.stats.acceptedCalls++;
    return this.executeCall(fn);
  }

  async queueCall(fn, priority) {
    return new Promise((resolve, reject) => {
      const item = {
        fn,
        resolve,
        reject,
        priority: this.priorityValue(priority),
        enqueuedAt: Date.now()
      };
      
      // Priority queue insertion
      const insertIndex = this.queue.findIndex(i => i.priority > item.priority);
      if (insertIndex === -1) {
        this.queue.push(item);
      } else {
        this.queue.splice(insertIndex, 0, item);
      }
      
      // Timeout handler
      const timeoutId = setTimeout(() => {
        const idx = this.queue.indexOf(item);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          this.stats.queueTimeouts++;
          reject(new BulkheadError(
            `Bulkhead [${this.name}] queue timeout`,
            this.getStats()
          ));
        }
      }, this.timeout);
      
      // Store timeout for cleanup
      item.timeoutId = timeoutId;
    });
  }

  async executeCall(fn) {
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      this.processQueue();
    }
  }

  processQueue() {
    while (this.queue.length > 0 && this.active < this.maxConcurrent) {
      const item = this.queue.shift();
      clearTimeout(item.timeoutId);
      this.stats.acceptedCalls++;
      this.executeCall(item.fn)
        .then(item.resolve)
        .catch(item.reject);
    }
  }

  priorityValue(priority) {
    const priorities = {
      'CRITICAL': 0,
      'HIGH': 1,
      'NORMAL': 2,
      'LOW': 3
    };
    return priorities[priority] ?? 2;
  }

  getStats() {
    return {
      name: this.name,
      active: this.active,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      maxQueueSize: this.maxQueueSize,
      ...this.stats
    };
  }

  getAvailableSlots() {
    return Math.max(0, this.maxConcurrent - this.active);
  }

  getQueueLength() {
    return this.queue.length;
  }
}

class BulkheadError extends Error {
  constructor(message, stats) {
    super(message);
    this.name = 'BulkheadError';
    this.stats = stats;
  }
}

// ============================================================================
// THROTTLER (Rate Limiting)
// ============================================================================

/**
 * Throttler Pattern Implementation
 * 
 * Controls resource consumption through rate limiting.
 * Supports multiple strategies: token bucket, sliding window, priority.
 */
class Throttler {
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.maxRequests = options.maxRequests || 100;
    this.windowMs = options.windowMs || 60000;
    this.strategy = options.strategy || 'sliding-window';
    
    this.requests = [];
    this.priorities = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    
    this.stats = {
      totalCalls: 0,
      allowedCalls: 0,
      rejectedCalls: 0,
      highPriorityOverrides: 0
    };
  }

  async execute(fn, priority = 'MEDIUM') {
    this.stats.totalCalls++;
    
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      if (priority === 'HIGH') {
        this.stats.highPriorityOverrides++;
        this.requests.push(now);
        this.stats.allowedCalls++;
        return fn();
      }
      
      this.stats.rejectedCalls++;
      throw new ThrottlerError(
        `Throttler [${this.name}] rate limit exceeded`,
        this.getStats()
      );
    }
    
    this.requests.push(now);
    this.stats.allowedCalls++;
    return fn();
  }

  getStats() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    return {
      name: this.name,
      strategy: this.strategy,
      windowMs: this.windowMs,
      maxRequests: this.maxRequests,
      currentUsage: this.requests.length,
      remaining: Math.max(0, this.maxRequests - this.requests.length),
      usagePercent: (this.requests.length / this.maxRequests * 100).toFixed(1),
      windowResetsIn: this.requests.length > 0 
        ? Math.max(0, this.windowMs - (now - this.requests[0]))
        : 0,
      ...this.stats
    };
  }

  getRemainingRequests() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  reset() {
    this.requests = [];
  }
}

class ThrottlerError extends Error {
  constructor(message, stats) {
    super(message);
    this.name = 'ThrottlerError';
    this.stats = stats;
  }
}

// ============================================================================
// RETRY POLICY (with Exponential Backoff)
// ============================================================================

/**
 * Retry Policy Implementation
 * 
 * Handles transient failures with exponential backoff and jitter.
 */
class RetryPolicy {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.jitter = options.jitter !== false;
    this.retryableStatusCodes = options.retryableStatusCodes || [408, 429, 500, 502, 503, 504];
    
    this.stats = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      retryCount: 0
    };
  }

  async execute(fn) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      this.stats.totalAttempts++;
      
      try {
        const result = await fn();
        this.stats.successfulAttempts++;
        return result;
      } catch (error) {
        lastError = error;
        this.stats.failedAttempts++;
        
        if (attempt < this.maxRetries && this.isRetryable(error)) {
          this.stats.retryCount++;
          const delay = this.calculateDelay(attempt);
          console.log(`Retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  calculateDelay(attempt) {
    const exponential = Math.min(
      this.baseDelay * Math.pow(2, attempt),
      this.maxDelay
    );
    
    if (this.jitter) {
      // Full jitter: random between 0 and exponential
      return Math.floor(Math.random() * exponential);
    }
    
    return exponential;
  }

  isRetryable(error) {
    // Check status code if present
    if (error.status && !this.retryableStatusCodes.includes(error.status)) {
      return false;
    }
    
    // Check for specific error types
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN',
      'NetworkError',
      'TimeoutError'
    ];
    
    return retryableErrors.some(e => 
      error.code === e || error.name === e || error.message?.includes(e)
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalAttempts > 0 
        ? (this.stats.successfulAttempts / this.stats.totalAttempts * 100).toFixed(1)
        : 0
    };
  }
}

// ============================================================================
// HEALTH MONITOR
// ============================================================================

/**
 * Health Monitor Implementation
 * 
 * Monitors system health through registered health checks.
 */
class HealthMonitor {
  constructor(options = {}) {
    this.checkInterval = options.checkInterval || 30000;
    this.checks = new Map();
    this.status = 'UNKNOWN';
    this.lastCheck = null;
    this.checkHistory = [];
    
    this.registerDefaultChecks();
  }

  registerCheck(name, checkFn, options = {}) {
    this.checks.set(name, {
      fn: checkFn,
      interval: options.interval || this.checkInterval,
      timeout: options.timeout || 5000,
      critical: options.critical || false,
      description: options.description || name,
      lastCheck: null,
      lastStatus: 'UNKNOWN',
      lastError: null
    });
  }

  registerDefaultChecks() {
    // Memory check
    this.registerCheck('memory', async () => {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
      const usagePercent = (usage.heapUsed / usage.heapTotal * 100).toFixed(1);
      
      return {
        status: usagePercent > 90 ? 'UNHEALTHY' : usagePercent > 75 ? 'DEGRADED' : 'HEALTHY',
        heapUsedMB,
        heapTotalMB,
        usagePercent: parseFloat(usagePercent)
      };
    }, { critical: true, description: 'Node.js heap memory' });

    // Event loop lag check
    this.registerCheck('eventLoop', async () => {
      return new Promise((resolve) => {
        const start = Date.now();
        setImmediate(() => {
          const lag = Date.now() - start;
          resolve({
            status: lag > 100 ? 'UNHEALTHY' : lag > 50 ? 'DEGRADED' : 'HEALTHY',
            lagMs: lag
          });
        });
      });
    }, { critical: false, description: 'Event loop responsiveness' });
  }

  async runCheck(name) {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Unknown health check: ${name}`);
    }

    try {
      const result = await Promise.race([
        check.fn(),
        this.timeout(check.timeout, name)
      ]);
      
      check.lastCheck = Date.now();
      check.lastStatus = result.status || 'HEALTHY';
      check.lastError = null;
      
      return { name, ...result };
    } catch (error) {
      check.lastCheck = Date.now();
      check.lastStatus = 'UNHEALTHY';
      check.lastError = error.message;
      
      return { name, status: 'UNHEALTHY', error: error.message };
    }
  }

  async runAllChecks() {
    const results = {};
    let criticalHealthy = true;
    let anyDegraded = false;

    for (const [name, check] of this.checks) {
      const result = await this.runCheck(name);
      results[name] = result;
      
      if (check.critical && result.status !== 'HEALTHY') {
        criticalHealthy = false;
      }
      if (result.status === 'DEGRADED') {
        anyDegraded = true;
      }
    }

    this.lastCheck = Date.now();
    this.status = criticalHealthy 
      ? (anyDegraded ? 'DEGRADED' : 'HEALTHY') 
      : 'UNHEALTHY';
    
    // Record history
    this.checkHistory.push({
      timestamp: this.lastCheck,
      status: this.status,
      checks: Object.fromEntries(
        Object.entries(results).map(([k, v]) => [k, v.status])
      )
    });
    
    // Keep last 100 entries
    if (this.checkHistory.length > 100) {
      this.checkHistory = this.checkHistory.slice(-100);
    }

    return {
      status: this.status,
      timestamp: this.lastCheck,
      checks: results
    };
  }

  timeout(ms, name) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Health check [${name}] timed out`)), ms)
    );
  }

  getSummary() {
    return {
      status: this.status,
      lastCheck: this.lastCheck,
      checkCount: this.checks.size,
      checks: Object.fromEntries(
        Array.from(this.checks.entries()).map(([name, check]) => [
          name, 
          { status: check.lastStatus, lastCheck: check.lastCheck }
        ])
      )
    };
  }
}

// ============================================================================
// SELF HEALER
// ============================================================================

/**
 * Self-Healer Implementation
 * 
 * Automatically recovers from failures through registered healing actions.
 */
class SelfHealer {
  constructor(healthMonitor, options = {}) {
    this.monitor = healthMonitor;
    this.healingActions = new Map();
    this.healingHistory = [];
    this.maxHistory = options.maxHistory || 100;
    this.enabled = options.enabled !== false;
    
    this.registerDefaultHealingActions();
  }

  registerHealingAction(name, condition, action, options = {}) {
    this.healingActions.set(name, {
      condition,
      action,
      cooldown: options.cooldown || 300000, // 5 minutes
      lastTriggered: 0,
      triggerCount: 0
    });
  }

  registerDefaultHealingActions() {
    // High memory healing
    this.registerHealingAction(
      'clear_memory',
      (health) => {
        const memoryCheck = health.checks.memory;
        return memoryCheck && memoryCheck.usagePercent > 85;
      },
      async () => {
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          console.log('SelfHealer: Triggered garbage collection');
        }
        return { action: 'gc', success: true };
      },
      { cooldown: 60000 }
    );
  }

  async checkAndHeal() {
    if (!this.enabled) {
      return { healingPerformed: false, reason: 'Self-healing disabled' };
    }

    const health = await this.monitor.runAllChecks();
    const healingResults = [];

    for (const [name, config] of this.healingActions) {
      const shouldHeal = this.shouldHeal(name, health, config);
      
      if (shouldHeal) {
        console.log(`SelfHealer: Triggering healing action [${name}]`);
        config.lastTriggered = Date.now();
        config.triggerCount++;
        
        try {
          const result = await config.action();
          healingResults.push({ name, success: true, result });
        } catch (error) {
          healingResults.push({ name, success: false, error: error.message });
        }
      }
    }

    // Record in history
    if (healingResults.length > 0) {
      this.healingHistory.push({
        timestamp: Date.now(),
        results: healingResults
      });
      
      if (this.healingHistory.length > this.maxHistory) {
        this.healingHistory = this.healingHistory.slice(-this.maxHistory);
      }
    }

    return {
      health,
      healingResults,
      healingPerformed: healingResults.length > 0
    };
  }

  shouldHeal(name, health, config) {
    const now = Date.now();
    
    // Check cooldown
    if (now - config.lastTriggered < config.cooldown) {
      return false;
    }
    
    // Check condition
    try {
      return config.condition(health);
    } catch (error) {
      console.error(`SelfHealer: Error checking condition for [${name}]:`, error);
      return false;
    }
  }

  getHistory(limit = 10) {
    return this.healingHistory.slice(-limit);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

// ============================================================================
// FAULT TOLERANCE MANAGER (Combined)
// ============================================================================

/**
 * Fault Tolerance Manager
 * 
 * Combines all fault tolerance patterns into a unified system.
 */
class FaultToleranceManager {
  constructor(options = {}) {
    this.circuitBreakers = new Map();
    this.bulkheads = new Map();
    this.throttlers = new Map();
    this.retryPolicies = new Map();
    this.healthMonitor = new HealthMonitor(options.healthMonitor);
    this.selfHealer = new SelfHealer(this.healthMonitor, options.selfHealer);
    
    this.registerApiCircuitBreakers(options.apis || []);
  }

  // Circuit Breaker Management
  createCircuitBreaker(name, options = {}) {
    const cb = new CircuitBreaker({ name, ...options });
    this.circuitBreakers.set(name, cb);
    return cb;
  }

  getCircuitBreaker(name) {
    return this.circuitBreakers.get(name);
  }

  // Bulkhead Management
  createBulkhead(name, options = {}) {
    const bulkhead = new Bulkhead({ name, ...options });
    this.bulkheads.set(name, bulkhead);
    return bulkhead;
  }

  getBulkhead(name) {
    return this.bulkheads.get(name);
  }

  // Throttler Management
  createThrottler(name, options = {}) {
    const throttler = new Throttler({ name, ...options });
    this.throttlers.set(name, throttler);
    return throttler;
  }

  getThrottler(name) {
    return this.throttlers.get(name);
  }

  // Default API Circuit Breakers
  registerApiCircuitBreakers(apis) {
    const defaultApis = [
      { name: 'openrouter', failureThreshold: 3, resetTimeout: 60000 },
      { name: 'gemini', failureThreshold: 5, resetTimeout: 30000 },
      { name: 'github', failureThreshold: 3, resetTimeout: 60000 }
    ];
    
    const allApis = [...defaultApis, ...apis];
    
    for (const api of allApis) {
      this.createCircuitBreaker(api.name, api);
      this.createThrottler(api.name, { 
        maxRequests: api.maxRequests || 100,
        windowMs: api.windowMs || 60000
      });
    }
  }

  // Execute with all protections
  async execute(options) {
    const {
      fn,
      circuitBreaker: cbName,
      bulkhead: bulkheadName,
      throttler: throttlerName,
      priority = 'NORMAL',
      fallback = null,
      retry = false
    } = options;

    let executable = fn;

    // Wrap with retry if enabled
    if (retry) {
      const retryPolicy = retry instanceof RetryPolicy 
        ? retry 
        : new RetryPolicy(typeof retry === 'object' ? retry : {});
      executable = () => retryPolicy.execute(fn);
    }

    // Wrap with circuit breaker
    if (cbName) {
      const cb = this.circuitBreakers.get(cbName);
      if (cb) {
        const originalExecutable = executable;
        executable = () => cb.execute(originalExecutable, fallback);
      }
    }

    // Wrap with throttler
    if (throttlerName) {
      const throttler = this.throttlers.get(throttlerName);
      if (throttler) {
        const originalExecutable = executable;
        executable = () => throttler.execute(originalExecutable, priority);
      }
    }

    // Wrap with bulkhead
    if (bulkheadName) {
      const bulkhead = this.bulkheads.get(bulkheadName);
      if (bulkhead) {
        const originalExecutable = executable;
        executable = () => bulkhead.execute(originalExecutable, priority);
      }
    }

    return executable();
  }

  // Get comprehensive status
  getStatus() {
    return {
      circuitBreakers: Object.fromEntries(
        Array.from(this.circuitBreakers.entries())
          .map(([k, v]) => [k, v.getStats()])
      ),
      bulkheads: Object.fromEntries(
        Array.from(this.bulkheads.entries())
          .map(([k, v]) => [k, v.getStats()])
      ),
      throttlers: Object.fromEntries(
        Array.from(this.throttlers.entries())
          .map(([k, v]) => [k, v.getStats()])
      ),
      health: this.healthMonitor.getSummary(),
      selfHealer: {
        enabled: this.selfHealer.enabled,
        historyCount: this.selfHealer.healingHistory.length
      }
    };
  }

  // Health check and self-heal
  async performMaintenance() {
    return this.selfHealer.checkAndHeal();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  CircuitBreaker,
  CircuitBreakerError,
  Bulkhead,
  BulkheadError,
  Throttler,
  ThrottlerError,
  RetryPolicy,
  HealthMonitor,
  SelfHealer,
  FaultToleranceManager
};
