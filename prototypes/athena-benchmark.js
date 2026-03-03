/**
 * Athena Performance Benchmarking Framework
 * Measure and compare resilience pattern performance
 * 
 * Benchmarks:
 * - Circuit breaker overhead
 * - Bulkhead throughput
 * - Throttler latency
 * - Saga execution time
 * - Tracing overhead
 */

const fs = require('fs').promises;
const path = require('path');

// ============================================================
// BENCHMARK RUNNER
// ============================================================

class BenchmarkRunner {
  constructor(options = {}) {
    this.resultsDir = options.resultsDir || 
      '/root/.openclaw/workspace/memory/benchmarks';
    this.warmupRuns = options.warmupRuns || 5;
    this.measureRuns = options.measureRuns || 100;
  }

  /**
   * Run a benchmark
   */
  async run(name, fn, options = {}) {
    const warmupRuns = options.warmupRuns || this.warmupRuns;
    const measureRuns = options.measureRuns || this.measureRuns;
    
    console.log(`\n🏃 Running benchmark: ${name}`);
    console.log(`   Warmup: ${warmupRuns} runs`);
    console.log(`   Measure: ${measureRuns} runs`);
    
    // Warmup
    console.log('   Warming up...');
    for (let i = 0; i < warmupRuns; i++) {
      await fn();
    }
    
    // Measure
    console.log('   Measuring...');
    const measurements = [];
    const startTotal = process.hrtime.bigint();
    
    for (let i = 0; i < measureRuns; i++) {
      const start = process.hrtime.bigint();
      await fn();
      const end = process.hrtime.bigint();
      
      measurements.push({
        run: i + 1,
        durationNs: Number(end - start),
        durationMs: Number(end - start) / 1_000_000
      });
    }
    
    const endTotal = process.hrtime.bigint();
    const totalDuration = Number(endTotal - startTotal) / 1_000_000;
    
    // Calculate statistics
    const durations = measurements.map(m => m.durationMs);
    durations.sort((a, b) => a - b);
    
    const stats = {
      name,
      runs: measureRuns,
      totalDurationMs: totalDuration,
      avgMs: this.average(durations),
      minMs: durations[0],
      maxMs: durations[durations.length - 1],
      medianMs: this.percentile(durations, 50),
      p95Ms: this.percentile(durations, 95),
      p99Ms: this.percentile(durations, 99),
      stdDevMs: this.stdDev(durations),
      throughputPerSec: (measureRuns / totalDuration) * 1000
    };
    
    console.log(`   ✓ Avg: ${stats.avgMs.toFixed(3)}ms`);
    console.log(`   ✓ P95: ${stats.p95Ms.toFixed(3)}ms`);
    console.log(`   ✓ Throughput: ${stats.throughputPerSec.toFixed(1)}/sec`);
    
    return stats;
  }

  average(arr) {
    return arr.reduce((sum, v) => sum + v, 0) / arr.length;
  }

  percentile(sortedArr, p) {
    const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
    return sortedArr[Math.max(0, idx)];
  }

  stdDev(arr) {
    const avg = this.average(arr);
    const squareDiffs = arr.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }

  /**
   * Compare two benchmarks
   */
  compare(baseline, candidate) {
    const speedup = baseline.avgMs / candidate.avgMs;
    const latencyDiff = candidate.avgMs - baseline.avgMs;
    const percentChange = (latencyDiff / baseline.avgMs) * 100;
    
    return {
      baseline: baseline.name,
      candidate: candidate.name,
      speedup,
      latencyDiffMs: latencyDiff,
      percentChange,
      verdict: speedup > 1 ? 'candidate_faster' : 'baseline_faster'
    };
  }

  /**
   * Save benchmark results
   */
  async saveResults(results) {
    await fs.mkdir(this.resultsDir, { recursive: true });
    const filename = `benchmark-${Date.now()}.json`;
    await fs.writeFile(
      path.join(this.resultsDir, filename),
      JSON.stringify(results, null, 2)
    );
    return filename;
  }
}

// ============================================================
// ATHERNA RESILIENCE BENCHMARKS
// ============================================================

