/**
 * Security Monitoring Module
 * Tracks security events and potential threats
 * 
 * Features:
 * - Brute-force detection
 * - XSS attempt logging
 * - CSRF attempt logging
 * - File upload anomalies
 * - Permission escalation attempts
 * - Suspicious activity tracking
 */

import { useLogger, LogCategory } from './useLogger';
import { useAlerts, AlertSeverity } from './useAlerts';

// Security event type
export enum SecurityEventType {
  BRUTE_FORCE = 'brute_force',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  SQL_INJECTION = 'sql_injection',
  FILE_UPLOAD_ANOMALY = 'file_upload_anomaly',
  PERMISSION_ESCALATION = 'permission_escalation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
}

// Security event
interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userId?: string;
  userAgent?: string;
  endpoint?: string;
  details: Record<string, any>;
  timestamp: string;
  blocked: boolean;
}

// Brute force tracking
interface LoginAttempt {
  ip: string;
  userId?: string;
  success: boolean;
  timestamp: number;
}

class SecurityMonitor {
  private logger = useLogger();
  private alerts = useAlerts();
  private events: SecurityEvent[] = [];
  private loginAttempts: LoginAttempt[] = [];
  private blockedIps = new Set<string>();
  private readonly MAX_EVENT_HISTORY = 10000;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_ATTEMPT_WINDOW_MS = 300000; // 5 minutes
  private readonly BLOCK_DURATION_MS = 3600000; // 1 hour

  /**
   * Track login attempt
   */
  async trackLoginAttempt(
    ip: string,
    userId: string | undefined,
    success: boolean,
    userAgent?: string
  ): Promise<boolean> {
    const now = Date.now();
    
    // Add attempt
    this.loginAttempts.push({
      ip,
      userId,
      success,
      timestamp: now,
    });

    // Clean old attempts
    this.loginAttempts = this.loginAttempts.filter(
      a => now - a.timestamp < this.LOGIN_ATTEMPT_WINDOW_MS
    );

    // Check for brute force
    if (!success) {
      const recentFailures = this.loginAttempts.filter(
        a => a.ip === ip && !a.success && now - a.timestamp < this.LOGIN_ATTEMPT_WINDOW_MS
      );

      if (recentFailures.length >= this.MAX_LOGIN_ATTEMPTS) {
        // Block IP
        this.blockedIps.add(ip);
        setTimeout(() => this.blockedIps.delete(ip), this.BLOCK_DURATION_MS);

        // Log security event
        await this.logSecurityEvent(
          SecurityEventType.BRUTE_FORCE,
          'critical',
          ip,
          userId,
          userAgent,
          '/api/auth/login',
          {
            failedAttempts: recentFailures.length,
            windowMs: this.LOGIN_ATTEMPT_WINDOW_MS,
          },
          true
        );

        // Send alert
        await this.alerts.sendAlert(
          AlertSeverity.CRITICAL,
          'Brute Force Attack Detected',
          `IP ${ip} has made ${recentFailures.length} failed login attempts`,
          { ip, failedAttempts: recentFailures.length }
        );

        return true; // Blocked
      }
    }

    return false;
  }

  /**
   * Check if IP is blocked
   */
  isIpBlocked(ip: string): boolean {
    return this.blockedIps.has(ip);
  }

  /**
   * Detect XSS attempt
   */
  async detectXssAttempt(
    input: string,
    ip: string,
    userId?: string,
    userAgent?: string,
    endpoint?: string
  ): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        await this.logSecurityEvent(
          SecurityEventType.XSS_ATTEMPT,
          'high',
          ip,
          userId,
          userAgent,
          endpoint,
          {
            input: input.substring(0, 200),
            pattern: pattern.toString(),
          },
          true
        );

        await this.alerts.sendAlert(
          AlertSeverity.ERROR,
          'XSS Attempt Detected',
          `Potential XSS attempt from IP ${ip}`,
          { ip, endpoint, input: input.substring(0, 100) }
        );

