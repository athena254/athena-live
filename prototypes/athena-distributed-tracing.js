/**
 * Athena Distributed Tracing Implementation
 * For observability across multi-agent operations
 * 
 * Use case: Trace a request as it flows through multiple agents
 * Example: User request → Athena → Sterling → Beelancer API → Response
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// ============================================================
// SPAN - Single unit of work
// ============================================================

class Span {
  constructor(options) {
    this.traceId = options.traceId || this.generateTraceId();
    this.spanId = options.spanId || this.generateSpanId();
    this.parentSpanId = options.parentSpanId || null;
    
    this.operationName = options.operationName || 'unknown';
    this.serviceName = options.serviceName || 'athena';
    this.agentId = options.agentId || 'unknown';
    
    this.startTime = Date.now();
    this.startTimeISO = new Date().toISOString();
    this.endTime = null;
    this.duration = null;
    
    this.status = 'ok';  // ok | error
    this.tags = options.tags || {};
    this.logs = [];
    this.events = [];
    
    this.context = {
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId
    };
  }

  /**
   * Set a tag on the span
   */
  setTag(key, value) {
    this.tags[key] = value;
    return this;
  }

  /**
   * Add multiple tags
   */
  setTags(tags) {
    Object.assign(this.tags, tags);
    return this;
  }

  /**
   * Log an event
   */
  log(name, attributes = {}) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      name,
      attributes
    });
    return this;
  }

  /**
   * Add an event
   */
  addEvent(name, attributes = {}) {
    this.events.push({
      timestamp: new Date().toISOString(),
      name,
      attributes
    });
    return this;
  }

  /**
   * Mark span as error
   */
  setError(error) {
    this.status = 'error';
    this.tags.error = true;
    this.tags.errorType = error.name || 'Error';
    this.tags.errorMessage = error.message;
    if (error.stack) {
      this.tags.errorStack = error.stack;
    }
    return this;
  }

  /**
   * End the span
   */
  end() {
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
    return this;
  }

  /**
   * Get span context for propagation
   */
  getContext() {
    return this.context;
  }

  /**
   * Check if span is root (no parent)
   */
  isRoot() {
    return !this.parentSpanId;
  }

  /**
   * Export span for storage/transmission
   */
  toJSON() {
    return {
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      operationName: this.operationName,
      serviceName: this.serviceName,
      agentId: this.agentId,
      startTime: this.startTimeISO,
      endTime: this.endTime ? new Date(this.endTime).toISOString() : null,
      duration: this.duration,
      status: this.status,
      tags: this.tags,
      logs: this.logs,
      events: this.events
    };
  }

  generateTraceId() {
    return crypto.randomBytes(16).toString('hex');
  }

  generateSpanId() {
    return crypto.randomBytes(8).toString('hex');
  }
}

// ============================================================
// TRACER - Creates and manages spans
// ============================================================

class Tracer {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.agentId = options.agentId || serviceName;
    this.exporter = options.exporter || null;
    this.sampler = options.sampler || { shouldSample: () => true };
    this.currentSpan = null;
    