const AthenaBenchmarks = {
  /**
   * Benchmark circuit breaker overhead
   */
  circuitBreakerOverhead: async (runner, circuitBreaker) => {
    // Baseline: direct call
    const directCall = async () => {
      return new Promise(resolve => setTimeout(resolve, 1));
    };
    
    const baseline = await runner.run(
      'direct-call',
      directCall
    );
    
    // With circuit breaker
    const withCB = async () => {
      return circuitBreaker.execute(async () => {
        return new Promise(resolve => setTimeout(resolve, 1));
      });
    };
    
    const measured = await runner.run(
      'circuit-breaker-call',
      withCB
    );
    
    return runner.compare(baseline, measured);
  },

  /**
   * Benchmark bulkhead throughput
   */
  bulkheadThroughput: async (runner, bulkhead, concurrency = 10) => {
    const results = [];
    
    for (let maxConcurrent = 1; maxConcurrent <= concurrency; maxConcurrent++) {
      bulkhead.maxConcurrent = maxConcurrent;
      
      const stats = await runner.run(
        `bulkhead-concurrency-${maxConcurrent}`,
        async () => {
          return bulkhead.execute(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
          });
        }
      );
      
      results.push({
        concurrency: maxConcurrent,
        ...stats
      });
    }
    
    return results;
  },

  /**
   * Benchmark throttler latency
   */
  throttlerLatency: async (runner, throttler) => {
    const measurements = {
      allowed: [],
      throttled: []
    };
    
    // Reset throttler
    throttler.reset();
    
    // Measure first call (should be allowed)
    const start1 = process.hrtime.bigint();
    await throttler.acquire();
    const end1 = process.hrtime.bigint();
    measurements.allowed.push(Number(end1 - start1) / 1_000_000);
    
    // Exhaust tokens
    for (let i = 0; i < throttler.maxPerInterval; i++) {
      await throttler.acquire();
    }
    
    // Measure throttled call
    const start2 = process.hrtime.bigint();
    await throttler.acquire();
    const end2 = process.hrtime.bigint();
    measurements.throttled.push(Number(end2 - start2) / 1_000_000);
    
    return {
      allowedLatencyMs: measurements.allowed[0],
      throttledLatencyMs: measurements.throttled[0],
      throttlingOverheadMs: measurements.throttled[0] - measurements.allowed[0]
    };
  },

  /**
   * Benchmark saga execution
   */
  sagaExecution: async (runner, createSaga, steps = [1, 3, 5, 10]) => {
    const results = [];
    
    for (const stepCount of steps) {
      const saga = createSaga(stepCount);
      
      const stats = await runner.run(
        `saga-${stepCount}-steps`,
        async () => {
          const s = createSaga(stepCount);
          return s.execute();
        }
      );
      
      results.push({
        steps: stepCount,
        ...stats
      });
    }
    
    return results;
  },

  /**
   * Benchmark tracing overhead
   */
  tracingOverhead: async (runner, tracer) => {
    // Baseline: no tracing
    const baseline = await runner.run(
      'no-tracing',
      async () => {
        return 'result';
      }
    );
    
    // With tracing
    const withTracing = await runner.run(
      'with-tracing',
      async () => {
        const span = tracer.startSpan('test-operation');
        span.end();
        return 'result';
      }
    );
    
    return runner.compare(baseline, withTracing);
  },

  /**
   * Full system benchmark
   */
  fullSystem: async (runner, resilienceSystem) => {
    const results = {};
    
    // Test each component
    results.circuitBreaker = await runner.run(
      'full-circuit-breaker',
      async () => {
        return resilienceSystem.executeWithCircuitBreaker(
          'test-service',
          async () => 'result'
        );
      }
    );
    
    results.bulkhead = await runner.run(
      'full-bulkhead',
      async () => {
        return resilienceSystem.executeInBulkhead(
          'test',
          async () => 'result'
        );
      }
    );
    
    results.tracing = await runner.run(
      'full-tracing',
      async () => {
        return resilienceSystem.withTrace(
          'test-operation',
          async () => 'result'
        );
      }
    );
    
    // Combined
    results.combined = await runner.run(
      'full-combined',
      async () => {
        return resilienceSystem.withTrace('combined', async () => {
          return resilienceSystem.executeInBulkhead('test', async () => {
            return resilienceSystem.executeWithCircuitBreaker(
              'test-service',
              async () => 'result'
            );
          });
        });
      }
    );
    
    return results;
  }
};

// ============================================================
// LOAD TESTING
// ============================================================

