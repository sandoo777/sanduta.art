/**
 * Server-side Cache Layer
 * Caching pentru DB queries și API responses
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

class ServerCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private defaultTTL: number;

  constructor(defaultTTL = 60000) {
    // 60 seconds default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    this.cache.set(key, entry as CacheEntry<unknown>);
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate cache by pattern
   */
  invalidate(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number;
    keys: string[];
    memory: number;
  } {
    const keys = Array.from(this.cache.keys());
    return {
      size: this.cache.size,
      keys,
      memory: keys.reduce((acc, key) => {
        const entry = this.cache.get(key);
        return acc + JSON.stringify(entry).length;
      }, 0),
    };
  }

  /**
   * Wrap function with cache
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result
    this.set(key, result, ttl);

    return result;
  }
}

// Singleton instance
export const serverCache = new ServerCache();

/**
 * Cache decorator for functions
 */
export function cached<T>(ttl?: number) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      return serverCache.wrap(cacheKey, () => originalMethod.apply(this, args), ttl);
    };

    return descriptor;
  };
}

/**
 * Helper: Cache database query
 */
export async function cacheQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl = 60000
): Promise<T> {
  return serverCache.wrap(key, queryFn, ttl);
}

/**
 * Helper: Cache API response
 */
export async function cacheApiResponse<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  ttl = 30000
): Promise<T> {
  const cacheKey = `api:${endpoint}`;
  return serverCache.wrap(cacheKey, fetchFn, ttl);
}

/**
 * Helper: Invalidate related caches
 */
export function invalidateCaches(patterns: (string | RegExp)[]): number {
  let total = 0;
  patterns.forEach((pattern) => {
    total += serverCache.invalidate(pattern);
  });
  return total;
}

// Export types
export type { CacheEntry };
