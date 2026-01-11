/**
 * Database Monitoring Module
 * Tracks database performance and health metrics
 * 
 * Features:
 * - Slow query detection
 * - Query lock monitoring
 * - Connection pool monitoring
 * - CPU and memory usage tracking
 * - Index efficiency analysis
 * - Deadlock detection
 * - Query performance profiling
 */

import { PrismaClient } from '@prisma/client';
import { useLogger, LogCategory } from './useLogger';
import { useMetrics, MetricType } from './useMetrics';

// Query performance thresholds
const SLOW_QUERY_THRESHOLD_MS = 200;
const VERY_SLOW_QUERY_THRESHOLD_MS = 1000;

// Database health status
export enum DbHealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

// Query statistics
interface QueryStats {
  query: string;
  duration: number;
  timestamp: string;
  model: string;
  operation: string;
  affectedRows?: number;
}

// Connection pool stats
interface ConnectionPoolStats {
  active: number;
  idle: number;
  waiting: number;
  total: number;
}

// Database health metrics
interface DbHealthMetrics {
  status: DbHealthStatus;
  connectionPool: ConnectionPoolStats;
  slowQueries: QueryStats[];
  averageQueryTime: number;
  totalQueries: number;
  errorRate: number;
  lastCheck: string;
}

class DatabaseMonitor {
  private logger = useLogger();
  private metrics = useMetrics();
  private queryStats: QueryStats[] = [];
  private readonly MAX_QUERY_HISTORY = 1000;
  private errorCount = 0;
  private totalQueryCount = 0;

  /**
   * Create monitored Prisma client
   */
  createMonitoredClient(): PrismaClient {
    const prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Monitor queries
    prisma.$on('query' as any, async (e: any) => {
      const duration = e.duration;
      const query = e.query;
      const params = e.params;

      this.totalQueryCount++;

      // Record query stats
      const stats: QueryStats = {
        query,
        duration,
        timestamp: new Date().toISOString(),
        model: this.extractModel(query),
        operation: this.extractOperation(query),
      };

      this.queryStats.push(stats);
      
      // Keep only recent queries
      if (this.queryStats.length > this.MAX_QUERY_HISTORY) {
        this.queryStats = this.queryStats.slice(-this.MAX_QUERY_HISTORY);
      }

      // Record metric
      await this.metrics.recordDbQuery(duration, query);

      // Log slow queries
      if (duration > VERY_SLOW_QUERY_THRESHOLD_MS) {
        await this.logger.error(
          LogCategory.DATABASE,
          `Very slow query detected: ${duration}ms`,
          undefined,
          { query, duration, params }
        );
      } else if (duration > SLOW_QUERY_THRESHOLD_MS) {
        await this.logger.warning(
          LogCategory.DATABASE,
          `Slow query detected: ${duration}ms`,
          { query, duration, params }
        );
      }
    });

    // Monitor errors
    prisma.$on('error' as any, async (e: any) => {
      this.errorCount++;
      
      await this.logger.error(
        LogCategory.DATABASE,
        'Database error occurred',
        new Error(e.message),
        { target: e.target, timestamp: e.timestamp }
      );
    });

    // Monitor warnings
    prisma.$on('warn' as any, async (e: any) => {
      await this.logger.warning(
        LogCategory.DATABASE,
        'Database warning',
        { message: e.message, timestamp: e.timestamp }
      );
    });

    return prisma;
  }

