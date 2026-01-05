import { NextResponse } from 'next/server';

export function withCache(response: NextResponse, maxAge: number = 3600) {
  response.headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
  return response;
}

export const cacheConfig = {
  revalidate: 3600, // 1 hour
};

export const noCacheConfig = {
  revalidate: 0,
};

/**
 * In-memory cache pentru optimizare server-side
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    Array.from(this.cache.keys()).forEach((key) => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const memoryCache = new InMemoryCache();

// Helper pentru caching automat
export async function withMemoryCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = memoryCache.get<T>(key);
  if (cached !== null) return cached;

  const data = await fn();
  memoryCache.set(key, data, ttlSeconds);
  return data;
}

// Cache keys constants
export const CACHE_KEYS = {
  ADMIN_STATS: 'admin:stats',
  REPORT_SALES: (period: string) => `report:sales:${period}`,
  REPORT_CUSTOMERS: (period: string) => `report:customers:${period}`,
  ORDERS_LIST: (userId: string, page: number) => `orders:${userId}:${page}`,
  PRODUCTS_CATALOG: (categoryId?: string, page?: number) => 
    `products:${categoryId || 'all'}:${page || 1}`,
} as const;

// TTL constants (seconds)
export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 900,
  VERY_LONG: 3600,
} as const;