        return true;
      }
    }

    return false;
  }

  /**
   * Detect SQL injection attempt
   */
  async detectSqlInjection(
    input: string,
    ip: string,
    userId?: string,
    userAgent?: string,
    endpoint?: string
  ): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(\bUNION\b.*\bSELECT\b)/gi,
      /(;|\-\-|\/\*|\*\/|xp_|sp_)/gi,
      /(\bOR\b.*=.*)/gi,
      /(\bAND\b.*=.*)/gi,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        await this.logSecurityEvent(
          SecurityEventType.SQL_INJECTION,
          'critical',
          ip,
          userId,
          userAgent,
          endpoint,
          {
            input: input.substring(0, 200),
            pattern: pattern.toString(),
          },
          true
        );

        await this.alerts.sendAlert(
          AlertSeverity.CRITICAL,
          'SQL Injection Attempt Detected',
          `Potential SQL injection from IP ${ip}`,
          { ip, endpoint, input: input.substring(0, 100) }
        );

        return true;
      }
    }

    return false;
  }

  /**
   * Track file upload
   */
  async trackFileUpload(
    filename: string,
    size: number,
    mimeType: string,
    ip: string,
    userId?: string,
    userAgent?: string
  ): Promise<boolean> {
    // Check for suspicious file types
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.asp', '.jsp'];
    const fileExtension = filename.substring(filename.lastIndexOf('.')).toLowerCase();

    if (suspiciousExtensions.includes(fileExtension)) {
      await this.logSecurityEvent(
        SecurityEventType.FILE_UPLOAD_ANOMALY,
        'high',
        ip,
        userId,
        userAgent,
        '/api/upload',
        {
          filename,
          size,
          mimeType,
          extension: fileExtension,
        },
        true
      );

      await this.alerts.sendAlert(
        AlertSeverity.ERROR,
        'Suspicious File Upload Attempt',
        `User attempted to upload suspicious file: ${filename}`,
        { ip, userId, filename, extension: fileExtension }
      );

      return true; // Blocked
    }

    // Check for size anomalies
    if (size > 100 * 1024 * 1024) { // 100MB
      await this.logSecurityEvent(
        SecurityEventType.FILE_UPLOAD_ANOMALY,
        'medium',
        ip,
        userId,
        userAgent,
        '/api/upload',
        {
          filename,
          size,
          mimeType,
          reason: 'file too large',
        },
        false
      );
    }

    return false;
  }

  /**
   * Track permission escalation attempt
   */
  async trackPermissionEscalation(
    userId: string,
    attemptedRole: string,
    currentRole: string,
    ip: string,
    userAgent?: string,
    endpoint?: string
  ) {
    await this.logSecurityEvent(
      SecurityEventType.PERMISSION_ESCALATION,
      'critical',
      ip,
      userId,
      userAgent,
      endpoint,
      {
        attemptedRole,
        currentRole,
      },
      true
    );

    await this.alerts.sendAlert(
      AlertSeverity.CRITICAL,
      'Permission Escalation Attempt',
      `User ${userId} attempted to escalate from ${currentRole} to ${attemptedRole}`,
      { userId, ip, attemptedRole, currentRole }
    );
  }

  /**
   * Track unauthorized access
   */
  async trackUnauthorizedAccess(
    endpoint: string,
    ip: string,
    userId?: string,
    userAgent?: string,
    requiredRole?: string
  ) {
    await this.logSecurityEvent(
      SecurityEventType.UNAUTHORIZED_ACCESS,
      'medium',
      ip,
      userId,
      userAgent,
      endpoint,
      {
        requiredRole,
      },
      false
    );
  }

  /**
   * Track rate limit exceeded
   */
  async trackRateLimitExceeded(
    endpoint: string,
    ip: string,
    userId?: string,
    userAgent?: string,
    requestCount?: number
  ) {
    await this.logSecurityEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      'low',
      ip,
      userId,
      userAgent,
      endpoint,
      {
        requestCount,
      },
      false
    );
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    type: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    ip: string,
    userId?: string,
    userAgent?: string,
    endpoint?: string,
    details?: Record<string, any>,
    blocked: boolean = false
  ) {
    const event: SecurityEvent = {
      type,
      severity,
      ip,
      userId,
      userAgent,
      endpoint,
      details: details || {},
      timestamp: new Date().toISOString(),
      blocked,
    };

    // Add to history
    this.events.push(event);
    if (this.events.length > this.MAX_EVENT_HISTORY) {
      this.events = this.events.slice(-this.MAX_EVENT_HISTORY);
    }

    // Log to logger
    await this.logger.security(
      `Security event: ${type}`,
      {
        ...event,
        severity,
      },
      userId
    );
  }

  /**
   * Get recent security events
   */
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit).reverse();
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter(e => e.type === type);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): SecurityEvent[] {
    return this.events.filter(e => e.severity === severity);
  }

  /**
   * Get events by IP
   */
  getEventsByIp(ip: string): SecurityEvent[] {
    return this.events.filter(e => e.ip === ip);
  }

  /**
   * Get security statistics
   */
  getStatistics(periodMs: number = 86400000): {
    totalEvents: number;
    byType: Record<SecurityEventType, number>;
    bySeverity: Record<string, number>;
    blockedEvents: number;
    topIps: Array<{ ip: string; count: number }>;
  } {
    const cutoff = Date.now() - periodMs;
    const recentEvents = this.events.filter(
      e => Date.parse(e.timestamp) > cutoff
    );

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};
    let blockedEvents = 0;

    for (const event of recentEvents) {
      byType[event.type] = (byType[event.type] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
      ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
      if (event.blocked) blockedEvents++;
    }

    const topIps = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: recentEvents.length,
      byType: byType as Record<SecurityEventType, number>,
      bySeverity,
      blockedEvents,
      topIps,
    };
  }

  /**
   * Clear old events
   */
  clearOldEvents(olderThanMs: number = 2592000000) { // 30 days
    const cutoff = Date.now() - olderThanMs;
    this.events = this.events.filter(e => Date.parse(e.timestamp) > cutoff);
  }

  /**
   * Unblock IP manually
   */
  unblockIp(ip: string) {
    this.blockedIps.delete(ip);
  }

  /**
   * Get blocked IPs
   */
  getBlockedIps(): string[] {
    return Array.from(this.blockedIps);
  }
}

// Singleton instance
let securityMonitorInstance: SecurityMonitor | null = null;

/**
 * Get security monitor instance
 */
export function useSecurityMonitoring(): SecurityMonitor {
  if (!securityMonitorInstance) {
    securityMonitorInstance = new SecurityMonitor();
  }
  return securityMonitorInstance;
}

export default SecurityMonitor;
