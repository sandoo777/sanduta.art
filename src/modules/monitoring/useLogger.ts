/**
 * Core Logging Engine
 * Provides structured JSON logging with multiple severity levels
 * 
 * Features:
 * - Multiple log levels (info, warning, error, critical, audit, performance, security)
 * - Structured JSON format
 * - Context enrichment (userId, IP, timestamp)
 * - Log aggregation for centralized storage (Logtail, Datadog, Elastic, Grafana Loki)
 * - Performance tracking
 * - Security event logging
 */

import { headers } from 'next/headers';

// Log levels
export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  AUDIT = 'audit',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
}

// Log categories for organization
export enum LogCategory {
  API = 'api',
  AUTH = 'auth',
  ORDERS = 'orders',
  PRODUCTION = 'production',
  EDITOR = 'editor',
  ERRORS = 'errors',
  SECURITY = 'security',
  DATABASE = 'database',
  QUEUE = 'queue',
  SYSTEM = 'system',
}

// Log entry structure
export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  ip?: string;
  timestamp: string;
  environment: string;
  service: string;
  traceId?: string;
  spanId?: string;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

// Configuration for external log services
interface LoggerConfig {
  logtailToken?: string;
  datadogApiKey?: string;
  elasticUrl?: string;
  lokiUrl?: string;
  enableConsole: boolean;
  enableRemote: boolean;
  minLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL_MS = 5000; // 5 seconds

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enableConsole: process.env.NODE_ENV === 'development',
      enableRemote: process.env.NODE_ENV === 'production',
      minLevel: LogLevel.INFO,
      logtailToken: process.env.LOGTAIL_TOKEN,
      datadogApiKey: process.env.DATADOG_API_KEY,
      elasticUrl: process.env.ELASTIC_URL,
      lokiUrl: process.env.LOKI_URL,
      ...config,
    };

    // Start auto-flush in production
    if (this.config.enableRemote && typeof window === 'undefined') {
      this.startAutoFlush();
    }
  }

  /**
   * Get client IP address from headers
   */
  private async getClientIp(): Promise<string | undefined> {
    try {
      const headersList = await headers();
      return (
        headersList.get('x-forwarded-for')?.split(',')[0] ||
        headersList.get('x-real-ip') ||
        undefined
      );
    } catch {
      return undefined;
    }
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, any>,
    userId?: string,
    error?: Error
  ): LogEntry {
    return {
      level,
      category,
      message,
      context,
      userId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'sanduta.art',
      traceId: context?.traceId,
      spanId: context?.spanId,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };
  }

  /**
   * Check if log level should be recorded
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.INFO,
      LogLevel.WARNING,
      LogLevel.ERROR,
      LogLevel.CRITICAL,
      LogLevel.AUDIT,
      LogLevel.PERFORMANCE,
      LogLevel.SECURITY,
    ];
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Write log entry
   */
  private async writeLog(entry: LogEntry) {
    // Console output for development
    if (this.config.enableConsole) {
      const consoleMethod = this.getConsoleMethod(entry.level);
      console[consoleMethod](JSON.stringify(entry, null, 2));
    }

    // Buffer for remote logging
    if (this.config.enableRemote) {
      this.buffer.push(entry);

      // Flush if buffer is full
      if (this.buffer.length >= this.BUFFER_SIZE) {
        await this.flush();
      }
    }
  }

  /**
   * Get appropriate console method for log level
   */
  private getConsoleMethod(level: LogLevel): 'log' | 'warn' | 'error' {
    switch (level) {
      case LogLevel.WARNING:
        return 'warn';
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
      case LogLevel.SECURITY:
        return 'error';
      default:
        return 'log';
    }
  }

  /**
   * Flush logs to remote services
   */
  private async flush() {
    if (this.buffer.length === 0) return;

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      // Send to Logtail
      if (this.config.logtailToken) {
        await this.sendToLogtail(logsToFlush);
      }

      // Send to Datadog
      if (this.config.datadogApiKey) {
        await this.sendToDatadog(logsToFlush);
      }

      // Send to Elastic
      if (this.config.elasticUrl) {
        await this.sendToElastic(logsToFlush);
      }

      // Send to Loki
      if (this.config.lokiUrl) {
        await this.sendToLoki(logsToFlush);
      }
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add logs to buffer for retry
      this.buffer.unshift(...logsToFlush);
    }
  }

  /**
   * Send logs to Logtail
   */
  private async sendToLogtail(logs: LogEntry[]) {
    try {
      await fetch('https://in.logtail.com/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.logtailToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logs),
      });
    } catch (error) {
      console.error('Logtail error:', error);
    }
  }

  /**
   * Send logs to Datadog
   */
  private async sendToDatadog(logs: LogEntry[]) {
    try {
      await fetch('https://http-intake.logs.datadoghq.com/v1/input', {
        method: 'POST',
        headers: {
          'DD-API-KEY': this.config.datadogApiKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logs.map(log => ({
          ddsource: 'sanduta.art',
          ddtags: `env:${log.environment},service:${log.service}`,
          message: log.message,
          ...log,
        }))),
      });
    } catch (error) {
      console.error('Datadog error:', error);
    }
  }

  /**
   * Send logs to Elastic
   */
  private async sendToElastic(logs: LogEntry[]) {
    try {
      const bulkBody = logs.flatMap(log => [
        { index: { _index: 'sanduta-logs' } },
        log,
      ]);

      await fetch(`${this.config.elasticUrl}/_bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-ndjson',
        },
        body: bulkBody.map(item => JSON.stringify(item)).join('\n') + '\n',
      });
    } catch (error) {
      console.error('Elastic error:', error);
    }
  }

  /**
   * Send logs to Grafana Loki
   */
  private async sendToLoki(logs: LogEntry[]) {
    try {
      await fetch(`${this.config.lokiUrl}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streams: [
            {
              stream: {
                service: 'sanduta.art',
                environment: logs[0]?.environment || 'production',
              },
              values: logs.map(log => [
                String(Date.parse(log.timestamp) * 1000000),
                JSON.stringify(log),
              ]),
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Loki error:', error);
    }
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush() {
    if (this.flushInterval) return;

    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Stop auto-flush timer
   */
  public stopAutoFlush() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Log info message
   */
  async info(
    category: LogCategory,
    message: string,
    context?: Record<string, any>,
    userId?: string
  ) {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const ip = await this.getClientIp();
    const entry = this.createLogEntry(
      LogLevel.INFO,
      category,
      message,
      context,
      userId,
      undefined
    );
    entry.ip = ip;

    await this.writeLog(entry);
  }

  /**
   * Log warning message
   */
  async warning(
    category: LogCategory,
    message: string,
    context?: Record<string, any>,
    userId?: string
  ) {
    if (!this.shouldLog(LogLevel.WARNING)) return;

    const ip = await this.getClientIp();
    const entry = this.createLogEntry(
      LogLevel.WARNING,
      category,
      message,
      context,
      userId,
      undefined
    );
    entry.ip = ip;

    await this.writeLog(entry);
  }

  /**
   * Log error message
   */
  async error(
    category: LogCategory,
    message: string,
    error?: Error,
    context?: Record<string, any>,
    userId?: string
  ) {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const ip = await this.getClientIp();
    const entry = this.createLogEntry(
      LogLevel.ERROR,
      category,
      message,
      context,
      userId,
      error
    );
    entry.ip = ip;

    await this.writeLog(entry);
  }

  /**
   * Log critical message
   */
  async critical(
    category: LogCategory,
    message: string,
    error?: Error,
    context?: Record<string, any>,
    userId?: string
  ) {
    if (!this.shouldLog(LogLevel.CRITICAL)) return;

    const ip = await this.getClientIp();
    const entry = this.createLogEntry(
      LogLevel.CRITICAL,
      category,
      message,
      context,
      userId,
      error
    );
    entry.ip = ip;

    await this.writeLog(entry);
    await this.flush(); // Immediate flush for critical errors
  }

  /**
   * Log audit event
   */
  async audit(
    message: string,
    context?: Record<string, any>,
    userId?: string
  ) {
    if (!this.shouldLog(LogLevel.AUDIT)) return;

    const ip = await this.getClientIp();
    const entry = this.createLogEntry(
      LogLevel.AUDIT,
      LogCategory.AUTH,
      message,
      context,
      userId,
      undefined
    );
    entry.ip = ip;

    await this.writeLog(entry);
  }

  /**
   * Log performance metric
   */
  async performance(
    category: LogCategory,
    message: string,
    duration: number,
    context?: Record<string, any>,
    userId?: string
  ) {
    if (!this.shouldLog(LogLevel.PERFORMANCE)) return;

    const ip = await this.getClientIp();
    const entry = this.createLogEntry(
      LogLevel.PERFORMANCE,
      category,
      message,
      { ...context, duration },
      userId,
      undefined
    );
    entry.ip = ip;

    await this.writeLog(entry);
  }

  /**
   * Log security event
   */
  async security(
    message: string,
    context?: Record<string, any>,
    userId?: string
  ) {
    if (!this.shouldLog(LogLevel.SECURITY)) return;

    const ip = await this.getClientIp();
    const entry = this.createLogEntry(
      LogLevel.SECURITY,
      LogCategory.SECURITY,
      message,
      context,
      userId,
      undefined
    );
    entry.ip = ip;

    await this.writeLog(entry);
    await this.flush(); // Immediate flush for security events
  }
}

// Singleton instance
let loggerInstance: Logger | null = null;

/**
 * Get logger instance
 */
export function useLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}

/**
 * React hook for client-side logging
 */
export function useClientLogger() {
  const sendLog = async (
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, any>
  ) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          category,
          message,
          context,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  };

  return {
    info: (category: LogCategory, message: string, context?: Record<string, any>) =>
      sendLog(LogLevel.INFO, category, message, context),
    warning: (category: LogCategory, message: string, context?: Record<string, any>) =>
      sendLog(LogLevel.WARNING, category, message, context),
    error: (category: LogCategory, message: string, context?: Record<string, any>) =>
      sendLog(LogLevel.ERROR, category, message, context),
  };
}

export default Logger;
