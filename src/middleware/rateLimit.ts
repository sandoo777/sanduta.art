/**
 * Rate Limiting Middleware
 * Protect API endpoints from abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/modules/cache/useRedis';
import { logger } from '@/lib/logger';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requests: number; // Number of requests allowed
  window: number; // Time window in seconds
  message?: string;
}

/**
 * Rate limit presets
 */
export const RateLimits = {
  // Public API endpoints
  public: {
    requests: 60,
    window: 60, // 60 requests per minute
    message: 'Too many requests from this IP, please try again later.',
  },

  // Admin API endpoints
  admin: {
    requests: 300,
    window: 60, // 300 requests per minute
    message: 'Admin rate limit exceeded.',
  },

  // Login attempts
  login: {
    requests: 5,
    window: 60, // 5 attempts per minute
    message: 'Too many login attempts, please try again later.',
  },

  // Checkout operations
  checkout: {
    requests: 20,
    window: 60, // 20 requests per minute
    message: 'Too many checkout requests, please slow down.',
  },

  // Editor operations
  editor: {
    requests: 100,
    window: 60, // 100 requests per minute
    message: 'Editor rate limit exceeded.',
  },

  // Report generation
  reports: {
    requests: 10,
    window: 60, // 10 reports per minute
    message: 'Too many report requests, please wait.',
  },
};

/**
 * Get client identifier (IP or user ID)
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get user ID from auth
  const userId = req.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  // Fall back to IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Check rate limit
 */
export async function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}> {
  const clientId = identifier || getClientIdentifier(req);
  const endpoint = new URL(req.url).pathname;
  const key = `ratelimit:${clientId}:${endpoint}`;

  // If Redis is not available, allow all requests
  if (!redisCache.isAvailable()) {
    return {
      allowed: true,
      remaining: config.requests,
      reset: Date.now() + config.window * 1000,
      limit: config.requests,
    };
  }

  try {
    // Increment counter
    const count = await redisCache.incr(key, config.window);

    const allowed = count <= config.requests;
    const remaining = Math.max(0, config.requests - count);
    const reset = Date.now() + config.window * 1000;

    // Log if rate limited
    if (!allowed) {
      logger.warn('RateLimit', 'Rate limit exceeded', {
        clientId,
        endpoint,
        count,
        limit: config.requests,
      });
    }

    return {
      allowed,
      remaining,
      reset,
      limit: config.requests,
    };
  } catch (_error) {
    logger.error('RateLimit', 'Rate limit check error', { error });
    // On error, allow the request
    return {
      allowed: true,
      remaining: config.requests,
      reset: Date.now() + config.window * 1000,
      limit: config.requests,
    };
  }
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Check rate limit
    const { allowed, remaining, reset, limit } = await checkRateLimit(
      req,
      config
    );

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(limit));
    headers.set('X-RateLimit-Remaining', String(remaining));
    headers.set('X-RateLimit-Reset', String(Math.floor(reset / 1000)));

    // If rate limited, return 429
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            ...Object.fromEntries(headers.entries()),
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }

    // Execute handler
    const response = await handler(req);

    // Add rate limit headers to response
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Create rate limited API route
 */
export function createRateLimitedRoute(
  config: RateLimitConfig
): {
  GET?: (req: NextRequest) => Promise<NextResponse>;
  POST?: (req: NextRequest) => Promise<NextResponse>;
  PUT?: (req: NextRequest) => Promise<NextResponse>;
  DELETE?: (req: NextRequest) => Promise<NextResponse>;
} {
  return {
    GET: async (req: NextRequest) =>
      withRateLimit(config, async () => {
        return NextResponse.json({ error: 'Method not implemented' }, { status: 501 });
      })(req),
  };
}

/**
 * Global rate limiter for all API routes
 */
export async function globalRateLimit(
  req: NextRequest
): Promise<NextResponse | null> {
  const pathname = new URL(req.url).pathname;

  // Determine rate limit based on path
  let config: RateLimitConfig = RateLimits.public;

  if (pathname.startsWith('/api/admin')) {
    config = RateLimits.admin;
  } else if (pathname.includes('/auth/signin') || pathname.includes('/auth/login')) {
    config = RateLimits.login;
  } else if (pathname.includes('/checkout')) {
    config = RateLimits.checkout;
  } else if (pathname.includes('/editor')) {
    config = RateLimits.editor;
  } else if (pathname.includes('/reports')) {
    config = RateLimits.reports;
  }

  // Check rate limit
  const { allowed, remaining, reset, limit } = await checkRateLimit(req, config);

  // Add headers
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', String(limit));
  headers.set('X-RateLimit-Remaining', String(remaining));
  headers.set('X-RateLimit-Reset', String(Math.floor(reset / 1000)));

  // If rate limited, return 429
  if (!allowed) {
    return new NextResponse(
      JSON.stringify({
        error: config.message || 'Too many requests',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers.entries()),
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null; // Continue to route handler
}
