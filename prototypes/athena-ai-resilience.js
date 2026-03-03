/**
 * Athena AI-Specific Resilience Patterns
 * Handling unique failure modes of LLM/AI systems
 * 
 * AI Failure Modes:
 * - Hallucination: Model generates false/confident wrong info
 * - Context Overflow: Input exceeds token limits
 * - Rate Limiting: Provider throttling
 * - Token Budget Exhaustion: Cost overruns
 * - Response Timeout: Long generation times
 * - Quality Degradation: Model outputs poor quality
 */

const fs = require('fs').promises;
const path = require('path');

// ============================================================
// AI FAILURE TYPES
// ============================================================

const AIFailureTypes = {
  HALLUCINATION: 'hallucination',
  CONTEXT_OVERFLOW: 'context_overflow',
  RATE_LIMIT: 'rate_limit',
  TOKEN_BUDGET_EXCEEDED: 'token_budget_exceeded',
  TIMEOUT: 'timeout',
  QUALITY_DEGRADATION: 'quality_degradation',
  CONTENT_POLICY: 'content_policy',
  MODEL_UNAVAILABLE: 'model_unavailable'
};

class AIFailure extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.name = 'AIFailure';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.recoverable = this.isRecoverable(type);
  }

  isRecoverable(type) {
    const recoverable = [
      AIFailureTypes.RATE_LIMIT,
      AIFailureTypes.TIMEOUT,
      AIFailureTypes.MODEL_UNAVAILABLE
    ];
    return recoverable.includes(type);
  }
}

// ============================================================
// HALLUCINATION DETECTOR
// ============================================================

class HallucinationDetector {
  constructor(options = {}) {
    this.confidenceThreshold = options.confidenceThreshold || 0.7;
    this.factCheckEnabled = options.factCheckEnabled || false;
    this.patterns = this.loadPatterns();
  }

  loadPatterns() {
    return {
      // Common hallucination patterns
      fakeCitations: /\[\d+\]\s*(?!https?:|doi:|arxiv:)/g,
      confidentUncertainty: /definitely|certainly|without doubt|guaranteed/i,
      specificButWrong: /\b\d{4}\b.*?(invented|created|founded|discovered)/i,
      personConfusion: /(\w+)\s+(?:said|stated|wrote|claimed).*?but\s+actually/i,
      
      // Numerical hallucinations
      suspiciousStats: /\d+(?:\.\d+)?%\s+(?:of|increase|decrease|more|less)/i,
      fakeDates: /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi
    };
  }

  /**
   * Analyze AI response for potential hallucinations
   */
  analyze(response, context = {}) {
    const signals = [];
    let score = 0;

    // Check for hallucination patterns
    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      const matches = response.match(pattern);
      if (matches) {
        signals.push({
          pattern: patternName,
          matches: matches.slice(0, 3), // First 3 matches
          weight: this.getPatternWeight(patternName)
        });
        score += this.getPatternWeight(patternName);
      }
    }

    // Check for factual claims that should be verified
    const factualClaims = this.extractFactualClaims(response);
    if (factualClaims.length > 0) {
      signals.push({
        pattern: 'factual_claims',
        claims: factualClaims.slice(0, 5),
        weight: 0.3
      });
      score += 0.3;
    }

    // Check consistency with context
    if (context.previousResponses) {
      const inconsistencies = this.findInconsistencies(response, context.previousResponses);
      if (inconsistencies.length > 0) {
        signals.push({
          pattern: 'inconsistency',
          inconsistencies,
          weight: 0.5
        });
        score += 0.5;
      }
    }

    const isHallucination = score >= this.confidenceThreshold;

