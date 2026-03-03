# Ishtar Research Log - Multi-Agent Fault Tolerance

**Session:** Day Cycle 2026-03-02 (04:00 UTC)
**Topic:** Multi-Agent Fault Tolerance & Self-Healing Architecture
**Priority:** CRITICAL
**Status:** IN_PROGRESS

---

## Context & Triggering Issues

This research addresses recurring system stability issues:
- **Swap exhaustion** (was 100%, now 47%)
- **API quota exhaustion** (Gemini embeddings, OpenRouter errors)
- **GitHub auth expired** - backups failing
- **Beelancer bidding blocked** - Chrome extension not attached
- **Dashboard HTML empty** - needed restoration

**System Constraints:**
- Memory: 3.8GB total (~60% used)
- Swap: 495MB total (47% used)
- Disk: 79GB total (57% used)
- Agents: 9 total (4 healthy, 5 degraded)

---

## Research Findings

### 1. Circuit Breaker Pattern

**Purpose:** Prevent cascading failures by detecting failures and stopping requests to failing services.

**Key Concepts:**
- **Three States:** Closed → Open → Half-Open
- **Closed:** Normal operation, requests flow through
- **Open:** Failure threshold exceeded, requests blocked fast
- **Half-Open:** Testing if service recovered, limited requests allowed