class LoadTester {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 10;
    this.duration = options.duration || 30000; // 30 seconds
    this.rampUp = options.rampUp || 5000; // 5 seconds
  }

  /**
   * Run a load test
   */
  async test(name, fn) {
    console.log(`\n🔥 Load Test: ${name}`);
    console.log(`   Concurrency: ${this.concurrency}`);
    console.log(`   Duration: ${this.duration}ms`);
    
    const results = {
      name,
      startTime: Date.now(),
      requests: [],
      errors: [],
      concurrent: 0
    };
    
    const stopTime = Date.now() + this.duration;
    
    // Ramp up gradually
    const rampUpPerWorker = this.rampUp / this.concurrency;
    
    const workers = [];
    for (let i = 0; i < this.concurrency; i++) {
      workers.push(
        this.runWorker(fn, stopTime, results, i * rampUpPerWorker)
      );
    }
    
    // Monitor progress
    const monitorInterval = setInterval(() => {
      const elapsed = Date.now() - results.startTime;
      const remaining = Math.max(0, stopTime - Date.now());
      const reqPerSec = (results.requests.length / elapsed) * 1000;
      
      process.stdout.write(
        `\r   Progress: ${elapsed}ms elapsed, ` +
        `${results.requests.length} requests, ` +
        `${reqPerSec.toFixed(1)} req/s, ` +
        `${results.errors.length} errors   `
      );
    }, 1000);
    
    await Promise.all(workers);
    
    clearInterval(monitorInterval);
    
    // Calculate final stats
    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;
    
    const latencies = results.requests.map(r => r.latency);
    latencies.sort((a, b) => a - b);
    
    results.summary = {
      totalRequests: results.requests.length,
      totalErrors: results.errors.length,
      errorRate: results.errors.length / results.requests.length,
      reqPerSec: results.requests.length / (results.duration / 1000),
      avgLatencyMs: this.average(latencies),
      minLatencyMs: latencies[0],
      maxLatencyMs: latencies[latencies.length - 1],
      p50LatencyMs: this.percentile(latencies, 50),
      p95LatencyMs: this.percentile(latencies, 95),
      p99LatencyMs: this.percentile(latencies, 99)
    };
    
    console.log(`\n\n   ✓ Total: ${results.summary.totalRequests} requests`);
    console.log(`   ✓ Rate: ${results.summary.reqPerSec.toFixed(1)} req/s`);
    console.log(`   ✓ Avg Latency: ${results.summary.avgLatencyMs.toFixed(2)}ms`);
    console.log(`   ✓ P99 Latency: ${results.summary.p99LatencyMs.toFixed(2)}ms`);
    console.log(`   ✓ Errors: ${results.summary.totalErrors} (${(results.summary.errorRate * 100).toFixed(2)}%)\n`);
    
    return results;
  }

  async runWorker(fn, stopTime, results, delay) {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    while (Date.now() < stopTime) {
      const start = process.hrtime.bigint();
      
      try {
        await fn();
        const end = process.hrtime.bigint();
        
        results.requests.push({
          timestamp: Date.now(),
          latency: Number(end - start) / 1_000_000
        });
      } catch (error) {
        results.errors.push({
          timestamp: Date.now(),
          error: error.message
        });
      }
    }
  }

  average(arr) {
    return arr.reduce((sum, v) => sum + v, 0) / arr.length;
  }

  percentile(sortedArr, p) {
    const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
    return sortedArr[Math.max(0, idx)];
  }
}

// ============================================================
// BENCHMARK REPORT GENERATOR
// ============================================================

class BenchmarkReport {
  constructor(results) {
    this.results = results;
  }

  /**
   * Generate markdown report
   */
  toMarkdown() {
    let md = '# Athena Resilience Benchmark Report\n\n';
    md += `Generated: ${new Date().toISOString()}\n\n`;
    
    // Summary table
    md += '## Summary\n\n';
    md += '| Benchmark | Avg (ms) | P95 (ms) | Throughput (/s) |\n';
    md += '|-----------|----------|----------|------------------|\n';
    
    for (const result of this.results) {
      md += `| ${result.name} | ${result.avgMs?.toFixed(3) || 'N/A'} | ` +
           `${result.p95Ms?.toFixed(3) || 'N/A'} | ` +
           `${result.throughputPerSec?.toFixed(1) || 'N/A'} |\n`;
    }
    
    return md;
  }

  /**
   * Generate JSON report
   */
  toJSON() {
    return JSON.stringify(this.results, null, 2);
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  BenchmarkRunner,
  AthenaBenchmarks,
  LoadTester,
  BenchmarkReport
};
