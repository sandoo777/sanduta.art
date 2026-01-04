// Report Utilities

import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, subDays, format } from "date-fns";

// ───────────────────────────────────────────────────────────────
// DATE RANGE HELPERS
// ───────────────────────────────────────────────────────────────

/**
 * Get start and end of current month
 */
export function getCurrentMonthRange() {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

/**
 * Get start and end of last N months
 */
export function getLastNMonthsRange(n: number) {
  const now = new Date();
  return {
    start: startOfMonth(subMonths(now, n - 1)),
    end: endOfMonth(now),
  };
}

/**
 * Get start and end of last N days
 */
export function getLastNDaysRange(n: number) {
  const now = new Date();
  return {
    start: startOfDay(subDays(now, n - 1)),
    end: endOfDay(now),
  };
}

/**
 * Generate array of month labels for last N months
 */
export function getMonthLabels(n: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    labels.push(format(date, "yyyy-MM"));
  }
  
  return labels;
}

/**
 * Generate array of day labels for last N days
 */
export function getDayLabels(n: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = subDays(now, i);
    labels.push(format(date, "yyyy-MM-dd"));
  }
  
  return labels;
}

// ───────────────────────────────────────────────────────────────
// AGGREGATION HELPERS
// ───────────────────────────────────────────────────────────────

/**
 * Calculate median value
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
}

/**
 * Calculate average value
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Group array by key function
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Calculate completion time in hours
 */
export function calculateCompletionTimeHours(startedAt: Date | null, completedAt: Date | null): number | null {
  if (!startedAt || !completedAt) return null;
  
  const diffMs = completedAt.getTime() - startedAt.getTime();
  return diffMs / (1000 * 60 * 60); // Convert to hours
}

// ───────────────────────────────────────────────────────────────
// CACHE HELPER (Simple in-memory cache for 5 minutes)
// ───────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(): void {
  cache.clear();
}
