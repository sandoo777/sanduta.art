/**
 * Monitoring System Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useLogger, LogLevel, LogCategory } from '@/modules/monitoring/useLogger';
import { useMetrics, MetricType } from '@/modules/monitoring/useMetrics';
import { useDbMonitoring } from '@/modules/monitoring/useDbMonitoring';
import { useQueueMonitoring, JobType, JobStatus } from '@/modules/monitoring/useQueueMonitoring';
import { useAlerts, AlertSeverity } from '@/modules/monitoring/useAlerts';
import { useSecurityMonitoring, SecurityEventType } from '@/modules/monitoring/useSecurityMonitoring';
import { useProfiler } from '@/modules/monitoring/useProfiler';

describe('Monitoring System', () => {
  describe('Logger', () => {
    const logger = useLogger();

    it('should log info messages', async () => {
      await expect(
        logger.info(LogCategory.API, 'Test info message', { test: true })
      ).resolves.not.toThrow();
    });

    it('should log warnings', async () => {
      await expect(
        logger.warning(LogCategory.API, 'Test warning', { test: true })
      ).resolves.not.toThrow();
    });

    it('should log errors', async () => {
      const error = new Error('Test error');
      await expect(
        logger.error(LogCategory.API, 'Test error message', error, { test: true })
      ).resolves.not.toThrow();
    });

    it('should log critical errors', async () => {
      const error = new Error('Critical error');
      await expect(
        logger.critical(LogCategory.SYSTEM, 'Critical error', error, { test: true })
      ).resolves.not.toThrow();
    });

    it('should log audit events', async () => {
      await expect(
        logger.audit('User logged in', { userId: '123' }, '123')
      ).resolves.not.toThrow();
    });

    it('should log performance metrics', async () => {
      await expect(
        logger.performance(LogCategory.API, 'API call', 150, { endpoint: '/api/test' })
      ).resolves.not.toThrow();
    });

    it('should log security events', async () => {
      await expect(
        logger.security('Login attempt failed', { ip: '1.2.3.4' })
      ).resolves.not.toThrow();
    });
  });

  describe('Metrics', () => {
    const metrics = useMetrics();

    beforeEach(() => {
      // Clear metrics before each test
    });

    it('should record TTFB metric', async () => {
      await expect(
        metrics.recordTTFB(100, { page: '/home' })
      ).resolves.not.toThrow();
    });

    it('should record LCP metric', async () => {
      await expect(
        metrics.recordLCP(1500, { page: '/products' })
      ).resolves.not.toThrow();
    });

    it('should record FID metric', async () => {
      await expect(
        metrics.recordFID(50, { page: '/checkout' })
      ).resolves.not.toThrow();
    });

    it('should record CLS metric', async () => {
      await expect(
        metrics.recordCLS(0.05, { page: '/home' })
      ).resolves.not.toThrow();
    });

    it('should record database query time', async () => {
      await expect(
        metrics.recordDbQuery(150, 'SELECT * FROM users', { table: 'users' })
      ).resolves.not.toThrow();
    });

    it('should record API call duration', async () => {
      await expect(
        metrics.recordApiCall(200, '/api/products', 'GET', 200)
      ).resolves.not.toThrow();
    });

    it('should track cache hits and misses', async () => {
      await metrics.recordCacheHit('product:123');
      await metrics.recordCacheMiss('product:456');
      
      const hitRatio = metrics.getCacheHitRatio();
      expect(hitRatio).toBeGreaterThanOrEqual(0);
      expect(hitRatio).toBeLessThanOrEqual(1);
    });

    it('should provide metrics summary', () => {
      const summary = metrics.getMetricsSummary(MetricType.API_CALL, 3600000);
      expect(summary).toHaveProperty('count');
      expect(summary).toHaveProperty('avg');
      expect(summary).toHaveProperty('min');
      expect(summary).toHaveProperty('max');
      expect(summary).toHaveProperty('p50');
      expect(summary).toHaveProperty('p95');
      expect(summary).toHaveProperty('p99');
    });
  });

  describe('Queue Monitoring', () => {
    const queue = useQueueMonitoring();

    beforeEach(() => {
      // Clear queue state before each test
    });

    it('should register a job', async () => {
      const job = await queue.registerJob('test-1', JobType.EMAIL, { to: 'test@example.com' });
      
      expect(job).toHaveProperty('id', 'test-1');
      expect(job).toHaveProperty('type', JobType.EMAIL);
      expect(job).toHaveProperty('status', JobStatus.PENDING);
    });

    it('should start a job', async () => {
      await queue.registerJob('test-2', JobType.EMAIL, {});
      await expect(queue.startJob('test-2')).resolves.not.toThrow();
      
      const job = queue.getJob('test-2');
      expect(job?.status).toBe(JobStatus.ACTIVE);
    });

    it('should complete a job', async () => {
      await queue.registerJob('test-3', JobType.EMAIL, {});
      await queue.startJob('test-3');
      await expect(queue.completeJob('test-3')).resolves.not.toThrow();
    });

    it('should fail a job and retry', async () => {
      await queue.registerJob('test-4', JobType.EMAIL, {}, 3);
      await queue.startJob('test-4');
      
      const error = new Error('Test error');
      await queue.failJob('test-4', error);
      
      const job = queue.getJob('test-4');
      expect(job?.status).toBe(JobStatus.RETRYING);
      expect(job?.retryCount).toBe(1);
    });

    it('should permanently fail a job after max retries', async () => {
      await queue.registerJob('test-5', JobType.EMAIL, {}, 1);
      await queue.startJob('test-5');
      
      const error = new Error('Test error');
      await queue.failJob('test-5', error);
      await queue.failJob('test-5', error);
      
      const job = queue.getJob('test-5');
      expect(job).toBeUndefined(); // Moved to completed history
    });

    it('should provide queue statistics', () => {
      const stats = queue.getStats();
      
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('averageProcessingTime');
      expect(stats).toHaveProperty('successRate');
    });

    it('should get failed jobs', () => {
      const failedJobs = queue.getFailedJobs(10);
      expect(Array.isArray(failedJobs)).toBe(true);
    });

    it('should get health status', async () => {
      const health = await queue.getHealthStatus();
      
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('issues');
      expect(health).toHaveProperty('stats');
      expect(typeof health.healthy).toBe('boolean');
    });
  });

  describe('Alerts', () => {
    const alerts = useAlerts();

    it('should send alert', async () => {
      const alert = await alerts.sendAlert(
        AlertSeverity.WARNING,
        'Test Alert',
        'This is a test alert',
        { test: true }
      );

      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('severity', AlertSeverity.WARNING);
      expect(alert).toHaveProperty('title', 'Test Alert');
      expect(alert).toHaveProperty('acknowledged', false);
    });

    it('should alert on slow API response', async () => {
      await expect(
        alerts.alertSlowApiResponse('/api/test', 600)
      ).resolves.not.toThrow();
    });

    it('should alert on slow DB query', async () => {
      await expect(
        alerts.alertSlowDbQuery('SELECT * FROM large_table', 250)
      ).resolves.not.toThrow();
    });

    it('should alert on queue job failure', async () => {
      await expect(
        alerts.alertQueueJobFailed('email', 'job-123', 'Connection timeout')
      ).resolves.not.toThrow();
    });

    it('should acknowledge alert', async () => {
      const alert = await alerts.sendAlert(
        AlertSeverity.INFO,
        'Test',
        'Test message'
      );

      await alerts.acknowledgeAlert(alert.id, 'admin-user');
      
      const acknowledgedAlert = alerts.getRecentAlerts(1)[0];
      expect(acknowledgedAlert.acknowledged).toBe(true);
      expect(acknowledgedAlert.acknowledgedBy).toBe('admin-user');
    });

    it('should get unacknowledged alerts', () => {
      const unacknowledged = alerts.getUnacknowledgedAlerts();
      expect(Array.isArray(unacknowledged)).toBe(true);
    });
  });

  describe('Security Monitoring', () => {
    const security = useSecurityMonitoring();

    it('should track login attempt', async () => {
      const blocked = await security.trackLoginAttempt('1.2.3.4', 'user-1', false);
      expect(typeof blocked).toBe('boolean');
    });

    it('should detect brute force attack', async () => {
      const ip = '10.0.0.1';
      
      // Make multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await security.trackLoginAttempt(ip, 'user-1', false);
      }
      
      expect(security.isIpBlocked(ip)).toBe(true);
    });

    it('should detect XSS attempt', async () => {
      const detected = await security.detectXssAttempt(
        '<script>alert("xss")</script>',
        '1.2.3.4',
        'user-1',
        'Mozilla/5.0'
      );
      
      expect(detected).toBe(true);
    });

    it('should detect SQL injection attempt', async () => {
      const detected = await security.detectSqlInjection(
        "' OR '1'='1",
        '1.2.3.4',
        'user-1'
      );
      
      expect(detected).toBe(true);
    });

    it('should track suspicious file upload', async () => {
      const blocked = await security.trackFileUpload(
        'malware.exe',
        1000,
        'application/octet-stream',
        '1.2.3.4'
      );
      
      expect(blocked).toBe(true);
    });

    it('should get security statistics', () => {
      const stats = security.getStatistics(86400000);
      
      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('bySeverity');
      expect(stats).toHaveProperty('blockedEvents');
      expect(stats).toHaveProperty('topIps');
    });
  });

  describe('Profiler', () => {
    const profiler = useProfiler();

    beforeEach(() => {
      profiler.setEnabled(true);
    });

    it('should profile a function', async () => {
      const result = await profiler.profileFunction('testFunction', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'result';
      });

      expect(result).toBe('result');
    });

    it('should measure function duration', async () => {
      const id = profiler.start('testMeasure', 'function');
      await new Promise(resolve => setTimeout(resolve, 50));
      const duration = await profiler.end(id);

      expect(duration).toBeGreaterThan(40);
      expect(duration).toBeLessThan(100);
    });

    it('should get top profiles', () => {
      const topProfiles = profiler.getTopProfiles(10);
      expect(Array.isArray(topProfiles)).toBe(true);
    });

    it('should get bottlenecks', () => {
      const bottlenecks = profiler.getBottlenecks(10);
      expect(Array.isArray(bottlenecks)).toBe(true);
    });

    it('should export results', () => {
      const exported = profiler.exportResults();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('topProfiles');
      expect(parsed).toHaveProperty('bottlenecks');
    });
  });
});
