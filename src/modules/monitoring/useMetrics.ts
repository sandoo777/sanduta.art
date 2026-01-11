/**
 * Performance Metrics Module
 * Tracks web vitals and server performance metrics
 * 
 * Metrics tracked:
 * - TTFB (Time to First Byte)
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - Server response time
 * - Database query time
 * - Queue processing time
 * - Cache hit/miss ratio
 * - ISR regeneration time
 */

import { useLogger, LogCategory } from './useLogger';

// Metric types
export enum MetricType {
  TTFB = 'ttfb',
  LCP = 'lcp',
  FID = 'fid',
  CLS = 'cls',
  SERVER_RESPONSE = 'server_response',
  DB_QUERY = 'db_query',
  QUEUE_PROCESSING = 'queue_processing',
  CACHE_HIT = 'cache_hit',
  CACHE_MISS = 'cache_miss',
  ISR_REGENERATION = 'isr_regeneration',
  API_CALL = 'api_call',
}

// Metric entry
export interface Metric {
  type: MetricType;
  value: number;
  unit: 'ms' | 'score' | 'ratio' | 'count';
  timestamp: string;
  context?: Record<string, any>;
  tags?: string[];
}

// Performance thresholds
const THRESHOLDS = {
  [MetricType.TTFB]: 800, // ms
  [MetricType.LCP]: 2500, // ms
  [MetricType.FID]: 100, // ms
  [MetricType.CLS]: 0.1, // score
  [MetricType.SERVER_RESPONSE]: 500, // ms
  [MetricType.DB_QUERY]: 200, // ms
  [MetricType.QUEUE_PROCESSING]: 5000, // ms
  [MetricType.ISR_REGENERATION]: 1000, // ms
  [MetricType.API_CALL]: 500, // ms
};

// In-memory metrics store
let metricsStore: Metric[] = [];
const MAX_METRICS_IN_MEMORY = 1000;

class MetricsCollector {
  private logger = useLogger();
  private timers = new Map<string, number>();
  private cacheStats = {
    hits: 0,
    misses: 0,
  };

  /**
   * Record a metric
   */
  async record(
    type: MetricType,
    value: number,
    unit: 'ms' | 'score' | 'ratio' | 'count' = 'ms',
    context?: Record<string, any>,
    tags?: string[]
  ) {
    const metric: Metric = {
      type,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context,
      tags,
    };

    // Add to in-memory store
    metricsStore.push(metric);
    
    // Keep only recent metrics
    if (metricsStore.length > MAX_METRICS_IN_MEMORY) {
      metricsStore = metricsStore.slice(-MAX_METRICS_IN_MEMORY);
    }

    // Check threshold and log if exceeded
    const threshold = THRESHOLDS[type];
    if (threshold && value > threshold) {
      await this.logger.warning(
        LogCategory.SYSTEM,
        `Performance threshold exceeded: ${type}`,
        {
          type,
          value,
          threshold,
          unit,
          ...context,
        }
      );
    }

    // Log performance metric
    await this.logger.performance(
      LogCategory.SYSTEM,
      `Metric: ${type}`,
      value,
      { unit, ...context, tags }
    );

    // Send to external metrics service (if configured)
    await this.sendToExternalService(metric);
  }

  /**
   * Start a timer for measuring duration
   */
  startTimer(label: string) {
    this.timers.set(label, Date.now());
  }

  /**
   * End a timer and record the metric
   */
  async endTimer(
    label: string,
    type: MetricType,
    context?: Record<string, any>,
    tags?: string[]
  ) {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer not found: ${label}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);

    await this.record(type, duration, 'ms', context, tags);
    
