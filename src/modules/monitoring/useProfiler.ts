/**
 * Performance Profiler
 * Profiles code execution for performance optimization
 * 
 * Features:
 * - Function profiling
 * - Endpoint profiling
 * - Critical path analysis
 * - Call stack tracking
 * - Performance bottleneck detection
 */

import { useLogger, LogCategory } from './useLogger';
import { useMetrics, MetricType } from './useMetrics';

// Profile entry
interface ProfileEntry {
  id: string;
  name: string;
  type: 'function' | 'endpoint' | 'block';
  startTime: number;
  endTime?: number;
  duration?: number;
  parentId?: string;
  children: string[];
  context?: Record<string, any>;
  memoryBefore?: number;
  memoryAfter?: number;
  memoryDelta?: number;
}

// Profile result
interface ProfileResult {
  name: string;
  duration: number;
  calls: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalDuration: number;
  percentage: number;
  children: ProfileResult[];
}

class Profiler {
  private logger = useLogger();
  private metrics = useMetrics();
  private profiles = new Map<string, ProfileEntry>();
  private results: ProfileEntry[] = [];
  private enabled: boolean = process.env.NODE_ENV === 'development';
  private readonly MAX_RESULTS = 10000;

  /**
   * Enable/disable profiler
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Start profiling
   */
  start(
    name: string,
    type: 'function' | 'endpoint' | 'block' = 'function',
    context?: Record<string, any>,
    parentId?: string
  ): string {
    if (!this.enabled) return '';

    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const entry: ProfileEntry = {
      id,
      name,
      type,
      startTime: Date.now(),
      parentId,
      children: [],
      context,
    };

    // Track memory if available
    if (typeof process !== 'undefined' && process.memoryUsage) {
      entry.memoryBefore = process.memoryUsage().heapUsed;
    }

    // Add to parent's children
    if (parentId) {
      const parent = this.profiles.get(parentId);
      if (parent) {
        parent.children.push(id);
      }
    }

    this.profiles.set(id, entry);
    
    return id;
  }

  /**
   * End profiling
   */
  async end(id: string) {
    if (!this.enabled || !id) return 0;

    const entry = this.profiles.get(id);
    if (!entry) return 0;

    entry.endTime = Date.now();
    entry.duration = entry.endTime - entry.startTime;

    // Track memory if available
    if (typeof process !== 'undefined' && process.memoryUsage) {
      entry.memoryAfter = process.memoryUsage().heapUsed;
      if (entry.memoryBefore) {
        entry.memoryDelta = entry.memoryAfter - entry.memoryBefore;
      }
    }

    // Move to results
    this.results.push(entry);
    if (this.results.length > this.MAX_RESULTS) {
      this.results = this.results.slice(-this.MAX_RESULTS);
    }

    this.profiles.delete(id);

    // Log slow operations
    if (entry.duration > 1000) {
      await this.logger.performance(
        LogCategory.SYSTEM,
        `Slow operation: ${entry.name}`,
        entry.duration,
        {
          type: entry.type,
          ...entry.context,
          memoryDelta: entry.memoryDelta,
        }
      );
    }

    return entry.duration;
  }

  /**
   * Profile a function
   */
  async profileFunction<T>(
    name: string,
    fn: () => T | Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const id = this.start(name, 'function', context);
    
    try {
      const result = await fn();
      await this.end(id);
      return result;
    } catch (error) {
      await this.end(id);
      throw error;
    }
  }

  /**
   * Profile an endpoint
   */
  async profileEndpoint<T>(
    endpoint: string,
    method: string,
    fn: () => T | Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const id = this.start(`${method} ${endpoint}`, 'endpoint', context);
    
    try {
      const result = await fn();
      await this.end(id);
      return result;
    } catch (error) {
      await this.end(id);
      throw error;
    }
  }

  /**
   * Get profile results for a specific name
   */
  getProfileResults(name: string): ProfileResult | null {
    const entries = this.results.filter(e => e.name === name && e.duration);
    
    if (entries.length === 0) return null;

    const durations = entries.map(e => e.duration!);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);

