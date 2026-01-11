/**
 * Alerting System
 * Sends alerts via Slack, Email, and SMS when thresholds are exceeded
 * 
 * Alert triggers:
 * - API response time > 500ms
 * - DB query > 200ms
 * - Queue job fail
 * - 5xx errors spike
 * - Login failures spike
 * - Storage almost full
 * - CPU > 80%
 * - Memory > 80%
 * - Uptime fail
 */

import { useLogger, LogCategory } from './useLogger';

// Alert severity
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Alert channel
export enum AlertChannel {
  SLACK = 'slack',
  EMAIL = 'email',
  SMS = 'sms',
}

// Alert definition
export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  channels: AlertChannel[];
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// Alert configuration
interface AlertConfig {
  slackWebhookUrl?: string;
  emailRecipients?: string[];
  smsNumbers?: string[];
  enabledChannels: AlertChannel[];
  rateLimitWindowMs: number;
  maxAlertsPerWindow: number;
}

class AlertingSystem {
  private logger = useLogger();
  private config: AlertConfig;
  private alerts: Alert[] = [];
  private alertCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly MAX_ALERT_HISTORY = 1000;

  constructor(config: Partial<AlertConfig> = {}) {
    this.config = {
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
      emailRecipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(','),
      smsNumbers: process.env.ALERT_SMS_NUMBERS?.split(','),
      enabledChannels: [],
      rateLimitWindowMs: 300000, // 5 minutes
      maxAlertsPerWindow: 10,
      ...config,
    };

    // Auto-detect enabled channels
    if (this.config.slackWebhookUrl) {
      this.config.enabledChannels.push(AlertChannel.SLACK);
    }
    if (this.config.emailRecipients && this.config.emailRecipients.length > 0) {
      this.config.enabledChannels.push(AlertChannel.EMAIL);
    }
    if (this.config.smsNumbers && this.config.smsNumbers.length > 0) {
      this.config.enabledChannels.push(AlertChannel.SMS);
    }
  }

  /**
   * Check rate limit for alert type
   */
  private checkRateLimit(alertType: string): boolean {
    const now = Date.now();
    const record = this.alertCounts.get(alertType);

    if (!record || now > record.resetTime) {
      this.alertCounts.set(alertType, {
        count: 1,
        resetTime: now + this.config.rateLimitWindowMs,
      });
      return false;
    }

    record.count++;
    
    return record.count > this.config.maxAlertsPerWindow;
  }

  /**
   * Send alert
   */
  async sendAlert(
    severity: AlertSeverity,
    title: string,
    message: string,
    context?: Record<string, any>,
    channels?: AlertChannel[]
  ): Promise<Alert> {
    // Create alert object
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity,
      title,
      message,
      context,
      timestamp: new Date().toISOString(),
      channels: channels || this.config.enabledChannels,
      acknowledged: false,
    };

    // Check rate limit
    const alertType = `${severity}_${title}`;
    if (this.checkRateLimit(alertType)) {
      await this.logger.warning(
        LogCategory.SYSTEM,
        'Alert rate limit exceeded',
        { alertType, alert }
      );
      return alert;
    }

    // Add to history
    this.alerts.push(alert);
    if (this.alerts.length > this.MAX_ALERT_HISTORY) {
      this.alerts = this.alerts.slice(-this.MAX_ALERT_HISTORY);
    }

    // Log alert
    await this.logger.warning(
      LogCategory.SYSTEM,
      `Alert triggered: ${title}`,
      { severity, message, context }
    );

    // Send to channels
    const sendPromises = alert.channels.map(channel => {
      switch (channel) {
        case AlertChannel.SLACK:
          return this.sendToSlack(alert);
        case AlertChannel.EMAIL:
          return this.sendToEmail(alert);
        case AlertChannel.SMS:
          return this.sendToSMS(alert);
      }
    });

    await Promise.allSettled(sendPromises);