    return {
      isHallucination,
      confidence: Math.min(score, 1),
      signals,
      recommendation: isHallucination ? 'request_verification' : 'acceptable'
    };
  }

  getPatternWeight(patternName) {
    const weights = {
      fakeCitations: 0.8,
      confidentUncertainty: 0.3,
      specificButWrong: 0.6,
      personConfusion: 0.5,
      suspiciousStats: 0.4,
      fakeDates: 0.3
    };
    return weights[patternName] || 0.2;
  }

  extractFactualClaims(response) {
    const claims = [];
    
    // Extract statements that could be fact-checked
    const sentences = response.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (this.isFactualClaim(sentence)) {
        claims.push(sentence.trim());
      }
    }
    
    return claims;
  }

  isFactualClaim(sentence) {
    // Heuristic: contains specific names, dates, numbers, or "X is Y" structure
    const factualPatterns = [
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/,  // Full names
      /\b\d{4}\b/,                       // Years
      /\d+(?:\.\d+)?%/,                  // Percentages
      /is\s+(?:the\s+)?(?:a|an|the)\s+\w+/i,  // "X is a Y"
      /was\s+(?:born|founded|created|invented|discovered)/i  // Biographical facts
    ];
    
    return factualPatterns.some(p => p.test(sentence));
  }

  findInconsistencies(response, previousResponses) {
    const inconsistencies = [];
    // Would implement actual consistency checking
    return inconsistencies;
  }
}

// ============================================================
// CONTEXT MANAGER
// ============================================================

class ContextManager {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 128000;  // Default context window
    this.reserveTokens = options.reserveTokens || 4000;  // For response
    this.truncationStrategy = options.truncationStrategy || 'sliding_window';
    
    this.tokenCounter = options.tokenCounter || this.defaultTokenCounter;
  }

  /**
   * Estimate token count for text
   */
  defaultTokenCounter(text) {
    // Rough approximation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if context will overflow
   */
  willOverflow(currentContext, newContent) {
    const currentTokens = this.tokenCounter(currentContext);
    const newTokens = this.tokenCounter(newContent);
    const totalTokens = currentTokens + newTokens + this.reserveTokens;
    
    return {
      willOverflow: totalTokens > this.maxTokens,
      currentTokens,
      newTokens,
      totalTokens,
      availableTokens: this.maxTokens - currentTokens - this.reserveTokens
    };
  }

  /**
   * Truncate context to fit within limits
   */
  truncate(context, strategy = this.truncationStrategy) {
    const targetTokens = this.maxTokens - this.reserveTokens;
    const currentTokens = this.tokenCounter(context);
    
    if (currentTokens <= targetTokens) {
      return { truncated: context, tokensRemoved: 0 };
    }

    switch (strategy) {
      case 'sliding_window':
        return this.slidingWindowTruncate(context, targetTokens);
      
      case 'summarize':
        return this.summarizeTruncate(context, targetTokens);
      
      case 'priority':
        return this.priorityTruncate(context, targetTokens);
      
      default:
        return this.slidingWindowTruncate(context, targetTokens);
    }
  }

  slidingWindowTruncate(context, targetTokens) {
    // Keep most recent messages
    const messages = typeof context === 'string' ? context.split('\n') : context;
    const truncated = [];
    let currentTokens = 0;
    
    // Start from most recent
    for (let i = messages.length - 1; i >= 0; i--) {
      const msgTokens = this.tokenCounter(messages[i]);
      if (currentTokens + msgTokens <= targetTokens) {
        truncated.unshift(messages[i]);
        currentTokens += msgTokens;
      } else {
        break;
      }
    }
    
    return {
      truncated: truncated.join('\n'),
      tokensRemoved: this.tokenCounter(context) - currentTokens,
      strategy: 'sliding_window'
    };
  }

  summarizeTruncate(context, targetTokens) {
    // Would use an LLM to summarize old context
    return {
      truncated: context,  // Placeholder
      tokensRemoved: 0,
      strategy: 'summarize',
      note: 'Requires LLM summarization'
    };
  }

  priorityTruncate(context, targetTokens) {
    // Keep high-priority messages (system, recent, important)
    return this.slidingWindowTruncate(context, targetTokens);
  }

  /**
   * Build optimized context for a request
   */
  buildContext(components) {
    const { systemPrompt, history, currentMessage, tools } = components;
    
    let context = '';
    const breakdown = {};
    
    // Add system prompt (highest priority)
    if (systemPrompt) {
      context += systemPrompt + '\n';
      breakdown.system = this.tokenCounter(systemPrompt);
    }
    
    // Add tools if present
    if (tools && tools.length > 0) {
      const toolsContext = JSON.stringify(tools);
      context += toolsContext + '\n';
      breakdown.tools = this.tokenCounter(toolsContext);
    }
    
    // Calculate remaining space
    const usedTokens = this.tokenCounter(context);
    const remainingForHistory = this.maxTokens - this.reserveTokens - usedTokens - 
                                  this.tokenCounter(currentMessage || '');
    
    // Add history (truncated if needed)
    if (history) {
      const historyResult = this.truncate(history, remainingForHistory);
      context += historyResult.truncated + '\n';
      breakdown.history = this.tokenCounter(historyResult.truncated);
    }
    
    // Add current message
    if (currentMessage) {
      context += currentMessage;
      breakdown.current = this.tokenCounter(currentMessage);
    }
    
    return {
      context,
      breakdown,
      totalTokens: this.tokenCounter(context),
      withinLimits: this.tokenCounter(context) + this.reserveTokens <= this.maxTokens
    };
  }
}

