/**
 * Rate Limit Monitor Utility for Athena System
 * Tracks API usage, detects rate limit patterns, and provides warnings
 * 
 * Usage:
 *   const monitor = new RateLimitMonitor();
 *   monitor.track('openai', 1500); // Track tokens used
 *   monitor.getStatus('openai');    // Get current status
 *   monitor.shouldThrottle('openai'); // Check if should slow down
 */

class RateLimitMonitor {
  constructor(config = {}) {
    this.config = {
      warningThreshold: config.warningThreshold || 0.75,  // 75% of limit
      criticalThreshold: config.criticalThreshold || 0.90, // 90% of limit
      windowMs: config.windowMs || 60000, // 1 minute window
      ...config
    };

    // Rate limits for different providers (requests per minute)
    this.limits = {
      openai: { requests: 60, tokens: 150000, window: 60000 },
      anthropic: { requests: 50, tokens: 100000, window: 60000 },
      custom: { requests: 100, tokens: 200000, window: 60000 },
      gateway: { requests: 200, tokens: 500000, window: 60000 },
    };

    // Tracking state
    this.usage = new Map();
    this.history = new Map();
    this.alerts = [];

    // Initialize tracking for each provider
    Object.keys(this.limits).forEach(provider => {
      this.usage.set(provider, {
        requests: 0,
        tokens: 0,
        windowStart: Date.now()
      });
      this.history.set(provider, []);
    });
  }

  /**
   * Track an API call
   * @param {string} provider - Provider name (openai, anthropic, custom, gateway)
   * @param {number} tokens - Number of tokens used (optional)
   * @param {boolean} isRequest - Whether this counts as a request
   */
  track(provider, tokens = 0, isRequest = true) {
    if (!this.usage.has(provider)) {
      console.warn(`Unknown provider: ${provider}`);
      return;
    }

    const state = this.usage.get(provider);
    const now = Date.now();

    // Reset window if expired
    if (now - state.windowStart > this.config.windowMs) {
      this._saveToHistory(provider);
      state.requests = 0;
      state.tokens = 0;
      state.windowStart = now;
    }

    // Update counters
    if (isRequest) state.requests++;
    state.tokens += tokens;

    // Check for rate limit triggers
    this._checkLimits(provider);

    return {
      provider,
      requests: state.requests,
      tokens: state.tokens,
      percentUsed: this._getPercentUsed(provider)
    };
  }

  /**
   * Get current status for a provider
   */
  getStatus(provider) {
    if (!this.usage.has(provider)) {
      return { error: `Unknown provider: ${provider}` };
    }

    const state = this.usage.get(provider);
    const limit = this.limits[provider];
    const percentUsed = this._getPercentUsed(provider);

    let status = 'healthy';
    if (percentUsed >= this.config.criticalThreshold) {
      status = 'critical';
    } else if (percentUsed >= this.config.warningThreshold) {
      status = 'warning';
    }

    return {
      provider,
      status,
      requests: {
        current: state.requests,
        limit: limit.requests,
        percent: (state.requests / limit.requests * 100).toFixed(1)
      },
      tokens: {
        current: state.tokens,
        limit: limit.tokens,
        percent: (state.tokens / limit.tokens * 100).toFixed(1)
      },
      windowMs: this.config.windowMs,
      windowRemaining: Math.max(0, this.config.windowMs - (Date.now() - state.windowStart))
    };
  }

