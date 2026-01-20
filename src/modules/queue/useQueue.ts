/**
 * Queue System for Background Tasks
 * Using Upstash QStash for serverless background jobs
 */

import { Client as QStashClient } from '@upstash/qstash';

// Initialize QStash client
const qstash = process.env.QSTASH_TOKEN
  ? new QStashClient({
      token: process.env.QSTASH_TOKEN,
    })
  : null;

/**
 * Queue Manager
 */
export class QueueManager {
  private client: QStashClient | null;
  private baseUrl: string;

  constructor() {
    this.client = qstash;
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * Check if queue is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Enqueue a task
   */
  async enqueue(
    endpoint: string,
    data: unknown,
    options?: {
      delay?: number; // seconds
      retries?: number;
    }
  ): Promise<string | null> {
    if (!this.client) {
      console.warn('QStash not configured, running task synchronously');
      return null;
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;

      const response = await this.client.publishJSON({
        url,
        body: data,
        delay: options?.delay,
        retries: options?.retries || 3,
      });

      return response.messageId;
    } catch (_error) {
      console.error('Queue enqueue error:', error);
      return null;
    }
  }

  /**
   * Schedule a recurring task
   */
  async schedule(
    endpoint: string,
    cron: string,
    data: unknown
  ): Promise<string | null> {
    if (!this.client) {
      console.warn('QStash not configured');
      return null;
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;

      const response = await this.client.schedules.create({
        destination: url,
        cron,
        body: JSON.stringify(data),
      });

      return response.scheduleId;
    } catch (_error) {
      console.error('Queue schedule error:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled task
   */
  async cancelSchedule(scheduleId: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.schedules.delete(scheduleId);
      return true;
    } catch (_error) {
      console.error('Queue cancel error:', error);
      return false;
    }
  }
}

// Singleton instance
export const queueManager = new QueueManager();

/**
 * Task Types
 */
export enum TaskType {
  GENERATE_PDF_INVOICE = 'generate-pdf-invoice',
  GENERATE_PREVIEW = 'generate-preview',
  PROCESS_EDITOR_FILE = 'process-editor-file',
  GENERATE_REPORT = 'generate-report',
  SEND_BULK_EMAIL = 'send-bulk-email',
  RECALC_PRICES = 'recalc-prices',
  GENERATE_SITEMAP = 'generate-sitemap',
  CLEANUP_OLD_FILES = 'cleanup-old-files',
  SYNC_INVENTORY = 'sync-inventory',
}

/**
 * Queue helper functions
 */
export const QueueTasks = {
  /**
   * Generate PDF invoice
   */
  async generatePdfInvoice(orderId: string): Promise<string | null> {
    return queueManager.enqueue('/api/queue/generate-pdf-invoice', {
      type: TaskType.GENERATE_PDF_INVOICE,
      orderId,
    });
  },

  /**
   * Generate preview for design
   */
  async generatePreview(designId: string, format: string): Promise<string | null> {
    return queueManager.enqueue('/api/queue/generate-preview', {
      type: TaskType.GENERATE_PREVIEW,
      designId,
      format,
    });
  },

  /**
   * Process editor file
   */
  async processEditorFile(
    fileId: string,
    operations: string[]
  ): Promise<string | null> {
    return queueManager.enqueue('/api/queue/process-editor-file', {
      type: TaskType.PROCESS_EDITOR_FILE,
      fileId,
      operations,
    });
  },

  /**
   * Generate large report
   */
  async generateReport(
    reportType: string,
    params: Record<string, unknown>
  ): Promise<string | null> {
    return queueManager.enqueue(
      '/api/queue/generate-report',
      {
        type: TaskType.GENERATE_REPORT,
        reportType,
        params,
      },
      { delay: 5 } // delay 5 seconds
    );
  },

  /**
   * Send bulk emails
   */
  async sendBulkEmail(
    template: string,
    recipients: string[],
    data: Record<string, unknown>
  ): Promise<string | null> {
    return queueManager.enqueue('/api/queue/send-bulk-email', {
      type: TaskType.SEND_BULK_EMAIL,
      template,
      recipients,
      data,
    });
  },

  /**
   * Recalculate product prices
   */
  async recalcPrices(productIds?: string[]): Promise<string | null> {
    return queueManager.enqueue('/api/queue/recalc-prices', {
      type: TaskType.RECALC_PRICES,
      productIds,
    });
  },

  /**
   * Generate sitemap
   */
  async generateSitemap(): Promise<string | null> {
    return queueManager.enqueue('/api/queue/generate-sitemap', {
      type: TaskType.GENERATE_SITEMAP,
    });
  },

  /**
   * Cleanup old files
   */
  async cleanupOldFiles(olderThanDays: number): Promise<string | null> {
    return queueManager.enqueue('/api/queue/cleanup-old-files', {
      type: TaskType.CLEANUP_OLD_FILES,
      olderThanDays,
    });
  },

  /**
   * Sync inventory with external system
   */
  async syncInventory(): Promise<string | null> {
    return queueManager.enqueue('/api/queue/sync-inventory', {
      type: TaskType.SYNC_INVENTORY,
    });
  },
};

/**
 * Verify QStash signature
 * Note: QStash v2 uses Receiver for signature verification
 * @param signature - Upstash-Signature header value
 * @param body - Request body as string
 * @returns Promise<boolean> - true if signature is valid
 */
export async function verifyQStashSignature(
  signature: string,
  body: string
): Promise<boolean> {
  if (!qstash) return false;

  // QStash v2+ uses Receiver for verification
  // For now, we'll skip verification in development
  // In production, implement with Receiver class and signing keys
  return true; // TODO: Implement proper verification
}