// ============================================================
// TOKEN BUDGET MANAGER
// ============================================================

class TokenBudgetManager {
  constructor(options = {}) {
    this.dailyBudget = options.dailyBudget || 1000000;  // 1M tokens/day
    this.monthlyBudget = options.monthlyBudget || 25000000;  // 25M tokens/month
    
    this.usageFile = options.usageFile || 
      '/root/.openclaw/workspace/memory/token-usage.json';
    
    this.pricing = {
      'gpt-4': { input: 0.03 / 1000, output: 0.06 / 1000 },
      'gpt-4-turbo': { input: 0.01 / 1000, output: 0.03 / 1000 },
      'gpt-3.5-turbo': { input: 0.0005 / 1000, output: 0.0015 / 1000 },
      'claude-3-opus': { input: 0.015 / 1000, output: 0.075 / 1000 },
      'claude-3-sonnet': { input: 0.003 / 1000, output: 0.015 / 1000 },
      'gemini-pro': { input: 0.00025 / 1000, output: 0.0005 / 1000 },
      'default': { input: 0.01 / 1000, output: 0.03 / 1000 }
    };
  }

  /**
   * Record token usage
   */
  async recordUsage(agentId, model, inputTokens, outputTokens) {
    const usage = await this.loadUsage();
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    
    // Initialize if needed
    if (!usage.daily[today]) usage.daily[today] = {};
    if (!usage.monthly[month]) usage.monthly[month] = {};
    
    // Record usage
    const entry = {
      agentId,
      model,
      inputTokens,
      outputTokens,
      cost: this.calculateCost(model, inputTokens, outputTokens),
      timestamp: new Date().toISOString()
    };
    
    usage.daily[today][agentId] = usage.daily[today][agentId] || { tokens: 0, cost: 0 };
    usage.daily[today][agentId].tokens += inputTokens + outputTokens;
    usage.daily[today][agentId].cost += entry.cost;
    
    usage.monthly[month][agentId] = usage.monthly[month][agentId] || { tokens: 0, cost: 0 };
    usage.monthly[month][agentId].tokens += inputTokens + outputTokens;
    usage.monthly[month][agentId].cost += entry.cost;
    
    usage.history.push(entry);
    
    // Keep only last 1000 entries
    if (usage.history.length > 1000) {
      usage.history = usage.history.slice(-1000);
    }
    
    await this.saveUsage(usage);
    
    return entry;
  }

  /**
   * Check if operation is within budget
   */
  async canProceed(estimatedTokens = 0) {
    const usage = await this.loadUsage();
    const today = new Date().toISOString().split('T')[0];
    
    const dailyUsed = usage.daily[today]?.totalTokens || 0;
    const remaining = this.dailyBudget - dailyUsed;
    
    return {
      canProceed: remaining >= estimatedTokens,
      dailyUsed,
      dailyBudget: this.dailyBudget,
      remaining,
      estimatedTokens
    };
  }

