/**
 * Queue Monitoring Module
 * Tracks job queue performance and health
 * 
 * Features:
 * - Active jobs tracking
 * - Failed jobs monitoring
 * - Processing time metrics
 * - Wait time tracking
 * - Retry count monitoring
 * - Queue health status
 */

import { useLogger, LogCategory } from './useLogger';
import { useMetrics, MetricType } from './useMetrics';

// Job status
export enum JobStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

// Job type
export enum JobType {
  EMAIL = 'email',
  IMAGE_PROCESSING = 'image_processing',
  ORDER_PROCESSING = 'order_processing',
  REPORT_GENERATION = 'report_generation',
  BACKUP = 'backup',
  CLEANUP = 'cleanup',
  NOTIFICATION = 'notification',
}

// Job info
export interface JobInfo {
  id: string;
  type: JobType;
  status: JobStatus;
  data: Record<string, any>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  retryCount: number;
  maxRetries: number;
  error?: string;
  processingTime?: number;
  waitTime?: number;
}

// Queue statistics
export interface QueueStats {
  pending: number;
  active: number;
  completed: number;
  failed: number;
  retrying: number;
  averageProcessingTime: number;
  averageWaitTime: number;
  successRate: number;
}

class QueueMonitor {
  private logger = useLogger();
  private metrics = useMetrics();
  private jobs = new Map<string, JobInfo>();
  private completedJobs: JobInfo[] = [];
  private readonly MAX_COMPLETED_HISTORY = 1000;

  /**
   * Register a new job
   */
  async registerJob(
    id: string,
    type: JobType,
    data: Record<string, any>,
    maxRetries: number = 3
  ): Promise<JobInfo> {
    const job: JobInfo = {
      id,
      type,
      status: JobStatus.PENDING,
      data,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
    };

    this.jobs.set(id, job);

    await this.logger.info(
      LogCategory.QUEUE,
      `Job registered: ${type}`,
      { jobId: id, type, data }
    );

    return job;
  }