    return duration;
  }

  /**
   * Record TTFB (Time to First Byte)
   */
  async recordTTFB(value: number, context?: Record<string, any>) {
    await this.record(MetricType.TTFB, value, 'ms', context, ['web-vitals']);
  }

  /**
   * Record LCP (Largest Contentful Paint)
   */
  async recordLCP(value: number, context?: Record<string, any>) {
    await this.record(MetricType.LCP, value, 'ms', context, ['web-vitals']);
  }

  /**
   * Record FID (First Input Delay)
   */
  async recordFID(value: number, context?: Record<string, any>) {
    await this.record(MetricType.FID, value, 'ms', context, ['web-vitals']);
  }

  /**
   * Record CLS (Cumulative Layout Shift)
   */
  async recordCLS(value: number, context?: Record<string, any>) {
    await this.record(MetricType.CLS, value, 'score', context, ['web-vitals']);
  }

  /**
   * Record server response time
   */
  async recordServerResponse(duration: number, endpoint: string, context?: Record<string, any>) {
    await this.record(
      MetricType.SERVER_RESPONSE,
      duration,
      'ms',
      { endpoint, ...context },
      ['server']
    );
  }

  /**
   * Record database query time
   */
  async recordDbQuery(duration: number, query: string, context?: Record<string, any>) {
    await this.record(
      MetricType.DB_QUERY,
      duration,
      'ms',
      { query, ...context },
      ['database']
    );
  }

  /**
   * Record queue processing time
   */
  async recordQueueProcessing(duration: number, jobType: string, context?: Record<string, any>) {
    await this.record(
      MetricType.QUEUE_PROCESSING,
      duration,
      'ms',
      { jobType, ...context },
      ['queue']
    );
  }

  /**
   * Record cache hit
   */
  async recordCacheHit(key: string, context?: Record<string, any>) {
    this.cacheStats.hits++;
    await this.record(
      MetricType.CACHE_HIT,
      1,
      'count',
      { key, ...context },
      ['cache']
    );
  }

  /**
   * Record cache miss
   */
  async recordCacheMiss(key: string, context?: Record<string, any>) {
    this.cacheStats.misses++;
    await this.record(
      MetricType.CACHE_MISS,
      1,
      'count',
      { key, ...context },
      ['cache']
    );
  }

  /**
   * Get cache hit ratio
   */
  getCacheHitRatio(): number {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    if (total === 0) return 0;
    return this.cacheStats.hits / total;
  }

  /**
   * Record ISR regeneration time
   */
  async recordISRRegeneration(duration: number, path: string, context?: Record<string, any>) {
    await this.record(
      MetricType.ISR_REGENERATION,
      duration,
      'ms',
      { path, ...context },
      ['isr']
    );
  }

  /**
   * Record API call duration
   */
  async recordApiCall(duration: number, endpoint: string, method: string, statusCode: number, context?: Record<string, any>) {
    await this.record(
      MetricType.API_CALL,
      duration,
      'ms',
      { endpoint, method, statusCode, ...context },
      ['api']
    );
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(type?: MetricType, limit: number = 100): Metric[] {
    let filtered = metricsStore;
    
    if (type) {
      filtered = filtered.filter(m => m.type === type);
    }
    
    return filtered.slice(-limit);
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(type: MetricType, periodMs: number = 3600000): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const cutoff = Date.now() - periodMs;
    const metrics = metricsStore
      .filter(m => m.type === type && Date.parse(m.timestamp) > cutoff)
      .map(m => m.value)
      .sort((a, b) => a - b);

    if (metrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }

    const sum = metrics.reduce((a, b) => a + b, 0);
    const avg = sum / metrics.length;
    const min = metrics[0];
    const max = metrics[metrics.length - 1];
    
    const getPercentile = (p: number) => {
      const index = Math.floor(metrics.length * p);
      return metrics[index] || 0;
    };

    return {
      count: metrics.length,
      avg,
      min,
      max,
      p50: getPercentile(0.5),
      p95: getPercentile(0.95),
      p99: getPercentile(0.99),
    };
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(olderThanMs: number = 86400000) { // 24 hours
    const cutoff = Date.now() - olderThanMs;
    metricsStore = metricsStore.filter(m => Date.parse(m.timestamp) > cutoff);
  }

  /**
   * Send metrics to external service (Datadog, Prometheus, etc.)
   */
  private async sendToExternalService(metric: Metric) {
    // Send to Datadog
    if (process.env.DATADOG_API_KEY) {
      try {
        await fetch('https://api.datadoghq.com/api/v1/series', {
          method: 'POST',
          headers: {
            'DD-API-KEY': process.env.DATADOG_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            series: [{
              metric: `sanduta.${metric.type}`,
              points: [[Math.floor(Date.parse(metric.timestamp) / 1000), metric.value]],
              type: 'gauge',
              tags: metric.tags,
            }],
          }),
        });
      } catch (error) {
        console.error('Failed to send metric to Datadog:', error);
      }
    }

    // Send to custom endpoint
    if (process.env.METRICS_ENDPOINT) {
      try {
        await fetch(process.env.METRICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metric),
        });
      } catch (error) {
        console.error('Failed to send metric to custom endpoint:', error);
      }
    }
  }
}

// Singleton instance
let metricsInstance: MetricsCollector | null = null;

/**
 * Get metrics collector instance
 */
export function useMetrics(): MetricsCollector {
  if (!metricsInstance) {
    metricsInstance = new MetricsCollector();
  }
  return metricsInstance;
}

/**
 * React hook for client-side metrics
 */
export function useClientMetrics() {
  const sendMetric = async (
    type: MetricType,
    value: number,
    context?: Record<string, any>
  ) => {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          value,
          context,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send metric:', error);
    }
  };

  return {
    recordTTFB: (value: number, context?: Record<string, any>) => 
      sendMetric(MetricType.TTFB, value, context),
    recordLCP: (value: number, context?: Record<string, any>) => 
      sendMetric(MetricType.LCP, value, context),
    recordFID: (value: number, context?: Record<string, any>) => 
      sendMetric(MetricType.FID, value, context),
    recordCLS: (value: number, context?: Record<string, any>) => 
      sendMetric(MetricType.CLS, value, context),
  };
}

export default MetricsCollector;