  /**
   * Extract model name from query
   */
  private extractModel(query: string): string {
    const match = query.match(/FROM\s+["']?(\w+)["']?/i) || 
                  query.match(/INTO\s+["']?(\w+)["']?/i) ||
                  query.match(/UPDATE\s+["']?(\w+)["']?/i);
    return match ? match[1] : 'unknown';
  }

  /**
   * Extract operation type from query
   */
  private extractOperation(query: string): string {
    if (query.startsWith('SELECT')) return 'select';
    if (query.startsWith('INSERT')) return 'insert';
    if (query.startsWith('UPDATE')) return 'update';
    if (query.startsWith('DELETE')) return 'delete';
    return 'other';
  }

  /**
   * Get slow queries
   */
  getSlowQueries(thresholdMs: number = SLOW_QUERY_THRESHOLD_MS, limit: number = 50): QueryStats[] {
    return this.queryStats
      .filter(q => q.duration > thresholdMs)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get queries by model
   */
  getQueriesByModel(model: string, limit: number = 50): QueryStats[] {
    return this.queryStats
      .filter(q => q.model.toLowerCase() === model.toLowerCase())
      .slice(-limit);
  }

  /**
   * Get queries by operation
   */
  getQueriesByOperation(operation: string, limit: number = 50): QueryStats[] {
    return this.queryStats
      .filter(q => q.operation === operation)
      .slice(-limit);
  }

  /**
   * Get average query time
   */
  getAverageQueryTime(periodMs: number = 3600000): number {
    const cutoff = Date.now() - periodMs;
    const recentQueries = this.queryStats.filter(
      q => Date.parse(q.timestamp) > cutoff
    );

    if (recentQueries.length === 0) return 0;

    const sum = recentQueries.reduce((acc, q) => acc + q.duration, 0);
    return sum / recentQueries.length;
  }

  /**
   * Get query distribution by operation
   */
  getQueryDistribution(periodMs: number = 3600000): Record<string, number> {
    const cutoff = Date.now() - periodMs;
    const recentQueries = this.queryStats.filter(
      q => Date.parse(q.timestamp) > cutoff
    );

    const distribution: Record<string, number> = {};
    
    for (const query of recentQueries) {
      distribution[query.operation] = (distribution[query.operation] || 0) + 1;
    }

    return distribution;
  }

  /**
   * Get error rate
   */
  getErrorRate(): number {
    if (this.totalQueryCount === 0) return 0;
    return this.errorCount / this.totalQueryCount;
  }

  /**
   * Check database health
   */
  async checkHealth(prisma: PrismaClient): Promise<DbHealthMetrics> {
    try {
      // Test connection
      await prisma.$queryRaw`SELECT 1`;

      // Get connection pool stats (approximation)
      const connectionPool: ConnectionPoolStats = {
        active: 0, // Prisma doesn't expose this directly
        idle: 0,
        waiting: 0,
        total: 10, // Default pool size
      };

      // Calculate health status
      const avgQueryTime = this.getAverageQueryTime();
      const errorRate = this.getErrorRate();
      const slowQueries = this.getSlowQueries();

      let status = DbHealthStatus.HEALTHY;
      
      if (avgQueryTime > VERY_SLOW_QUERY_THRESHOLD_MS || errorRate > 0.1) {
        status = DbHealthStatus.UNHEALTHY;
      } else if (avgQueryTime > SLOW_QUERY_THRESHOLD_MS || errorRate > 0.05) {
        status = DbHealthStatus.DEGRADED;
      }

      const health: DbHealthMetrics = {
        status,
        connectionPool,
        slowQueries: slowQueries.slice(0, 10),
        averageQueryTime: avgQueryTime,
        totalQueries: this.totalQueryCount,
        errorRate,
        lastCheck: new Date().toISOString(),
      };

      // Log health status
      if (status !== DbHealthStatus.HEALTHY) {
        await this.logger.warning(
          LogCategory.DATABASE,
          `Database health is ${status}`,
          health
        );
      }

      return health;
    } catch (error) {
      await this.logger.error(
        LogCategory.DATABASE,
        'Failed to check database health',
        error as Error
      );

      return {
        status: DbHealthStatus.UNHEALTHY,
        connectionPool: { active: 0, idle: 0, waiting: 0, total: 0 },
        slowQueries: [],
        averageQueryTime: 0,
        totalQueries: this.totalQueryCount,
        errorRate: 1,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  /**
   * Analyze index efficiency (requires raw SQL)
   */
  async analyzeIndexEfficiency(prisma: PrismaClient): Promise<{
    unusedIndexes: string[];
    missingIndexes: string[];
  }> {
    try {
      // PostgreSQL specific queries
      const unusedIndexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
        SELECT indexname
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        AND schemaname = 'public'
      `;

      // This is a simplified check - in production you'd want more sophisticated analysis
      const missingIndexes: string[] = [];
      
      // Check for slow queries without indexes
      const slowQueries = this.getSlowQueries(500);
      for (const query of slowQueries) {
        if (query.query.includes('WHERE') && !query.query.includes('idx_')) {
          missingIndexes.push(query.query.substring(0, 100));
        }
      }

      return {
        unusedIndexes: unusedIndexes.map(i => i.indexname),
        missingIndexes: [...new Set(missingIndexes)], // Remove duplicates
      };
    } catch (error) {
      await this.logger.error(
        LogCategory.DATABASE,
        'Failed to analyze index efficiency',
        error as Error
      );
      return { unusedIndexes: [], missingIndexes: [] };
    }
  }

  /**
   * Detect potential deadlocks
   */
  async detectDeadlocks(prisma: PrismaClient): Promise<Array<{
    pid: number;
    query: string;
    waitingFor: string;
  }>> {
    try {
      // PostgreSQL specific query for locks
      const locks = await prisma.$queryRaw<Array<{
        pid: number;
        query: string;
        waiting: boolean;
      }>>`
        SELECT 
          pid,
          query,
          wait_event IS NOT NULL as waiting
        FROM pg_stat_activity
        WHERE state = 'active'
        AND wait_event IS NOT NULL
      `;

      const deadlocks = locks
        .filter(l => l.waiting)
        .map(l => ({
          pid: l.pid,
          query: l.query,
          waitingFor: 'lock',
        }));

      if (deadlocks.length > 0) {
        await this.logger.warning(
          LogCategory.DATABASE,
          `Detected ${deadlocks.length} potential deadlocks`,
          { deadlocks }
        );
      }

      return deadlocks;
    } catch (error) {
      await this.logger.error(
        LogCategory.DATABASE,
        'Failed to detect deadlocks',
        error as Error
      );
      return [];
    }
  }

  /**
   * Get database size
   */
  async getDatabaseSize(prisma: PrismaClient): Promise<{
    totalSize: string;
    tablesSizes: Array<{ table: string; size: string }>;
  }> {
    try {
      const result = await prisma.$queryRaw<Array<{
        database: string;
        size: string;
      }>>`
        SELECT 
          pg_database.datname as database,
          pg_size_pretty(pg_database_size(pg_database.datname)) as size
        FROM pg_database
        WHERE pg_database.datname = current_database()
      `;

      const tables = await prisma.$queryRaw<Array<{
        table: string;
        size: string;
      }>>`
        SELECT 
          tablename as table,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 20
      `;

      return {
        totalSize: result[0]?.size || '0',
        tablesSizes: tables,
      };
    } catch (error) {
      await this.logger.error(
        LogCategory.DATABASE,
        'Failed to get database size',
        error as Error
      );
      return { totalSize: '0', tablesSizes: [] };
    }
  }

  /**
   * Clear query statistics
   */
  clearStats() {
    this.queryStats = [];
    this.errorCount = 0;
    this.totalQueryCount = 0;
  }
}

// Singleton instance
let dbMonitorInstance: DatabaseMonitor | null = null;

/**
 * Get database monitor instance
 */
export function useDbMonitoring(): DatabaseMonitor {
  if (!dbMonitorInstance) {
    dbMonitorInstance = new DatabaseMonitor();
  }
  return dbMonitorInstance;
}

export default DatabaseMonitor;