  /**
   * Check if we should throttle requests shouldThrottle(provider
   */
 ) {
    const status = this.getStatus(provider);
    return status.status === 'critical';
  }

  /**
   * Get recommended delay before next request
   */
  getRecommendedDelay(provider) {
    const status = this.getStatus(provider);
    if (status.status === 'healthy') return 0;

    const limit = this.limits[provider];
    const state = this.usage.get(provider);

    // Calculate how much of the window has passed
    const windowElapsed = Date.now() - state.windowStart;
    const windowRemaining = this.config.windowMs - windowElapsed;

    if (status.status === 'critical') {
      // Full delay needed
      return windowRemaining;
    } else if (status.status === 'warning') {
      // Partial delay
      return Math.floor(windowRemaining * 0.5);
    }
    return 0;
  }

  /**
   * Get all provider statuses
   */
  getAllStatuses() {
    return Object.keys(this.limits).map(provider => this.getStatus(provider));
  }

  /**
   * Generate a report of current usage
   */
  generateReport() {
    const statuses = this.getAllStatuses();
    const timestamp = new Date().toISOString();

    const summary = {
      timestamp,
      providers: statuses,
      overall: {
        healthy: statuses.filter(s => s.status === 'healthy').length,
        warning: statuses.filter(s => s.status === 'warning').length,
        critical: statuses.filter(s => s.status === 'critical').length
      },
      recommendations: statuses
        .filter(s => s.status !== 'healthy')
        .map(s => ({
          provider: s.provider,
          action: s.status === 'critical' ? 'THROTTLE' : 'MONITOR',
          delay: this.getRecommendedDelay(s.provider)
        }))
    };

    return summary;
  }

  /**
   * Print a formatted status to console
   */
  printStatus(provider) {
    const status = this.getStatus(provider);
    const icons = { healthy: '✅', warning: '⚠️', critical: '🚨' };
    
    console.log(`\n${icons[status.status]} ${provider.toUpperCase()} Status`);
    console.log('─'.repeat(40));
    console.log(`Overall: ${status.status.toUpperCase()}`);
    console.log(`Requests: ${status.requests.current}/${status.requests.limit} (${status.requests.percent}%)`);
    console.log(`Tokens: ${status.tokens.current.toLocaleString()}/${status.tokens.limit.toLocaleString()} (${status.tokens.percent}%)`);
    console.log(`Window: ${(status.windowRemaining / 1000).toFixed(1)}s remaining`);

    if (this.shouldThrottle(provider)) {
      console.log(`\n🚨 RECOMMENDATION: Throttle requests!`);
      console.log(`   Suggested delay: ${this.getRecommendedDelay(provider)}ms`);
    }
  }

  /**
   * Reset tracking for a provider
   */
  reset(provider) {
    if (this.usage.has(provider)) {
      this.usage.set(provider, {
        requests: 0,
        tokens: 0,
        windowStart: Date.now()
      });
    }
  }

  /**
   * Add a custom provider limit
   */
  addProvider(name, requests, tokens, windowMs = 60000) {
    this.limits[name] = { requests, tokens, window: windowMs };
    this.usage.set(name, { requests: 0, tokens: 0, windowStart: Date.now() });
    this.history.set(name, []);
  }

  // Internal methods
  _getPercentUsed(provider) {
    const state = this.usage.get(provider);
    const limit = this.limits[provider];
    
    const requestPercent = state.requests / limit.requests;
    const tokenPercent = state.tokens / limit.tokens;
    
    return Math.max(requestPercent, tokenPercent);
  }

  _checkLimits(provider) {
    const percent = this._getPercentUsed(provider);
    const state = this.usage.get(provider);

    if (percent >= this.config.criticalThreshold) {
      this._emitAlert(provider, 'critical', `Critical rate limit: ${(percent * 100).toFixed(1)}% used`);
    } else if (percent >= this.config.warningThreshold) {
      this._emitAlert(provider, 'warning', `Warning: ${(percent * 100).toFixed(1)}% used`);
    }
  }

  _emitAlert(provider, level, message) {
    const alert = { provider, level, message, timestamp: Date.now() };
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // Console output for important alerts
    if (level === 'critical') {
      console.error(`🚨 [RATE LIMIT] ${provider}: ${message}`);
    } else {
      console.warn(`⚠️ [RATE LIMIT] ${provider}: ${message}`);
    }
  }

  _saveToHistory(provider) {
    const state = this.usage.get(provider);
    const history = this.history.get(provider);
    
    history.push({
      requests: state.requests,
      tokens: state.tokens,
      timestamp: state.windowStart
    });

    // Keep last 60 entries (1 hour of history)
    if (history.length > 60) {
      history.shift();
    }
  }

  /**
   * Get historical data for a provider
   */
  getHistory(provider, limit = 10) {
    const history = this.history.get(provider) || [];
    return history.slice(-limit);
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RateLimitMonitor };
}

// Demo usage when run directly
if (require.main === module) {
  console.log('🚀 Rate Limit Monitor Demo\n');
  
  const monitor = new RateLimitMonitor({
    warningThreshold: 0.5,
    criticalThreshold: 0.8
  });

  // Simulate some API calls
  console.log('Simulating API calls...\n');
  
  for (let i = 0; i < 35; i++) {
    monitor.track('openai', 1500);
  }
  
  monitor.track('anthropic', 2000);
  monitor.track('anthropic', 2500);
  
  monitor.track('gateway', 5000);
  monitor.track('gateway', 5000);
  monitor.track('gateway', 5000);

  // Print status
  ['openai', 'anthropic', 'gateway', 'custom'].forEach(provider => {
    monitor.printStatus(provider);
  });

  // Generate full report
  console.log('\n📊 Full Report:');
  console.log(JSON.stringify(monitor.generateReport(), null, 2));
}