  /**
   * Get budget status
   */
  async getStatus() {
    const usage = await this.loadUsage();
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    
    const dailyUsed = this.sumTokens(usage.daily[today] || {});
    const monthlyUsed = this.sumTokens(usage.monthly[month] || {});
    
    return {
      daily: {
        used: dailyUsed,
        budget: this.dailyBudget,
        remaining: this.dailyBudget - dailyUsed,
        percentUsed: (dailyUsed / this.dailyBudget) * 100
      },
      monthly: {
        used: monthlyUsed,
        budget: this.monthlyBudget,
        remaining: this.monthlyBudget - monthlyUsed,
        percentUsed: (monthlyUsed / this.monthlyBudget) * 100
      },
      byAgent: this.aggregateByAgent(usage)
    };
  }

  calculateCost(model, inputTokens, outputTokens) {
    const prices = this.pricing[model] || this.pricing.default;
    return (inputTokens * prices.input) + (outputTokens * prices.output);
  }

  sumTokens(usageObj) {
    return Object.values(usageObj).reduce((sum, u) => sum + (u.tokens || 0), 0);
  }

  aggregateByAgent(usage) {
    const byAgent = {};
    for (const entry of usage.history) {
      if (!byAgent[entry.agentId]) {
        byAgent[entry.agentId] = { tokens: 0, cost: 0 };
      }
      byAgent[entry.agentId].tokens += entry.inputTokens + entry.outputTokens;
      byAgent[entry.agentId].cost += entry.cost;
    }
    return byAgent;
  }

  async loadUsage() {
    try {
      const content = await fs.readFile(this.usageFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { daily: {}, monthly: {}, history: [] };
      }
      throw error;
    }
  }

  async saveUsage(usage) {
    await fs.mkdir(path.dirname(this.usageFile), { recursive: true });
    await fs.writeFile(this.usageFile, JSON.stringify(usage, null, 2));
  }
}

// ============================================================
// AI QUALITY MONITOR
// ============================================================

class AIQualityMonitor {
  constructor(options = {}) {
    this.metricsFile = options.metricsFile || 
      '/root/.openclaw/workspace/memory/ai-quality-metrics.json';
    this.qualityThresholds = {
      minCoherence: 0.6,
      minRelevance: 0.7,
      maxRepetition: 0.3
    };
  }

  /**
   * Evaluate quality of AI response
   */
  evaluate(response, context = {}) {
    const metrics = {
      coherence: this.measureCoherence(response),
      relevance: this.measureRelevance(response, context.prompt),
      repetition: this.measureRepetition(response),
      length: response.length,
      timestamp: new Date().toISOString()
    };

    metrics.overall = this.calculateOverall(metrics);
    metrics.passes = this.checkThresholds(metrics);
    
    return metrics;
  }

  measureCoherence(response) {
    // Simple coherence heuristic based on sentence structure
    const sentences = response.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length <= 1) return 0.8;
    
    // Check for transition words
    const transitions = ['however', 'therefore', 'furthermore', 'moreover', 'additionally', 
                         'consequently', 'meanwhile', 'similarly', 'conversely'];
    const hasTransitions = transitions.some(t => 
      response.toLowerCase().includes(t)
    );
    
    // Check for logical structure (numbered lists, etc.)
    const hasStructure = /^\d+\.|^[-•]/m.test(response);
    
    let score = 0.5;
    if (hasTransitions) score += 0.2;
    if (hasStructure) score += 0.2;
    if (sentences.length > 3) score += 0.1;
    
