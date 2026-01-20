/**
 * Security Monitoring & Alerting System
 * Real-time security event detection and alerting
 */

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

/**
 * Security event types
 */
export enum SecurityEventType {
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  SUSPICIOUS_FILE_UPLOAD = 'SUSPICIOUS_FILE_UPLOAD',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_VIOLATION = 'PERMISSION_VIOLATION',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  CRITICAL_ENDPOINT_ACCESS = 'CRITICAL_ENDPOINT_ACCESS',
  ABNORMAL_TRAFFIC = 'ABNORMAL_TRAFFIC',
  API_ABUSE = 'API_ABUSE',
}

/**
 * Security event severity
 */
export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Security event interface
 */
export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Alert thresholds
 */
const ALERT_THRESHOLDS = {
  [SecurityEventType.LOGIN_FAILED]: 3, // 3 failed logins in 15 minutes
  [SecurityEventType.BRUTE_FORCE_ATTEMPT]: 1, // Immediate alert
  [SecurityEventType.SUSPICIOUS_FILE_UPLOAD]: 1,
  [SecurityEventType.XSS_ATTEMPT]: 1,
  [SecurityEventType.SQL_INJECTION_ATTEMPT]: 1,
  [SecurityEventType.UNAUTHORIZED_ACCESS]: 5,
  [SecurityEventType.ABNORMAL_TRAFFIC]: 1,
};

/**
 * Security monitoring storage (in-memory for now)
 */
class SecurityEventStore {
  private events: Map<string, SecurityEvent[]> = new Map();
  private readonly RETENTION_PERIOD = 60 * 60 * 1000; // 1 hour

  /**
   * Record security event
   */
  record(event: SecurityEvent): void {
    const key = this.getKey(event);
    const events = this.events.get(key) || [];
    events.push(event);
    this.events.set(key, events);

    // Clean old events
    this.cleanOldEvents();
  }

  /**
   * Get events for key in time window
   */
  getRecentEvents(eventType: SecurityEventType, identifier: string, windowMs: number): SecurityEvent[] {
    const key = `${eventType}:${identifier}`;
    const events = this.events.get(key) || [];
    const cutoff = Date.now() - windowMs;
    return events.filter((e) => e.timestamp.getTime() > cutoff);
  }

  /**
   * Get key for event
   */
  private getKey(event: SecurityEvent): string {
    const identifier = event.userId || event.ip || 'unknown';
    return `${event.type}:${identifier}`;
  }

  /**
   * Clean events older than retention period
   */
  private cleanOldEvents(): void {
    const cutoff = Date.now() - this.RETENTION_PERIOD;

    for (const [key, events] of this.events.entries()) {
      const filtered = events.filter((e) => e.timestamp.getTime() > cutoff);
      if (filtered.length === 0) {
        this.events.delete(key);
      } else {
        this.events.set(key, filtered);
      }
    }
  }

  /**
   * Get all events count by type
   */
  getEventCounts(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const events of this.events.values()) {
      for (const event of events) {
        counts[event.type] = (counts[event.type] || 0) + 1;
      }
    }

    return counts;
  }
}

const eventStore = new SecurityEventStore();

/**
 * Security monitoring manager
 */
export class SecurityMonitoring {
  /**
   * Record security event
   */
  static recordEvent(event: SecurityEvent): void {
    // Store event
    eventStore.record(event);

    // Log event
    logger.warn('SecurityMonitoring', `Security event: ${event.type}`, {
      severity: event.severity,
      userId: event.userId,
      ip: event.ip,
      endpoint: event.endpoint,
      details: event.details,
    });

    // Check if alert should be triggered
    this.checkAlertThreshold(event);

    // Save to audit log if critical
    if (event.severity === SecuritySeverity.CRITICAL || event.severity === SecuritySeverity.HIGH) {
      this.saveToAuditLog(event);
    }
  }

  /**
   * Check if alert threshold is reached
   */
  private static checkAlertThreshold(event: SecurityEvent): void {
    const threshold = ALERT_THRESHOLDS[event.type];
    if (!threshold) return;

    const identifier = event.userId || event.ip || 'unknown';
    const recentEvents = eventStore.getRecentEvents(event.type, identifier, 15 * 60 * 1000); // 15 min window

    if (recentEvents.length >= threshold) {
      this.triggerAlert(event, recentEvents);
    }
  }