    this.traceDir = options.traceDir || '/root/.openclaw/workspace/memory/traces';
  }

  /**
   * Start a new span
   */
  startSpan(operationName, options = {}) {
    // Check sampling
    if (!this.sampler.shouldSample()) {
      return new NoopSpan(); // Non-recording span
    }

    const spanOptions = {
      serviceName: this.serviceName,
      agentId: this.agentId,
      operationName,
      ...options
    };

    // If there's a current span, make it the parent
    if (this.currentSpan && !options.parentSpanId) {
      spanOptions.parentSpanId = this.currentSpan.spanId;
      spanOptions.traceId = this.currentSpan.traceId;
    }

    const span = new Span(spanOptions);
    
    return span;
  }

  /**
   * Start a span and make it the current span
   */
  withSpan(operationName, fn, options = {}) {
    const span = this.startSpan(operationName, options);
    const previousSpan = this.currentSpan;
    this.currentSpan = span;

    try {
      const result = fn(span);
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result
          .then(r => {
            span.end();
            this.exportSpan(span);
            this.currentSpan = previousSpan;
            return r;
          })
          .catch(err => {
            span.setError(err);
            span.end();
            this.exportSpan(span);
            this.currentSpan = previousSpan;
            throw err;
          });
      }

      span.end();
      this.exportSpan(span);
      this.currentSpan = previousSpan;
      return result;
      
    } catch (err) {
      span.setError(err);
      span.end();
      this.exportSpan(span);
      this.currentSpan = previousSpan;
      throw err;
    }
  }

  /**
   * Create a child span
   */
  startChildSpan(operationName, parentSpan) {
    return this.startSpan(operationName, {
      traceId: parentSpan.traceId,
      parentSpanId: parentSpan.spanId
    });
  }

  /**
   * Export a completed span
   */
  async exportSpan(span) {
    const spanData = span.toJSON();
    
    // Write to trace file
    await fs.mkdir(this.traceDir, { recursive: true });
    const traceFile = path.join(this.traceDir, `${spanData.traceId}.jsonl`);
    await fs.appendFile(traceFile, JSON.stringify(spanData) + '\n');
    
    // Call custom exporter if set
    if (this.exporter) {
      await this.exporter.export(spanData);
    }
    
    return spanData;
  }

  /**
   * Get trace by ID
   */
  async getTrace(traceId) {
    const traceFile = path.join(this.traceDir, `${traceId}.jsonl`);
    
    try {
      const content = await fs.readFile(traceFile, 'utf8');
      return content.trim().split('\n').map(line => JSON.parse(line));
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  /**
   * Extract trace context from headers
   */
  extractContext(headers) {
    const traceParent = headers['traceparent'] || headers['x-trace-id'];
    if (!traceParent) return null;

    // W3C TraceContext format: version-traceid-spanid-flags
    const parts = traceParent.split('-');
    if (parts.length >= 3) {
      return {
        traceId: parts[1],
        parentSpanId: parts[2]
      };
    }

    return null;
  }

  /**
   * Inject trace context into headers
   */
  injectContext(span, headers = {}) {
    headers['traceparent'] = `00-${span.traceId}-${span.spanId}-01`;
    headers['x-trace-id'] = span.traceId;
    headers['x-span-id'] = span.spanId;
    return headers;
  }
}

// ============================================================
// NOOP SPAN - For unsampled traces
// ============================================================

class NoopSpan {
  constructor() {
    this.noop = true;
  }
  setTag() { return this; }
  setTags() { return this; }
  log() { return this; }
  addEvent() { return this; }
  setError() { return this; }
  end() { return this; }
  getContext() { return null; }
  toJSON() { return null; }
}

// ============================================================
// TRACE ANALYZER
// ============================================================

class TraceAnalyzer {
  constructor(traceDir) {
    this.traceDir = traceDir || '/root/.openclaw/workspace/memory/traces';
  }

  /**
   * Analyze a complete trace
   */
  async analyzeTrace(traceId) {
    const spans = await this.getTraceSpans(traceId);
    
    if (spans.length === 0) {
      return { error: 'Trace not found', traceId };
    }

    // Build span tree
    const tree = this.buildSpanTree(spans);
    
    // Calculate critical path
    const criticalPath = this.findCriticalPath(spans);
    
    // Find errors
    const errors = spans.filter(s => s.status === 'error');
    
    // Calculate statistics
    const stats = {
      totalSpans: spans.length,
      totalDuration: Math.max(...spans.map(s => s.startTime + (s.duration || 0))) - 
                     Math.min(...spans.map(s => s.startTime)),
      errorCount: errors.length,
      services: [...new Set(spans.map(s => s.serviceName))],
      agents: [...new Set(spans.map(s => s.agentId))]
    };

    return {
      traceId,
      tree,
      criticalPath,
      errors,
      stats,
      spans
    };
  }

  /**
   * Get all spans for a trace
   */
  async getTraceSpans(traceId) {
    const traceFile = path.join(this.traceDir, `${traceId}.jsonl`);
    
    try {
      const content = await fs.readFile(traceFile, 'utf8');
      return content.trim().split('\n').map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  /**
   * Build hierarchical span tree
   */
  buildSpanTree(spans) {
    const spanMap = new Map(spans.map(s => [s.spanId, { ...s, children: [] }]));
    const roots = [];

    for (const span of spanMap.values()) {
      if (span.parentSpanId) {
        const parent = spanMap.get(span.parentSpanId);
        if (parent) {
          parent.children.push(span);
        }
      } else {
        roots.push(span);
      }
    }

    return roots;
  }

  /**
   * Find critical path (longest path through trace)
   */
  findCriticalPath(spans) {
    // Sort by start time
    const sorted = [...spans].sort((a, b) => a.startTime - b.startTime);
    
    // Find spans on critical path
    const criticalPath = [];
    let currentEnd = 0;

    for (const span of sorted) {
      if (span.startTime >= currentEnd) {
        criticalPath.push({
          spanId: span.spanId,
          operationName: span.operationName,
          duration: span.duration
        });
        currentEnd = span.startTime + (span.duration || 0);
      }
    }

    return criticalPath;
  }

  /**
   * List all traces
   */
  async listTraces(options = {}) {
    const files = await fs.readdir(this.traceDir).catch(() => []);
    const traceFiles = files.filter(f => f.endsWith('.jsonl'));

    const traces = [];
    for (const file of traceFiles.slice(0, options.limit || 100)) {
      const traceId = file.replace('.jsonl', '');
      const spans = await this.getTraceSpans(traceId);
      
      if (spans.length > 0) {
        traces.push({
          traceId,
          spanCount: spans.length,
          startTime: spans[0].startTime,
          duration: Math.max(...spans.map(s => s.startTime + (s.duration || 0))) - 
                    Math.min(...spans.map(s => s.startTime)),
          services: [...new Set(spans.map(s => s.serviceName))],
          hasErrors: spans.some(s => s.status === 'error')
        });
      }
    }

    return traces.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Get trace statistics
   */
  async getStatistics(timeRange = 3600000) {
    const cutoff = Date.now() - timeRange;
    const traces = await this.listTraces();
    
    const recentTraces = traces.filter(t => t.startTime >= cutoff);
    
    return {
      totalTraces: recentTraces.length,
      avgSpansPerTrace: recentTraces.reduce((sum, t) => sum + t.spanCount, 0) / (recentTraces.length || 1),
      avgDuration: recentTraces.reduce((sum, t) => sum + t.duration, 0) / (recentTraces.length || 1),
      errorRate: recentTraces.filter(t => t.hasErrors).length / (recentTraces.length || 1),
      services: [...new Set(recentTraces.flatMap(t => t.services))]
    };
  }
}

// ============================================================
// AGENT TRACING MIDDLEWARE
// ============================================================

/**
 * Tracing middleware for agent operations
 */
function createTracingMiddleware(tracer) {
  return async (operationName, fn, options = {}) => {
    return tracer.withSpan(operationName, fn, options);
  };
}

/**
 * Trace HTTP requests
 */
function tracedFetch(tracer, fetch) {
  return async (url, options = {}) => {
    const span = tracer.startSpan(`HTTP ${options.method || 'GET'} ${url}`);
    span.setTag('http.url', url);
    span.setTag('http.method', options.method || 'GET');
    
    // Inject trace context
    options.headers = tracer.injectContext(span, options.headers || {});
    
    try {
      const response = await fetch(url, options);
      span.setTag('http.status_code', response.status);
      span.end();
      tracer.exportSpan(span);
      return response;
    } catch (error) {
      span.setError(error);
      span.end();
      tracer.exportSpan(span);
      throw error;
    }
  };
}

/**
 * Trace agent-to-agent communication
 */
function tracedMessage(tracer, sessionsSend) {
  return async (targetAgent, message, options = {}) => {
    const span = tracer.startSpan(`Message to ${targetAgent}`);
    span.setTag('message.target', targetAgent);
    span.setTag('message.type', typeof message === 'string' ? 'text' : 'object');
    
    // Inject trace context into message
    const context = span.getContext();
    const tracedMessage = {
      ...message,
      _traceContext: context
    };
    
    try {
      const result = await sessionsSend(targetAgent, tracedMessage, options);
      span.setTag('message.delivered', true);
      span.end();
      tracer.exportSpan(span);
      return result;
    } catch (error) {
      span.setError(error);
      span.setTag('message.delivered', false);
      span.end();
      tracer.exportSpan(span);
      throw error;
    }
  };
}

// ============================================================
// ATHERNA TRACERS
// ============================================================

const AthenaTracers = {
  athena: new Tracer('athena', { agentId: 'athena' }),
  sterling: new Tracer('sterling', { agentId: 'sterling' }),
  ishtar: new Tracer('ishtar', { agentId: 'ishtar' }),
  delver: new Tracer('delver', { agentId: 'delver' }),
  squire: new Tracer('squire', { agentId: 'squire' }),
  felicity: new Tracer('felicity', { agentId: 'felicity' }),
  prometheus: new Tracer('prometheus', { agentId: 'prometheus' }),
  cisco: new Tracer('cisco', { agentId: 'cisco' }),
  themis: new Tracer('themis', { agentId: 'themis' })
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  Span,
  Tracer,
  NoopSpan,
  TraceAnalyzer,
  createTracingMiddleware,
  tracedFetch,
  tracedMessage,
  AthenaTracers
};