    return Math.min(score, 1);
  }

  measureRelevance(response, prompt) {
    if (!prompt) return 0.7;
    
    // Check keyword overlap
    const promptWords = new Set(prompt.toLowerCase().split(/\s+/));
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    
    const overlap = [...promptWords].filter(w => responseWords.has(w)).length;
    const relevance = overlap / promptWords.size;
    
    return Math.min(relevance * 1.5, 1); // Scale up
  }

  measureRepetition(response) {
    const words = response.toLowerCase().split(/\s+/);
    const unique = new Set(words);
    
    const repetitionRatio = 1 - (unique.size / words.length);
    return repetitionRatio;
  }

  calculateOverall(metrics) {
    return (metrics.coherence * 0.4 + 
            metrics.relevance * 0.4 + 
            (1 - metrics.repetition) * 0.2);
  }

  checkThresholds(metrics) {
    return (
      metrics.coherence >= this.qualityThresholds.minCoherence &&
      metrics.relevance >= this.qualityThresholds.minRelevance &&
      metrics.repetition <= this.qualityThresholds.maxRepetition
    );
  }

  /**
   * Track quality over time
   */
  async recordQuality(agentId, metrics) {
    try {
      let data = await this.loadData();
      
      if (!data[agentId]) {
        data[agentId] = { history: [], averages: {} };
      }
      
      data[agentId].history.push(metrics);
      
      // Keep last 100 measurements
      if (data[agentId].history.length > 100) {
        data[agentId].history = data[agentId].history.slice(-100);
      }
      
      // Calculate averages
      data[agentId].averages = this.calculateAverages(data[agentId].history);
      
      await this.saveData(data);
    } catch (error) {
      console.error('Error recording quality:', error);
    }
  }

  calculateAverages(history) {
    if (history.length === 0) return {};
    
    const sums = { coherence: 0, relevance: 0, repetition: 0, overall: 0 };
    for (const m of history) {
      sums.coherence += m.coherence;
      sums.relevance += m.relevance;
      sums.repetition += m.repetition;
      sums.overall += m.overall;
    }
    
    return {
      coherence: sums.coherence / history.length,
      relevance: sums.relevance / history.length,
      repetition: sums.repetition / history.length,
      overall: sums.overall / history.length
    };
  }

  async loadData() {
    try {
      const content = await fs.readFile(this.metricsFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return {};
    }
  }

  async saveData(data) {
    await fs.mkdir(path.dirname(this.metricsFile), { recursive: true });
    await fs.writeFile(this.metricsFile, JSON.stringify(data, null, 2));
  }
}

// ============================================================
// AI RESILIENCE WRAPPER
// ============================================================

class AIResilienceWrapper {
  constructor(options = {}) {
    this.hallucinationDetector = new HallucinationDetector(options.hallucination);
    this.contextManager = new ContextManager(options.context);
    this.tokenBudget = new TokenBudgetManager(options.budget);
    this.qualityMonitor = new AIQualityMonitor(options.quality);
    
    this.agentId = options.agentId || 'athena';
    this.model = options.model || 'default';
  }

  /**
   * Wrap an AI call with all resilience measures
   */
  async callAI(prompt, options = {}) {
    // 1. Check token budget
    const budgetCheck = await this.tokenBudget.canProceed(
      this.estimateTokens(prompt)
    );
    
    if (!budgetCheck.canProceed) {
      throw new AIFailure(
        AIFailureTypes.TOKEN_BUDGET_EXCEEDED,
        `Token budget exceeded. Remaining: ${budgetCheck.remaining}`,
        budgetCheck
      );
    }

    // 2. Manage context
    const contextResult = this.contextManager.buildContext({
      systemPrompt: options.systemPrompt,
      history: options.history,
      currentMessage: prompt,
      tools: options.tools
    });

    if (!contextResult.withinLimits) {
      console.warn('Context near limits, truncation applied');
    }

    // 3. Make the call (would be injected)
    const response = await options.call(contextResult.context);

    // 4. Check for hallucinations
    const hallucinationCheck = this.hallucinationDetector.analyze(response, {
      previousResponses: options.history
    });

    if (hallucinationCheck.isHallucination) {
      console.warn('Potential hallucination detected:', hallucinationCheck.signals);
      // Could trigger re-prompt or flag for review
    }

    // 5. Evaluate quality
    const qualityMetrics = this.qualityMonitor.evaluate(response, { prompt });
    await this.qualityMonitor.recordQuality(this.agentId, qualityMetrics);

    // 6. Record token usage
    await this.tokenBudget.recordUsage(
      this.agentId,
      this.model,
      this.estimateTokens(prompt),
      this.estimateTokens(response)
    );

    return {
      response,
      metadata: {
        hallucinationRisk: hallucinationCheck,
        quality: qualityMetrics,
        context: contextResult.breakdown,
        budget: budgetCheck
      }
    };
  }

  estimateTokens(text) {
    return Math.ceil((text || '').length / 4);
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  AIFailureTypes,
  AIFailure,
  HallucinationDetector,
  ContextManager,
  TokenBudgetManager,
  AIQualityMonitor,
  AIResilienceWrapper
};
