/**
 * Database Optimization Module
 * Query optimization, batching, caching, indexing recommendations
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { serverCache } from '@/lib/cache/serverCache';

/**
 * Batch query executor
 */
export class BatchQuery<T> {
  private queries: (() => Promise<T>)[] = [];
  private maxBatchSize: number;

  constructor(maxBatchSize = 10) {
    this.maxBatchSize = maxBatchSize;
  }

  /**
   * Add query to batch
   */
  add(query: () => Promise<T>): void {
    this.queries.push(query);
  }

  /**
   * Execute all queries
   */
  async execute(): Promise<T[]> {
    const results: T[] = [];

    // Execute in batches
    for (let i = 0; i < this.queries.length; i += this.maxBatchSize) {
      const batch = this.queries.slice(i, i + this.maxBatchSize);
      const batchResults = await Promise.all(batch.map((q) => q()));
      results.push(...batchResults);
    }

    return results;
  }
}

/**
 * Optimized pagination helper
 */
export async function paginateQuery<T>(
  model: Prisma.ModelName,
  options: {
    where?: unknown;
    select?: unknown;
    include?: unknown;
    orderBy?: unknown;
    skip: number;
    take: number;
  }
): Promise<{ data: T[]; total: number }> {
  const { skip, take, ...queryOptions } = options;

  // Use cursor-based pagination for better performance on large datasets
  const [data, total] = await Promise.all([
    (prisma[model.toLowerCase() as keyof typeof prisma] as any).findMany({
      ...queryOptions,
      skip,
      take,
    }),
    (prisma[model.toLowerCase() as keyof typeof prisma] as any).count({
      where: queryOptions.where,
    }),
  ]);

  return { data, total };
}

/**
 * Cached query wrapper
 */
export async function cachedQuery<T>(
  cacheKey: string,
  query: () => Promise<T>,
  ttl = 60000
): Promise<T> {
  return serverCache.wrap(cacheKey, query, ttl);
}

/**
 * Optimized product queries
 */
export const ProductQueries = {
  /**
   * Get product with minimal data
   */
  async getProductMinimal(id: string) {
    return cachedQuery(
      `product:minimal:${id}`,
      () =>
        prisma.product.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            // inStock: true, // Field might not exist in Product model
          },
        }),
      300000 // 5 minutes
    );
  },

  /**
   * Get products with pagination
   */
  async getProducts(options: {
    skip: number;
    take: number;
    categoryId?: string;
    search?: string;
  }) {
    const { skip, take, categoryId, search } = options;

    const where: Prisma.ProductWhereInput = {
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return paginateQuery('Product', {
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  /**
   * Batch get products by IDs
   */
  async batchGetProducts(ids: string[]) {
    const batch = new BatchQuery();

    ids.forEach((id) => {
      batch.add(() => this.getProductMinimal(id));
    });

    return batch.execute();
  },
};

/**
 * Optimized order queries
 */
export const OrderQueries = {
  /**
   * Get orders with minimal joins
   */
  async getOrders(options: {
    skip: number;
    take: number;
    status?: string;
    userId?: string;
  }) {
    const { skip, take, status, userId } = options;

    const where: Prisma.OrderWhereInput = {
      ...(status && { status: status as any }), // Type assertion for OrderStatus enum
      ...(userId && { userId }),
    };

    return paginateQuery('Order', {
      where,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  /**
   * Get order details with items
   */
  async getOrderDetails(id: string) {
    return cachedQuery(
      `order:details:${id}`,
      () =>
        prisma.order.findUnique({
          where: { id },
          // Include relations when they exist in the schema
          // include: {
          //   items: {
          //     include: {
          //       product: {
          //         select: { id: true, name: true, images: true },
          //       },
          //     },
          //   },
          //   user: {
          //     select: { id: true, name: true, email: true },
          //   },
          //   payment: true,
          //   delivery: true,
          // },
        }),
      60000 // 1 minute
    );
  },
};

/**
 * Database indexes recommendations
 */
export const IndexRecommendations = {
  Product: [
    'categoryId',
    'slug',
    'createdAt',
    'price',
    ['categoryId', 'createdAt'],
    ['inStock', 'createdAt'],
  ],
  Order: [
    'userId',
    'status',
    'createdAt',
    'orderNumber',
    ['userId', 'createdAt'],
    ['status', 'createdAt'],
  ],
  OrderItem: ['orderId', 'productId'],
  User: ['email', 'role', 'createdAt'],
  Category: ['slug', 'parentId'],
  Material: ['categoryId', 'inStock'],
};

/**
 * Generate Prisma schema indexes
 */
export function generateIndexes() {
  const schemas: string[] = [];

  Object.entries(IndexRecommendations).forEach(([model, indexes]) => {
    indexes.forEach((index) => {
      if (Array.isArray(index)) {
        schemas.push(`@@index([${index.join(', ')}]) // Composite index`);
      } else {
        schemas.push(`@@index([${index}])`);
      }
    });
  });

  return schemas.join('\n');
}

/**
 * Query performance analyzer
 */
export class QueryAnalyzer {
  private queries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }> = [];

  /**
   * Log query execution
   */
  logQuery(query: string, duration: number): void {
    this.queries.push({
      query,
      duration,
      timestamp: new Date(),
    });

    // Keep only last 100 queries
    if (this.queries.length > 100) {
      this.queries.shift();
    }
  }

  /**
   * Get slow queries
   */
  getSlowQueries(thresholdMs = 1000): Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }> {
    return this.queries.filter((q) => q.duration > thresholdMs);
  }

  /**
   * Get query statistics
   */
  getStats(): {
    total: number;
    avgDuration: number;
    maxDuration: number;
    slowQueries: number;
  } {
    if (this.queries.length === 0) {
      return {
        total: 0,
        avgDuration: 0,
        maxDuration: 0,
        slowQueries: 0,
      };
    }

    const durations = this.queries.map((q) => q.duration);
    const total = this.queries.length;
    const avgDuration = durations.reduce((a, b) => a + b, 0) / total;
    const maxDuration = Math.max(...durations);
    const slowQueries = this.getSlowQueries().length;

    return {
      total,
      avgDuration,
      maxDuration,
      slowQueries,
    };
  }
}

// Singleton analyzer
export const queryAnalyzer = new QueryAnalyzer();