  /**
   * Trigger security alert
   */
  private static async triggerAlert(event: SecurityEvent, recentEvents: SecurityEvent[]): Promise<void> {
    logger.error('SecurityMonitoring', '🚨 SECURITY ALERT TRIGGERED', {
      type: event.type,
      severity: event.severity,
      eventCount: recentEvents.length,
      userId: event.userId,
      ip: event.ip,
      endpoint: event.endpoint,
    });

    // TODO: Send alerts via Slack, Email, etc.
    // await this.sendSlackAlert(event, recentEvents);
    // await this.sendEmailAlert(event, recentEvents);
  }

  /**
   * Send Slack alert (placeholder)
   */
  private static async sendSlackAlert(event: SecurityEvent, recentEvents: SecurityEvent[]): Promise<void> {
    try {
      const webhookUrl = process.env.SLACK_SECURITY_WEBHOOK;
      if (!webhookUrl) return;

      const message = {
        text: `🚨 Security Alert: ${event.type}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 Security Alert: ${event.type}`,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Severity:* ${event.severity}` },
              { type: 'mrkdwn', text: `*Events:* ${recentEvents.length}` },
              { type: 'mrkdwn', text: `*User ID:* ${event.userId || 'N/A'}` },
              { type: 'mrkdwn', text: `*IP:* ${event.ip || 'N/A'}` },
            ],
          },
        ],
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      logger.info('SecurityMonitoring', 'Slack alert sent', { type: event.type });
    } catch (_error) {
      logger.error('SecurityMonitoring', 'Failed to send Slack alert', { error });
    }
  }

  /**
   * Send email alert (placeholder)
   */
  private static async sendEmailAlert(event: SecurityEvent, recentEvents: SecurityEvent[]): Promise<void> {
    try {
      const adminEmail = process.env.SECURITY_ADMIN_EMAIL;
      if (!adminEmail) return;

      // TODO: Implement email sending
      logger.info('SecurityMonitoring', 'Email alert sent', { type: event.type, to: adminEmail });
    } catch (_error) {
      logger.error('SecurityMonitoring', 'Failed to send email alert', { error });
    }
  }

  /**
   * Save to audit log
   */
  private static async saveToAuditLog(event: SecurityEvent): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: event.type,
          userId: event.userId || null,
          resourceType: 'SECURITY_EVENT',
          resourceId: null,
          changes: event.details as any,
          ipAddress: event.ip,
          userAgent: event.userAgent,
        },
      });
    } catch (_error) {
      logger.error('SecurityMonitoring', 'Failed to save to audit log', { error });
    }
  }

  /**
   * Get security statistics
   */
  static getStatistics(): {
    eventCounts: Record<string, number>;
    lastHourEvents: number;
    criticalEvents: number;
  } {
    const eventCounts = eventStore.getEventCounts();
    const lastHourEvents = Object.values(eventCounts).reduce((sum, count) => sum + count, 0);
    const criticalEvents = 0; // TODO: Calculate from stored events

    return {
      eventCounts,
      lastHourEvents,
      criticalEvents,
    };
  }

  /**
   * Helper methods for recording specific events
   */
  static recordLoginFailed(userId: string, ip: string, userAgent: string): void {
    this.recordEvent({
      type: SecurityEventType.LOGIN_FAILED,
      severity: SecuritySeverity.MEDIUM,
      userId,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  }

  static recordLoginSuccess(userId: string, ip: string, userAgent: string): void {
    this.recordEvent({
      type: SecurityEventType.LOGIN_SUCCESS,
      severity: SecuritySeverity.LOW,
      userId,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  }

  static recordBruteForce(identifier: string, ip: string): void {
    this.recordEvent({
      type: SecurityEventType.BRUTE_FORCE_ATTEMPT,
      severity: SecuritySeverity.CRITICAL,
      userId: identifier,
      ip,
      timestamp: new Date(),
    });
  }

  static recordSuspiciousFileUpload(userId: string, filename: string, reason: string): void {
    this.recordEvent({
      type: SecurityEventType.SUSPICIOUS_FILE_UPLOAD,
      severity: SecuritySeverity.HIGH,
      userId,
      details: { filename, reason },
      timestamp: new Date(),
    });
  }

  static recordXssAttempt(ip: string, endpoint: string, pattern: string): void {
    this.recordEvent({
      type: SecurityEventType.XSS_ATTEMPT,
      severity: SecuritySeverity.HIGH,
      ip,
      endpoint,
      details: { pattern },
      timestamp: new Date(),
    });
  }

  static recordPermissionViolation(userId: string, endpoint: string, permission: string): void {
    this.recordEvent({
      type: SecurityEventType.PERMISSION_VIOLATION,
      severity: SecuritySeverity.MEDIUM,
      userId,
      endpoint,
      details: { permission },
      timestamp: new Date(),
    });
  }
}