  /**
   * Start job processing
   */
  async startJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      await this.logger.warning(
        LogCategory.QUEUE,
        `Cannot start job: not found`,
        { jobId }
      );
      return;
    }

    job.status = JobStatus.ACTIVE;
    job.startedAt = new Date().toISOString();
    job.waitTime = Date.parse(job.startedAt) - Date.parse(job.createdAt);

    await this.logger.info(
      LogCategory.QUEUE,
      `Job started: ${job.type}`,
      { jobId, type: job.type, waitTime: job.waitTime }
    );
  }

  /**
   * Complete job successfully
   */
  async completeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      await this.logger.warning(
        LogCategory.QUEUE,
        `Cannot complete job: not found`,
        { jobId }
      );
      return;
    }

    job.status = JobStatus.COMPLETED;
    job.completedAt = new Date().toISOString();
    
    if (job.startedAt) {
      job.processingTime = Date.parse(job.completedAt) - Date.parse(job.startedAt);
      
      // Record processing time metric
      await this.metrics.recordQueueProcessing(
        job.processingTime,
        job.type,
        { jobId, retryCount: job.retryCount }
      );
    }

    // Move to completed history
    this.completedJobs.push(job);
    if (this.completedJobs.length > this.MAX_COMPLETED_HISTORY) {
      this.completedJobs = this.completedJobs.slice(-this.MAX_COMPLETED_HISTORY);
    }

    this.jobs.delete(jobId);

    await this.logger.info(
      LogCategory.QUEUE,
      `Job completed: ${job.type}`,
      {
        jobId,
        type: job.type,
        processingTime: job.processingTime,
        waitTime: job.waitTime,
        retryCount: job.retryCount,
      }
    );
  }

  /**
   * Fail job
   */
  async failJob(jobId: string, error: Error): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      await this.logger.warning(
        LogCategory.QUEUE,
        `Cannot fail job: not found`,
        { jobId }
      );
      return;
    }

    job.failedAt = new Date().toISOString();
    job.error = error.message;

    // Check if we should retry
    if (job.retryCount < job.maxRetries) {
      job.status = JobStatus.RETRYING;
      job.retryCount++;

      await this.logger.warning(
        LogCategory.QUEUE,
        `Job failed, retrying: ${job.type}`,
        {
          jobId,
          type: job.type,
          error: error.message,
          retryCount: job.retryCount,
          maxRetries: job.maxRetries,
        }
      );
    } else {
      job.status = JobStatus.FAILED;

      // Move to completed history
      this.completedJobs.push(job);
      if (this.completedJobs.length > this.MAX_COMPLETED_HISTORY) {
        this.completedJobs = this.completedJobs.slice(-this.MAX_COMPLETED_HISTORY);
      }

      this.jobs.delete(jobId);

      await this.logger.error(
        LogCategory.QUEUE,
        `Job permanently failed: ${job.type}`,
        error,
        {
          jobId,
          type: job.type,
          retryCount: job.retryCount,
          maxRetries: job.maxRetries,
        }
      );
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): JobInfo | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs by status
   */
  getJobsByStatus(status: JobStatus): JobInfo[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  /**
   * Get all jobs by type
   */
  getJobsByType(type: JobType): JobInfo[] {
    return Array.from(this.jobs.values()).filter(job => job.type === type);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const allJobs = Array.from(this.jobs.values());
    
    const pending = allJobs.filter(j => j.status === JobStatus.PENDING).length;
    const active = allJobs.filter(j => j.status === JobStatus.ACTIVE).length;
    const retrying = allJobs.filter(j => j.status === JobStatus.RETRYING).length;
    
    const completed = this.completedJobs.filter(j => j.status === JobStatus.COMPLETED).length;
    const failed = this.completedJobs.filter(j => j.status === JobStatus.FAILED).length;

    // Calculate averages from completed jobs
    const jobsWithProcessingTime = this.completedJobs.filter(j => j.processingTime);
    const averageProcessingTime = jobsWithProcessingTime.length > 0
      ? jobsWithProcessingTime.reduce((sum, j) => sum + (j.processingTime || 0), 0) / jobsWithProcessingTime.length
      : 0;

    const jobsWithWaitTime = this.completedJobs.filter(j => j.waitTime);
    const averageWaitTime = jobsWithWaitTime.length > 0
      ? jobsWithWaitTime.reduce((sum, j) => sum + (j.waitTime || 0), 0) / jobsWithWaitTime.length
      : 0;

    const total = completed + failed;
    const successRate = total > 0 ? completed / total : 1;

    return {
      pending,
      active,
      completed,
      failed,
      retrying,
      averageProcessingTime,
      averageWaitTime,
      successRate,
    };
  }

  /**
   * Get failed jobs
   */
  getFailedJobs(limit: number = 50): JobInfo[] {
    return this.completedJobs
      .filter(j => j.status === JobStatus.FAILED)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get slow jobs
   */
  getSlowJobs(thresholdMs: number = 5000, limit: number = 50): JobInfo[] {
    return this.completedJobs
      .filter(j => j.processingTime && j.processingTime > thresholdMs)
      .sort((a, b) => (b.processingTime || 0) - (a.processingTime || 0))
      .slice(0, limit);
  }

  /**
   * Get jobs with high retry count
   */
  getHighRetryJobs(minRetries: number = 2): JobInfo[] {
    return Array.from(this.jobs.values())
      .filter(j => j.retryCount >= minRetries)
      .sort((a, b) => b.retryCount - a.retryCount);
  }

  /**
   * Get queue health status
   */
  async getHealthStatus(): Promise<{
    healthy: boolean;
    issues: string[];
    stats: QueueStats;
  }> {
    const stats = this.getStats();
    const issues: string[] = [];
    let healthy = true;

    // Check for too many pending jobs
    if (stats.pending > 100) {
      issues.push(`High number of pending jobs: ${stats.pending}`);
      healthy = false;
    }

    // Check for too many active jobs (might indicate stuck jobs)
    if (stats.active > 50) {
      issues.push(`High number of active jobs: ${stats.active}`);
      healthy = false;
    }

    // Check for too many failed jobs
    if (stats.failed > 10) {
      issues.push(`High number of failed jobs: ${stats.failed}`);
      healthy = false;
    }

    // Check success rate
    if (stats.successRate < 0.9) {
      issues.push(`Low success rate: ${(stats.successRate * 100).toFixed(1)}%`);
      healthy = false;
    }

    // Check average processing time
    if (stats.averageProcessingTime > 10000) {
      issues.push(`High average processing time: ${stats.averageProcessingTime}ms`);
      healthy = false;
    }

    // Check average wait time
    if (stats.averageWaitTime > 30000) {
      issues.push(`High average wait time: ${stats.averageWaitTime}ms`);
      healthy = false;
    }

    if (!healthy) {
      await this.logger.warning(
        LogCategory.QUEUE,
        'Queue health check failed',
        { issues, stats }
      );
    }

    return {
      healthy,
      issues,
      stats,
    };
  }

  /**
   * Clear old completed jobs
   */
  clearOldJobs(olderThanMs: number = 86400000): void {
    const cutoff = Date.now() - olderThanMs;
    this.completedJobs = this.completedJobs.filter(
      job => Date.parse(job.completedAt || job.failedAt || job.createdAt) > cutoff
    );
  }

  /**
   * Get job statistics by type
   */
  getStatsByType(): Record<JobType, {
    total: number;
    completed: number;
    failed: number;
    averageProcessingTime: number;
  }> {
    const statsByType: Record<string, any> = {};

    for (const type of Object.values(JobType)) {
      const jobs = this.completedJobs.filter(j => j.type === type);
      const completed = jobs.filter(j => j.status === JobStatus.COMPLETED).length;
      const failed = jobs.filter(j => j.status === JobStatus.FAILED).length;
      
      const jobsWithTime = jobs.filter(j => j.processingTime);
      const averageProcessingTime = jobsWithTime.length > 0
        ? jobsWithTime.reduce((sum, j) => sum + (j.processingTime || 0), 0) / jobsWithTime.length
        : 0;

      statsByType[type] = {
        total: jobs.length,
        completed,
        failed,
        averageProcessingTime,
      };
    }

    return statsByType as Record<JobType, any>;
  }
}

// Singleton instance
let queueMonitorInstance: QueueMonitor | null = null;

/**
 * Get queue monitor instance
 */
export function useQueueMonitoring(): QueueMonitor {
  if (!queueMonitorInstance) {
    queueMonitorInstance = new QueueMonitor();
  }
  return queueMonitorInstance;
}

export default QueueMonitor;