**Implementation for Athena:**
```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30s
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailure = null;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'HALF-OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
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
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

**When to Use:**
- External API calls (OpenRouter, Gemini, etc.)
- Database connections
- Network requests to services

---

### 2. Bulkhead Pattern

**Purpose:** Isolate failures to prevent cascade. Like ship compartments - if one floods, others stay dry.

**Key Concepts:**
- **Resource Isolation:** Separate connection pools per service
- **Process Isolation:** Separate processes/containers per critical service
- **Queue Isolation:** Separate message queues per consumer group

**Implementation for Athena:**
```javascript
class Bulkhead {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 10;
    this.maxQueueSize = options.maxQueueSize || 100;
    this.active = 0;
    this.queue = [];
  }

  async execute(fn) {
    if (this.active >= this.maxConcurrent) {
      if (this.queue.length >= this.maxQueueSize) {
        throw new Error('Bulkhead queue full');
      }
      return new Promise((resolve, reject) => {
        this.queue.push({ fn, resolve, reject });
      });
    }

    this.active++;
    try {
      const result = await fn();
      return result;
    } finally {
      this.active--;
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length > 0 && this.active < this.maxConcurrent) {
      const { fn, resolve, reject } = this.queue.shift();
      this.execute(fn).then(resolve).catch(reject);
    }
  }
}
```

**Application to Agents:**
- Separate resource pools per agent type
- Critical agents (Sterling for bidding) get dedicated resources
- Non-critical agents share common pool

---

### 3. Throttling Pattern

**Purpose:** Control resource consumption to stay within limits.

**Key Strategies:**
- **Rate Limiting:** Max N requests per time window
- **Degradation:** Disable non-essential features under load
- **Priority Queues:** High-priority requests processed first
- **Deferred Processing:** Queue low-priority work for later

**Implementation for Athena:**
```javascript
class Throttler {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100;
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.requests = [];
    this.priorities = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  }

  async execute(fn, priority = 'MEDIUM') {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      if (priority === 'HIGH') {
        // High priority always allowed (may exceed limit)
        this.requests.push(now);
        return fn();
      }
      throw new Error('Rate limit exceeded');
    }

    this.requests.push(now);
    return fn();
  }

  getStatus() {
    return {
      used: this.requests.length,
      limit: this.maxRequests,
      remaining: this.maxRequests - this.requests.length,
      resetIn: this.windowMs - (Date.now() - this.requests[0])
    };
  }
}
```

**Application:**
- Per-API throttling (OpenRouter, Gemini, etc.)
- Per-agent throttling (prevent one agent from monopolizing)
- Global system throttling (memory/CPU protection)

---

### 4. Retry Pattern with Exponential Backoff

**Purpose:** Handle transient failures gracefully.

**Key Concepts:**
- **Exponential Backoff:** Increasing delay between retries
- **Jitter:** Random variation to prevent thundering herd
- **Max Retries:** Upper limit to prevent infinite retries

**Implementation:**
```javascript
class RetryPolicy {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.jitter = options.jitter !== false;
  }

  async execute(fn) {
    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries && this.isRetryable(error)) {
          const delay = this.calculateDelay(attempt);
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
      return exponential * (0.5 + Math.random());
    }
    return exponential;
  }

  isRetryable(error) {
    // Don't retry 4xx errors (except 429)
    if (error.status >= 400 && error.status < 500 && error.status !== 429) {
      return false;
    }
    return true;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

### 5. Health Endpoint Monitoring

**Purpose:** Detect failures proactively.

**Key Concepts:**
- **Health Checks:** Regular checks of critical dependencies
- **Self-Reporting:** Each agent reports its own health
- **Aggregation:** Central view of system health

**Implementation for Athena:**
```javascript
class HealthMonitor {
  constructor() {
    this.checks = new Map();
    this.status = 'HEALTHY';
  }

  registerCheck(name, checkFn, options = {}) {
    this.checks.set(name, {
      fn: checkFn,
      interval: options.interval || 30000,
      timeout: options.timeout || 5000,
      critical: options.critical || false,
      lastCheck: null,
      lastStatus: 'UNKNOWN'
    });
  }

  async runChecks() {
    const results = {};
    let overallHealthy = true;

    for (const [name, check] of this.checks) {
      try {
        const result = await Promise.race([
          check.fn(),
          this.timeout(check.timeout)
        ]);
        check.lastStatus = result.status;
        check.lastCheck = Date.now();
        results[name] = result;
        if (check.critical && result.status !== 'HEALTHY') {
          overallHealthy = false;
        }
      } catch (error) {
        check.lastStatus = 'UNHEALTHY';
        results[name] = { status: 'UNHEALTHY', error: error.message };
        if (check.critical) overallHealthy = false;
      }
    }

    this.status = overallHealthy ? 'HEALTHY' : 'DEGRADED';
    return { status: this.status, checks: results };
  }

  timeout(ms) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), ms)
    );
  }
}
```

**Standard Checks:**
- `memory`: System memory usage
- `swap`: Swap usage
- `disk`: Disk space
- `api:openrouter`: OpenRouter API connectivity
- `api:gemini`: Gemini API connectivity
- `github`: GitHub authentication status

---

### 6. Self-Healing Automation

**Purpose:** Automatically recover from failures without human intervention.

**Healing Actions:**
1. **Restart Services:** Automatically restart crashed processes
2. **Clear Caches:** Free memory when usage high
3. **Rotate Credentials:** Refresh expired tokens
4. **Scale Resources:** Add capacity when needed
5. **Fallback Modes:** Operate in degraded mode when dependencies fail

**Implementation:**
```javascript
class SelfHealer {
  constructor(healthMonitor) {
    this.monitor = healthMonitor;
    this.healingActions = new Map();
    this.healingHistory = [];
  }

  registerHealingAction(condition, action, options = {}) {
    this.healingActions.set(condition, {
      action,
      cooldown: options.cooldown || 300000, // 5 min
      lastTriggered: 0
    });
  }

  async checkAndHeal() {
    const health = await this.monitor.runChecks();

    for (const [condition, config] of this.healingActions) {
      if (this.shouldHeal(condition, health, config)) {
        console.log(`Triggering healing action for: ${condition}`);
        try {
          await config.action();
          this.healingHistory.push({
            condition,
            timestamp: Date.now(),
            success: true
          });
        } catch (error) {
          this.healingHistory.push({
            condition,
            timestamp: Date.now(),
            success: false,
            error: error.message
          });
        }
      }
    }

    return health;
  }

  shouldHeal(condition, health, config) {
    const now = Date.now();
    if (now - config.lastTriggered < config.cooldown) {
      return false; // Still in cooldown
    }

    // Check conditions
    switch (condition) {
      case 'high_memory':
        return health.checks.memory?.usage > 0.85;
      case 'high_swap':
        return health.checks.swap?.usage > 0.8;
      case 'api_failure':
        return Object.values(health.checks)
          .some(c => c.status === 'UNHEALTHY' && c.critical);
      default:
        return false;
    }
  }
}
```

---

## Synthesis: Athena Fault Tolerance Architecture

### Layer 1: Per-Agent Isolation (Bulkhead)
Each agent gets isolated resources:
- Separate API rate limits
- Separate circuit breakers per external service
- Separate task queues

### Layer 2: Inter-Agent Protection (Circuit Breaker)
Agents calling other agents use circuit breakers:
- Prevent cascade if one agent fails
- Allow graceful degradation
- Automatic recovery testing

### Layer 3: System-Wide Protection (Throttling)
Global limits to protect system:
- Memory-based throttling
- API quota management
- CPU-based throttling

### Layer 4: Health Monitoring
Continuous health checks:
- Every agent reports health
- Central aggregator dashboard
- Alerting on degradation

### Layer 5: Self-Healing
Automated recovery:
- Memory pressure → Clear caches, reduce activity
- API failure → Switch to fallback providers
- Auth expiry → Alert + auto-refresh if possible

---

## Artifacts Produced

1. `prototypes/athena-circuit-breaker.js` - Circuit breaker implementation
2. `prototypes/athena-bulkhead.js` - Resource isolation implementation
3. `prototypes/athena-throttler.js` - Rate limiting implementation
4. `prototypes/athena-health-monitor.js` - Health monitoring implementation
5. `prototypes/athena-self-healer.js` - Self-healing automation
6. `prototypes/athena-fault-tolerance.js` - Combined module

---

## Recommendations for Implementation

### Immediate (High Priority)
1. Add circuit breakers to all API calls
2. Implement health monitoring dashboard
3. Add memory-based throttling

### Short-term (Medium Priority)
1. Implement bulkhead isolation for agents
2. Add self-healing for common failures
3. Create degraded mode for API failures

### Long-term (Lower Priority)
1. Full multi-provider fallback system
2. Predictive scaling based on load patterns
3. Automatic credential rotation

---

## Next Steps

1. Create prototype implementations
2. Test with simulated failures
3. Integrate with Athena agent system
4. Add to dashboard monitoring
5. Document for Felicity implementation

---

*Research completed by Ishtar - PAI Architecture Focus*
*Session: 2026-03-02 04:00 UTC*
