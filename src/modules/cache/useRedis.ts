/**
 * Redis Cache Module
 * Using Upstash Redis for distributed caching
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null;


/**
 * Redis Cache Manager
 */
export class RedisCache {
  private client: Redis | null;
  private prefix: string;

  constructor(prefix = 'sanduta') {
    this.client = redis;
    this.prefix = prefix;
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Build cache key with prefix
   */
  private buildKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;

    try {
      const value = await this.client.get<T>(this.buildKey(key));
      return value;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    if (!this.client) return false;

    try {
      const cacheKey = this.buildKey(key);

      if (ttlSeconds) {
        await this.client.setex(cacheKey, ttlSeconds, JSON.stringify(value));
      } else {
        await this.client.set(cacheKey, JSON.stringify(value));
      }

      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.del(this.buildKey(key));
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<number> {
    if (!this.client) return 0;

    try {
      const searchPattern = this.buildKey(pattern);
      const keys = await this.client.keys(searchPattern);

      if (keys.length === 0) return 0;

      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      console.error('Redis invalidate error:', error);
      return 0;
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string, ttlSeconds?: number): Promise<number> {
    if (!this.client) return 0;

    try {
      const cacheKey = this.buildKey(key);
      const value = await this.client.incr(cacheKey);

      if (ttlSeconds && value === 1) {
        await this.client.expire(cacheKey, ttlSeconds);
      }

      return value;
    } catch (error) {
      console.error('Redis incr error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      const result = await this.client.exists(this.buildKey(key));
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get multiple keys
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.client) return keys.map(() => null);

    try {
      const cacheKeys = keys.map((k) => this.buildKey(k));
      const values = await this.client.mget<T[]>(...cacheKeys);
      return values;
    } catch (error) {
      console.error('Redis mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Cache with function wrapper
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result
    await this.set(key, result, ttlSeconds);

    return result;
  }
}

// Singleton instance
export const redisCache = new RedisCache();

/**
 * Predefined cache keys
 */
export const CacheKeys = {
  // Products
  product: (id: string) => `product:${id}`,
  products: (filter: string) => `products:${filter}`,
  productPrice: (id: string) => `price:${id}`,

  // Categories
  category: (id: string) => `category:${id}`,
  categories: () => 'categories:all',

  // Configurator
  configuratorOptions: (productId: string) => `config:options:${productId}`,
  configuratorPrice: (configId: string) => `config:price:${configId}`,

  // Dashboard KPIs
  dashboardKpis: (period: string) => `dashboard:kpis:${period}`,
  salesStats: (period: string) => `stats:sales:${period}`,

  // Reports
  report: (type: string, params: string) => `report:${type}:${params}`,

  // User sessions
  userSession: (userId: string) => `session:${userId}`,

  // Rate limiting
  rateLimit: (ip: string, endpoint: string) => `ratelimit:${ip}:${endpoint}`,
};

/**
 * Cache TTL presets (in seconds)
 */
export const CacheTTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  day: 86400, // 24 hours
  week: 604800, // 7 days
};