    return alert;
  }

  /**
   * Send alert to Slack
   */
  private async sendToSlack(alert: Alert) {
    if (!this.config.slackWebhookUrl) return;

    try {
      const color = {
        [AlertSeverity.INFO]: '#36a64f',
        [AlertSeverity.WARNING]: '#ff9800',
        [AlertSeverity.ERROR]: '#f44336',
        [AlertSeverity.CRITICAL]: '#9c27b0',
      }[alert.severity];

      const payload = {
        text: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}`,
        attachments: [
          {
            color,
            title: alert.title,
            text: alert.message,
            fields: Object.entries(alert.context || {}).map(([key, value]) => ({
              title: key,
              value: typeof value === 'object' ? JSON.stringify(value) : String(value),
              short: true,
            })),
            footer: 'sanduta.art monitoring',
            ts: Math.floor(Date.parse(alert.timestamp) / 1000),
          },
        ],
      };

      await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      await this.logger.error(
        LogCategory.SYSTEM,
        'Failed to send Slack alert',
        error as Error,
        { alert }
      );
    }
  }

  /**
   * Send alert to Email
   */
  private async sendToEmail(alert: Alert) {
    if (!this.config.emailRecipients || this.config.emailRecipients.length === 0) return;

    try {
      const response = await fetch('/api/alerts/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.config.emailRecipients,
          alert,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email API returned ${response.status}`);
      }
    } catch (error) {
      await this.logger.error(
        LogCategory.SYSTEM,
        'Failed to send email alert',
        error as Error,
        { alert }
      );
    }
  }

  /**
   * Send alert to SMS
   */
  private async sendToSMS(alert: Alert) {
    if (!this.config.smsNumbers || this.config.smsNumbers.length === 0) return;

    try {
      // Only send critical alerts via SMS
      if (alert.severity !== AlertSeverity.CRITICAL) return;

      const response = await fetch('/api/alerts/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.config.smsNumbers,
          message: `${alert.title}: ${alert.message}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS API returned ${response.status}`);
      }
    } catch (error) {
      await this.logger.error(
        LogCategory.SYSTEM,
        'Failed to send SMS alert',
        error as Error,
        { alert }
      );
    }
  }

  /**
   * Alert for slow API response
   */
  async alertSlowApiResponse(endpoint: string, responseTime: number) {
    if (responseTime > 500) {
      await this.sendAlert(
        responseTime > 2000 ? AlertSeverity.ERROR : AlertSeverity.WARNING,
        'Slow API Response',
        `API endpoint ${endpoint} responded in ${responseTime}ms`,
        { endpoint, responseTime, threshold: 500 }
      );
    }
  }

  /**
   * Alert for slow database query
   */
  async alertSlowDbQuery(query: string, duration: number) {
    if (duration > 200) {
      await this.sendAlert(
        duration > 1000 ? AlertSeverity.ERROR : AlertSeverity.WARNING,
        'Slow Database Query',
        `Database query took ${duration}ms`,
        { query: query.substring(0, 200), duration, threshold: 200 }
      );
    }
  }

  /**
   * Alert for failed queue job
   */
  async alertQueueJobFailed(jobType: string, jobId: string, error: string) {
    await this.sendAlert(
      AlertSeverity.ERROR,
      'Queue Job Failed',
      `Job ${jobType} (${jobId}) failed: ${error}`,
      { jobType, jobId, error }
    );
  }

  /**
   * Alert for 5xx error spike
   */
  async alert5xxSpike(count: number, period: string) {
    await this.sendAlert(
      AlertSeverity.CRITICAL,
      '5xx Error Spike',
      `Detected ${count} server errors in ${period}`,
      { count, period }
    );
  }

  /**
   * Alert for login failure spike
   */
  async alertLoginFailureSpike(count: number, period: string) {
    await this.sendAlert(
      AlertSeverity.ERROR,
      'Login Failure Spike',
      `Detected ${count} failed login attempts in ${period}`,
      { count, period }
    );
  }

  /**
   * Alert for storage almost full
   */
  async alertStorageFull(usagePercent: number) {
    await this.sendAlert(
      usagePercent > 95 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
      'Storage Almost Full',
      `Storage usage is at ${usagePercent}%`,
      { usagePercent, threshold: 90 }
    );
  }

  /**
   * Alert for high CPU usage
   */
  async alertHighCpu(cpuPercent: number) {
    if (cpuPercent > 80) {
      await this.sendAlert(
        cpuPercent > 95 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        'High CPU Usage',
        `CPU usage is at ${cpuPercent}%`,
        { cpuPercent, threshold: 80 }
      );
    }
  }

  /**
   * Alert for high memory usage
   */
  async alertHighMemory(memoryPercent: number) {
    if (memoryPercent > 80) {
      await this.sendAlert(
        memoryPercent > 95 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        'High Memory Usage',
        `Memory usage is at ${memoryPercent}%`,
        { memoryPercent, threshold: 80 }
      );
    }
  }

  /**
   * Alert for uptime failure
   */
  async alertUptimeFailure(service: string, error: string) {
    await this.sendAlert(
      AlertSeverity.CRITICAL,
      'Service Down',
      `${service} is not responding: ${error}`,
      { service, error }
    );
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return;

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = acknowledgedBy;

    await this.logger.info(
      LogCategory.SYSTEM,
      `Alert acknowledged: ${alert.title}`,
      { alertId, acknowledgedBy }
    );
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 100): Alert[] {
    return this.alerts.slice(-limit).reverse();
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): Alert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this.alerts.filter(a => a.severity === severity);
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(olderThanMs: number = 604800000) { // 7 days
    const cutoff = Date.now() - olderThanMs;
    this.alerts = this.alerts.filter(a => Date.parse(a.timestamp) > cutoff);
  }
}

// Singleton instance
let alertingInstance: AlertingSystem | null = null;

/**
 * Get alerting system instance
 */
export function useAlerts(): AlertingSystem {
  if (!alertingInstance) {
    alertingInstance = new AlertingSystem();
  }
  return alertingInstance;
}

export default AlertingSystem;