    return {
      name,
      duration: totalDuration,
      calls: entries.length,
      averageDuration: totalDuration / entries.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalDuration,
      percentage: 0, // Calculated in getTopProfiles
      children: [],
    };
  }

  /**
   * Get top slowest profiles
   */
  getTopProfiles(limit: number = 20): ProfileResult[] {
    const profilesByName = new Map<string, ProfileEntry[]>();

    for (const entry of this.results) {
      if (!entry.duration) continue;
      
      if (!profilesByName.has(entry.name)) {
        profilesByName.set(entry.name, []);
      }
      profilesByName.get(entry.name)!.push(entry);
    }

    const results: ProfileResult[] = [];
    let totalTime = 0;

    for (const [name, entries] of profilesByName.entries()) {
      const durations = entries.map(e => e.duration!);
      const total = durations.reduce((sum, d) => sum + d, 0);
      totalTime += total;

      results.push({
        name,
        duration: total,
        calls: entries.length,
        averageDuration: total / entries.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        totalDuration: total,
        percentage: 0,
        children: [],
      });
    }

    // Calculate percentages
    for (const result of results) {
      result.percentage = totalTime > 0 ? (result.totalDuration / totalTime) * 100 : 0;
    }

    return results
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, limit);
  }

  /**
   * Get bottlenecks (slowest single operations)
   */
  getBottlenecks(limit: number = 20): Array<{
    name: string;
    duration: number;
    timestamp: string;
    context?: Record<string, any>;
    memoryDelta?: number;
  }> {
    return this.results
      .filter(e => e.duration)
      .sort((a, b) => b.duration! - a.duration!)
      .slice(0, limit)
      .map(e => ({
        name: e.name,
        duration: e.duration!,
        timestamp: new Date(e.startTime).toISOString(),
        context: e.context,
        memoryDelta: e.memoryDelta,
      }));
  }

  /**
   * Get profile tree (hierarchical view)
   */
  getProfileTree(rootId?: string): ProfileResult[] {
    const buildTree = (parentId: string | undefined): ProfileResult[] => {
      const children = this.results.filter(e => e.parentId === parentId && e.duration);
      
      return children.map(entry => ({
        name: entry.name,
        duration: entry.duration!,
        calls: 1,
        averageDuration: entry.duration!,
        minDuration: entry.duration!,
        maxDuration: entry.duration!,
        totalDuration: entry.duration!,
        percentage: 0,
        children: buildTree(entry.id),
      }));
    };

    return buildTree(rootId);
  }

  /**
   * Generate flamegraph data
   */
  generateFlamegraphData(): Array<{
    name: string;
    value: number;
    children?: any[];
  }> {
    const buildFlamegraph = (parentId: string | undefined): any[] => {
      const children = this.results.filter(e => e.parentId === parentId && e.duration);
      
      return children.map(entry => ({
        name: entry.name,
        value: entry.duration,
        children: buildFlamegraph(entry.id),
      }));
    };

    return buildFlamegraph(undefined);
  }

  /**
   * Clear profile results
   */
  clearResults() {
    this.results = [];
  }

  /**
   * Export profile results
   */
  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      topProfiles: this.getTopProfiles(50),
      bottlenecks: this.getBottlenecks(50),
      flamegraph: this.generateFlamegraphData(),
    }, null, 2);
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    averageMemoryDelta: number;
    maxMemoryDelta: number;
    totalMemoryAllocated: number;
    entriesWithMemoryData: number;
  } | null {
    const entriesWithMemory = this.results.filter(e => e.memoryDelta !== undefined);
    
    if (entriesWithMemory.length === 0) return null;

    const deltas = entriesWithMemory.map(e => e.memoryDelta!);
    const total = deltas.reduce((sum, d) => sum + d, 0);

    return {
      averageMemoryDelta: total / deltas.length,
      maxMemoryDelta: Math.max(...deltas),
      totalMemoryAllocated: total,
      entriesWithMemoryData: entriesWithMemory.length,
    };
  }
}

// Singleton instance
let profilerInstance: Profiler | null = null;

/**
 * Get profiler instance
 */
export function useProfiler(): Profiler {
  if (!profilerInstance) {
    profilerInstance = new Profiler();
  }
  return profilerInstance;
}

/**
 * Decorator for profiling methods
 */
export function Profile(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const profileName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const profiler = useProfiler();
      return profiler.profileFunction(profileName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

export default Profiler;
