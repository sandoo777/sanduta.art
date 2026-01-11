/**
 * API Optimization Utilities
 * Pagination, field limiting, compression, ETag, caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Extract pagination from request
 */
export function getPaginationFromRequest(
  req: NextRequest,
  defaults: PaginationOptions = {}
): { skip: number; take: number; page: number; limit: number } {
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(
    defaults.maxLimit || 100,
    Math.max(1, parseInt(searchParams.get('limit') || String(defaults.limit || 20)))
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Extract fields to select from request
 */
export function getFieldsFromRequest(req: NextRequest): string[] | undefined {
  const { searchParams } = new URL(req.url);
  const fields = searchParams.get('fields');

  if (!fields) return undefined;

  return fields.split(',').map((f) => f.trim());
}

/**
 * Filter object by fields
 */
export function filterFields<T extends Record<string, unknown>>(
  obj: T,
  fields?: string[]
): Partial<T> {
  if (!fields || fields.length === 0) return obj;

  const filtered: Partial<T> = {};

  fields.forEach((field) => {
    if (field in obj) {
      filtered[field as keyof T] = obj[field as keyof T];
    }
  });

  return filtered;
}

/**
 * Generate ETag for data
 */
export function generateETag(data: unknown): string {
  const hash = createHash('md5');
  hash.update(JSON.stringify(data));
  return `"${hash.digest('hex')}"`;
}

/**
 * Check if request matches ETag
 */
export function checkETag(req: NextRequest, etag: string): boolean {
  const ifNoneMatch = req.headers.get('if-none-match');
  return ifNoneMatch === etag;
}

/**
 * Create optimized JSON response
 */
export function createOptimizedResponse<T>(
  data: T,
  options: {
    status?: number;
    cache?: string;
    etag?: boolean;
    compress?: boolean;
  } = {}
): NextResponse {
  const { status = 200, cache, etag: useETag = true, compress = true } = options;

  // Generate ETag
  const etag = useETag ? generateETag(data) : undefined;

  // Create response
  const response = NextResponse.json(data, { status });

  // Set cache headers
  if (cache) {
    response.headers.set('Cache-Control', cache);
  }

  // Set ETag
  if (etag) {
    response.headers.set('ETag', etag);
  }

  // Set compression hint
  if (compress) {
    response.headers.set('Content-Encoding', 'gzip');
  }

  return response;
}

/**
 * Create 304 Not Modified response
 */
export function createNotModifiedResponse(): NextResponse {
  return new NextResponse(null, {
    status: 304,
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
}

/**
 * API optimization wrapper
 */
export async function optimizeApiRoute<T>(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<T>,
  options: {
    cache?: string;
    etag?: boolean;
    pagination?: boolean;
  } = {}
): Promise<NextResponse> {
  try {
    // Execute handler
    const data = await handler(req);

    // Generate ETag
    const etag = options.etag !== false ? generateETag(data) : undefined;

    // Check if client has cached version
    if (etag && checkETag(req, etag)) {
      return createNotModifiedResponse();
    }

    // Create optimized response
    return createOptimizedResponse(data, {
      cache: options.cache,
      etag: options.etag,
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Cache strategies
 */
export const CacheStrategies = {
  // No caching
  noCache: 'no-cache, no-store, must-revalidate',

  // Short cache (1 minute)
  short: 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',

  // Medium cache (5 minutes)
  medium: 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',

  // Long cache (1 hour)
  long: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',

  // Very long cache (24 hours)
  veryLong: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',

  // Immutable (1 year)
  immutable: 'public, max-age=31536000, immutable',
};
