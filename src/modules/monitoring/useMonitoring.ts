/**
 * Monitoring and Performance Tracking
 * Logs, metrics, alerts, uptime monitoring
 */

import { logger } from '@/lib/logger';

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

/**
 * Monitoring Manager
 */
export class MonitoringManager {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  /**
   * Track metric
   */
  trackMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      timestamp: new Date(),
      tags,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Track API request duration
   */
  async trackApiRequest<T>(
    endpoint: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - start;

      this.trackMetric('api.request.duration', duration, {
        endpoint,
        status: 'success',
      });

      // Log slow requests
      if (duration > 1000) {
        logger.warn('Monitoring', 'Slow API request', { endpoint, duration });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      this.trackMetric('api.request.duration', duration, {
        endpoint,
        status: 'error',
      });

      logger.error('Monitoring', 'API request error', { endpoint, error, duration });
      throw error;
    }
  }

  /**
   * Track database query duration
   */
  async trackDbQuery<T>(
    query: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - start;

      this.trackMetric('db.query.duration', duration, {
        query,
        status: 'success',
      });

      // Log slow queries
      if (duration > 500) {
        logger.warn('Monitoring', 'Slow database query', { query, duration });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      this.trackMetric('db.query.duration', duration, {
        query,
        status: 'error',
      });

      logger.error('Monitoring', 'Database query error', { query, error, duration });
      throw error;
    }
  }

  /**
   * Get metrics by name
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Get metric statistics
   */
  getStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const metrics = this.getMetrics(name);

    if (metrics.length === 0) {
      return {
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      avg: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: values[Math.floor(values.length * 0.5)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    };
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Singleton instance
export const monitoring = new MonitoringManager();

/**
 * Performance monitoring helpers
 */
export const PerformanceMonitoring = {
  /**
   * Track page load time
   */
  trackPageLoad(page: string, duration: number): void {
    monitoring.trackMetric('page.load.duration', duration, { page });
  },

  /**
   * Track API response time
   */
  trackApiResponse(endpoint: string, duration: number, status: number): void {
    monitoring.trackMetric('api.response.time', duration, {
      endpoint,
      status: String(status),
    });
  },

  /**
   * Track cache hit/miss
   */
  trackCacheHit(key: string, hit: boolean): void {
    monitoring.trackMetric('cache.hit', hit ? 1 : 0, { key });
  },

  /**
   * Track error
   */
  trackError(type: string, message: string): void {
    monitoring.trackMetric('error.count', 1, { type, message });
    logger.error('Monitoring', 'Tracked error', { type, message });
  },

  /**
   * Track user action
   */
  trackUserAction(action: string, userId?: string): void {
    monitoring.trackMetric('user.action', 1, {
      action,
      userId: userId || 'anonymous',
    });
  },
};

/**
 * Uptime monitoring
 */
export class UptimeMonitor {
  private checks: Array<{
    url: string;
    status: number;
    duration: number;
    timestamp: Date;
  }> = [];

  /**
   * Check endpoint health
   */
  async checkEndpoint(url: string): Promise<{
    status: number;
    duration: number;
    healthy: boolean;
  }> {
    const start = Date.now();

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-store',
      });

      const duration = Date.now() - start;
      const status = response.status;
      const healthy = status >= 200 && status < 300;

      this.checks.push({
        url,
        status,
        duration,
        timestamp: new Date(),
      });

      // Keep only last 100 checks
      if (this.checks.length > 100) {
        this.checks.shift();
      }

      if (!healthy) {
        logger.error('Monitoring', 'Endpoint unhealthy', { url, status, duration });
      }

      return { status, duration, healthy };
    } catch (error) {
      const duration = Date.now() - start;

      logger.error('Monitoring', 'Endpoint check failed', { url, error, duration });

      return {
        status: 0,
        duration,
        healthy: false,
      };
    }
  }

  /**
   * Get uptime percentage
   */
  getUptime(url?: string): number {
    const checks = url
      ? this.checks.filter((c) => c.url === url)
      : this.checks;

    if (checks.length === 0) return 100;

    const healthy = checks.filter((c) => c.status >= 200 && c.status < 300);
    return (healthy.length / checks.length) * 100;
  }
}

// Singleton uptime monitor
export const uptimeMonitor = new UptimeMonitor();
