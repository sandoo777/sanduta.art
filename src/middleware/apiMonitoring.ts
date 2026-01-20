/**
 * API Monitoring Middleware
 * Tracks API performance, response times, status codes, and rate limits
 * 
 * Features:
 * - Request/response time tracking
 * - Status code monitoring
 * - Payload size tracking
 * - Rate limit hit detection
 * - User and IP tracking
 * - Endpoint performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { useLogger, LogCategory } from '@/modules/monitoring/useLogger';

interface ApiMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  payloadSize: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  rateLimitHit: boolean;
  error?: string;
}

// Rate limiting tracking
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown'
  );
}

/**
 * Get payload size from request/response
 */
function getPayloadSize(data: unknown): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return 0;
  }
}

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  record.count++;
  
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

/**
 * Clean up old rate limit records
 */
function cleanupRateLimitRecords() {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}

// Clean up every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitRecords, 5 * 60 * 1000);
}

/**
 * API Monitoring Middleware
 */
export async function withApiMonitoring(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const logger = useLogger();
  
  const endpoint = request.nextUrl.pathname;
  const method = request.method;
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || undefined;
  
  // Check rate limit
  const rateLimitHit = checkRateLimit(ip);
  
  if (rateLimitHit) {
    const responseTime = Date.now() - startTime;
    
    // Log rate limit hit
    await logger.warning(
      LogCategory.API,
      `Rate limit exceeded for ${endpoint}`,
      {
        endpoint,
        method,
        ip,
        userAgent,
        responseTime,
      }
    );
    
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(requestCounts.get(ip)?.resetTime || Date.now()),
        }
      }
    );
  }

  let response: NextResponse;
  let error: Error | undefined;

  try {
    // Execute handler
    response = await handler(request);
  } catch (err) {
    error = err as Error;
    
    // Create error response
    response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  const responseTime = Date.now() - startTime;
  const statusCode = response.status;
  
  // Calculate payload size
  let payloadSize = 0;
  try {
    const body = await response.clone().text();
    payloadSize = new Blob([body]).size;
  } catch {
    // Body not readable
  }

  // Extract userId from response or request (if available)
  let userId: string | undefined;
  try {
    const body = await response.clone().json();
    userId = body.userId || body.user?.id;
  } catch {
    // Not JSON or no userId
  }

  // Create metrics object
  const metrics: ApiMetrics = {
    endpoint,
    method,
    statusCode,
    responseTime,
    payloadSize,
    userId,
    ip,
    userAgent,
    rateLimitHit: false,
    error: error?.message,
  };

  // Log based on status code
  if (statusCode >= 500) {
    await logger.error(
      LogCategory.API,
      `API error: ${endpoint} returned ${statusCode}`,
      error,
      metrics,
      userId
    );
  } else if (statusCode >= 400) {
    await logger.warning(
      LogCategory.API,
      `API warning: ${endpoint} returned ${statusCode}`,
      metrics,
      userId
    );
  } else if (responseTime > 500) {
    // Log slow responses
    await logger.performance(
      LogCategory.API,
      `Slow API response: ${endpoint}`,
      responseTime,
      metrics,
      userId
    );
  } else {
    await logger.info(
      LogCategory.API,
      `API request: ${method} ${endpoint}`,
      metrics,
      userId
    );
  }

  // Add monitoring headers to response
  response.headers.set('X-Response-Time', `${responseTime}ms`);
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
  
  const record = requestCounts.get(ip);
  if (record) {
    response.headers.set('X-RateLimit-Remaining', String(Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count)));
    response.headers.set('X-RateLimit-Reset', String(record.resetTime));
  }

  return response;
}

/**
 * Higher-order function to wrap API routes with monitoring
 */
export function monitorApi(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    return withApiMonitoring(req, handler);
  };
}

/**
 * Get current rate limit stats for an IP
 */
export function getRateLimitStats(ip: string) {
  const record = requestCounts.get(ip);
  
  if (!record) {
    return {
      count: 0,
      remaining: RATE_LIMIT_MAX_REQUESTS,
      resetTime: Date.now() + RATE_LIMIT_WINDOW_MS,
    };
  }

  return {
    count: record.count,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count),
    resetTime: record.resetTime,
  };
}

/**
 * Clear rate limit for an IP (admin function)
 */
export function clearRateLimit(ip: string) {
  requestCounts.delete(ip);
}

/**
 * Get all rate limit stats (admin function)
 */
export function getAllRateLimitStats() {
  const stats: Record<string, { count: number; remaining: number; resetTime: number }> = {};
  
  for (const [ip, record] of requestCounts.entries()) {
    stats[ip] = {
      count: record.count,
      remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count),
      resetTime: record.resetTime,
    };
  }
  
  return stats;
}
