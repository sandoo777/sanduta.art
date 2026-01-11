/**
 * Backup Monitoring System
 * Monitors backup health, sends alerts, verifies integrity
 */

import { logger } from '@/lib/logger';
import { BackupEngine, BackupMetadata, BackupStatus } from './useBackupEngine';
import { RestoreEngine } from './useRestore';

/**
 * Alert types
 */
export enum AlertType {
  BACKUP_FAILED = 'BACKUP_FAILED',
  BACKUP_INCOMPLETE = 'BACKUP_INCOMPLETE',
  STORAGE_LOW = 'STORAGE_LOW',
  BACKUP_CORRUPTION = 'BACKUP_CORRUPTION',
  NO_RECENT_BACKUP = 'NO_RECENT_BACKUP',
}

/**
 * Alert severity
 */
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

/**
 * Alert interface
 */
export interface BackupAlert {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Backup health status
 */
export interface BackupHealth {
  healthy: boolean;
  lastBackup?: Date;
  totalBackups: number;
  storageUsed: number; // bytes
  storageAvailable: number; // bytes
  failedBackups: number;
  alerts: BackupAlert[];
}

/**
 * Backup Monitoring Configuration
 */
const MONITORING_CONFIG = {
  // Alert thresholds
  maxBackupAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  storageWarningThreshold: 0.8, // 80% full
  storageCriticalThreshold: 0.9, // 90% full

  // Notification settings
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  emailAlerts: process.env.BACKUP_ALERT_EMAIL || 'admin@sanduta.art',

  // Check intervals
  healthCheckInterval: 60 * 60 * 1000, // 1 hour
  integrityCheckInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Backup Monitoring Class
 */
export class BackupMonitoring {
  /**
   * Check backup health
   */
  static async checkHealth(): Promise<BackupHealth> {
    logger.info('BackupMonitoring', 'Checking backup health');

    const alerts: BackupAlert[] = [];

    try {
      // Get all backups
      const backups = await BackupEngine.listBackups();

      // Calculate stats
      const totalBackups = backups.length;
      const failedBackups = backups.filter(
        (b) => b.status === BackupStatus.FAILED
      ).length;

      const lastBackup = backups[0]?.createdAt;

      // Check last backup age
      if (lastBackup) {
        const age = Date.now() - new Date(lastBackup).getTime();
        if (age > MONITORING_CONFIG.maxBackupAge) {
          alerts.push({
            type: AlertType.NO_RECENT_BACKUP,
            severity: AlertSeverity.CRITICAL,
            message: `No backup in the last ${MONITORING_CONFIG.maxBackupAge / (60 * 60 * 1000)} hours`,
            details: { lastBackup, age },
            timestamp: new Date(),
          });
        }
      } else {
        alerts.push({
          type: AlertType.NO_RECENT_BACKUP,
          severity: AlertSeverity.CRITICAL,
          message: 'No backups found',
          details: {},
          timestamp: new Date(),
        });
      }

      // Check failed backups
      if (failedBackups > 0) {
        alerts.push({
          type: AlertType.BACKUP_FAILED,
          severity: AlertSeverity.WARNING,
          message: `${failedBackups} backup(s) failed`,
          details: { failedBackups },
          timestamp: new Date(),
        });
      }

      // Check storage usage
      const { storageUsed, storageAvailable } = await this.getStorageInfo();
      const storageUsagePercent = storageUsed / (storageUsed + storageAvailable);

      if (storageUsagePercent > MONITORING_CONFIG.storageCriticalThreshold) {
        alerts.push({
          type: AlertType.STORAGE_LOW,
          severity: AlertSeverity.CRITICAL,
          message: `Backup storage critically low: ${(storageUsagePercent * 100).toFixed(1)}% full`,
          details: { storageUsed, storageAvailable, storageUsagePercent },
          timestamp: new Date(),
        });
      } else if (storageUsagePercent > MONITORING_CONFIG.storageWarningThreshold) {
        alerts.push({
          type: AlertType.STORAGE_LOW,
          severity: AlertSeverity.WARNING,
          message: `Backup storage usage high: ${(storageUsagePercent * 100).toFixed(1)}% full`,
          details: { storageUsed, storageAvailable, storageUsagePercent },
          timestamp: new Date(),
        });
      }

      const health: BackupHealth = {
        healthy: alerts.filter((a) => a.severity === AlertSeverity.CRITICAL).length === 0,
        lastBackup: lastBackup ? new Date(lastBackup) : undefined,
        totalBackups,
        storageUsed,
        storageAvailable,
        failedBackups,
        alerts,
      };

      // Send alerts if any critical issues
      if (alerts.length > 0) {
        await this.sendAlerts(alerts);
      }

      logger.info('BackupMonitoring', 'Health check completed', {
        healthy: health.healthy,
        alerts: alerts.length,
      });

      return health;
    } catch (error) {
      logger.error('BackupMonitoring', 'Health check failed', { error });

      return {
        healthy: false,
        totalBackups: 0,
        storageUsed: 0,
        storageAvailable: 0,
        failedBackups: 0,
        alerts: [
          {
            type: AlertType.BACKUP_FAILED,
            severity: AlertSeverity.CRITICAL,
            message: 'Backup health check failed',
            details: { error },
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Verify backup integrity
   */
  static async verifyIntegrity(backupId: string): Promise<boolean> {
    logger.info('BackupMonitoring', 'Verifying backup integrity', { backupId });

    try {
      // Test restore (dry run)
      const isValid = await RestoreEngine.testRestore(backupId);

      if (!isValid) {
        await this.sendAlerts([
          {
            type: AlertType.BACKUP_CORRUPTION,
            severity: AlertSeverity.CRITICAL,
            message: `Backup integrity check failed: ${backupId}`,
            details: { backupId },
            timestamp: new Date(),
          },
        ]);
      }

      logger.info('BackupMonitoring', 'Integrity check completed', {
        backupId,
        isValid,
      });

      return isValid;
    } catch (error) {
      logger.error('BackupMonitoring', 'Integrity check failed', { error, backupId });
      return false;
    }
  }

  /**
   * Verify all recent backups integrity
   */
  static async verifyAllBackups(): Promise<{ total: number; valid: number; invalid: number }> {
    logger.info('BackupMonitoring', 'Verifying all backups');

    const backups = await BackupEngine.listBackups();
    let valid = 0;
    let invalid = 0;

    for (const backup of backups) {
      const isValid = await this.verifyIntegrity(backup.id);
      if (isValid) {
        valid++;
      } else {
        invalid++;
      }
    }

    logger.info('BackupMonitoring', 'All backups verified', {
      total: backups.length,
      valid,
      invalid,
    });

    return { total: backups.length, valid, invalid };
  }

  /**
   * Get storage information
   */
  static async getStorageInfo(): Promise<{ storageUsed: number; storageAvailable: number }> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      // Get disk usage for backup directory
      const { stdout } = await execAsync('df -B1 /backups | tail -1');
      const parts = stdout.trim().split(/\s+/);

      const storageUsed = parseInt(parts[2], 10);
      const storageAvailable = parseInt(parts[3], 10);

      return { storageUsed, storageAvailable };
    } catch (error) {
      logger.error('BackupMonitoring', 'Failed to get storage info', { error });
      return { storageUsed: 0, storageAvailable: 0 };
    }
  }

  /**
   * Send alerts via Slack/Email
   */
  static async sendAlerts(alerts: BackupAlert[]): Promise<void> {
    logger.info('BackupMonitoring', 'Sending alerts', { count: alerts.length });

    // Send to Slack
    if (MONITORING_CONFIG.slackWebhookUrl) {
      try {
        await this.sendSlackAlert(alerts);
      } catch (error) {
        logger.error('BackupMonitoring', 'Failed to send Slack alert', { error });
      }
    }

    // Send email (if configured)
    // TODO: Implement email alerts
    // await this.sendEmailAlert(alerts);
  }

  /**
   * Send Slack alert
   */
  private static async sendSlackAlert(alerts: BackupAlert[]): Promise<void> {
    const criticalAlerts = alerts.filter((a) => a.severity === AlertSeverity.CRITICAL);
    const warningAlerts = alerts.filter((a) => a.severity === AlertSeverity.WARNING);

    const message = {
      text: '🚨 Backup System Alert',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 Backup System Alert',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Critical Issues:* ${criticalAlerts.length}\n*Warnings:* ${warningAlerts.length}`,
          },
        },
        {
          type: 'divider',
        },
        ...alerts.slice(0, 5).map((alert) => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${alert.severity === AlertSeverity.CRITICAL ? '🔴' : '⚠️'} ${alert.type}*\n${alert.message}`,
          },
        })),
      ],
    };

    await fetch(MONITORING_CONFIG.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    logger.info('BackupMonitoring', 'Slack alert sent');
  }

  /**
   * Generate weekly backup report
   */
  static async generateWeeklyReport(): Promise<string> {
    logger.info('BackupMonitoring', 'Generating weekly report');

    const backups = await BackupEngine.listBackups();
    const health = await this.checkHealth();

    // Get backups from last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentBackups = backups.filter(
      (b) => new Date(b.createdAt).getTime() > sevenDaysAgo
    );

    const totalSize = recentBackups.reduce((sum, b) => sum + b.size, 0);
    const avgSize = recentBackups.length > 0 ? totalSize / recentBackups.length : 0;

    const report = `
# Backup Weekly Report
**Generated:** ${new Date().toISOString()}

## Summary
- **Total Backups:** ${backups.length}
- **Backups Last 7 Days:** ${recentBackups.length}
- **System Health:** ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}
- **Failed Backups:** ${health.failedBackups}

## Storage
- **Used:** ${(health.storageUsed / 1024 / 1024 / 1024).toFixed(2)} GB
- **Available:** ${(health.storageAvailable / 1024 / 1024 / 1024).toFixed(2)} GB
- **Usage:** ${((health.storageUsed / (health.storageUsed + health.storageAvailable)) * 100).toFixed(1)}%

## Recent Backups (Last 7 Days)
- **Count:** ${recentBackups.length}
- **Total Size:** ${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB
- **Average Size:** ${(avgSize / 1024 / 1024 / 1024).toFixed(2)} GB

## Alerts
${health.alerts.length > 0 ? health.alerts.map((a) => `- [${a.severity}] ${a.message}`).join('\n') : 'No alerts'}

## Recommendations
${health.alerts.filter((a) => a.severity === AlertSeverity.CRITICAL).length > 0 ? '- ⚠️ Address critical alerts immediately' : ''}
${health.storageUsed / (health.storageUsed + health.storageAvailable) > 0.8 ? '- 💾 Consider expanding backup storage' : ''}
${health.failedBackups > 0 ? '- 🔍 Investigate failed backups' : ''}
${!health.lastBackup || Date.now() - new Date(health.lastBackup).getTime() > 24 * 60 * 60 * 1000 ? '- ⏰ Schedule backup immediately' : ''}
`;

    logger.info('BackupMonitoring', 'Weekly report generated');

    return report;
  }
}

/**
 * Singleton instance
 */
export const backupMonitoring = BackupMonitoring;
