/**
 * Security Middleware
 * Comprehensive security headers, rate limiting, and request validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Security headers configuration
 */
const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.upstash.io https://api.cloudinary.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
  ].join(', '),

  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Suspicious patterns in requests
 */
const SUSPICIOUS_PATTERNS = [
  /(\.\.|\/etc\/|\/var\/|\/proc\/)/i, // Path traversal
  /(union.*select|insert.*into|delete.*from|drop.*table)/i, // SQL injection
  /(<script|javascript:|onerror=|onclick=)/i, // XSS
  /(exec\(|eval\(|system\(|passthru\()/i, // Code injection
  /(\$\{|<%=|<\?php)/i, // Template injection
];

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = new Headers(response.headers);

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  }) as NextResponse;
}

/**
 * Check for suspicious patterns in request
 */
export function detectSuspiciousRequest(req: NextRequest): boolean {
  const url = req.url;
  const userAgent = req.headers.get('user-agent') || '';

  // Check URL for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      logger.warn('SecurityMiddleware', 'Suspicious pattern detected in URL', {
        url,
        pattern: pattern.source,
        userAgent,
      });
      return true;
    }
  }

  // Check query parameters
  const searchParams = req.nextUrl.searchParams;
  for (const [key, value] of searchParams.entries()) {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(value)) {
        logger.warn('SecurityMiddleware', 'Suspicious pattern detected in query param', {
          param: key,
          value,
          pattern: pattern.source,
        });
        return true;
      }
    }
  }

  return false;
}

/**
 * Validate User-Agent header
 */
export function validateUserAgent(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent');

  // Block requests without User-Agent (potential bots)
  if (!userAgent || userAgent.trim() === '') {
    logger.warn('SecurityMiddleware', 'Request without User-Agent blocked', {
      url: req.url,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    });
    return false;
  }

  // Block suspicious User-Agents
  const suspiciousAgents = ['python-requests', 'curl', 'wget', 'scanner', 'bot'];
  const lowerAgent = userAgent.toLowerCase();

  for (const suspicious of suspiciousAgents) {
    if (lowerAgent.includes(suspicious)) {
      logger.warn('SecurityMiddleware', 'Suspicious User-Agent detected', {
        userAgent,
        url: req.url,
      });
      return false;
    }
  }

  return true;
}

/**
 * API key validation (for external integrations)
 */
export function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');

  // If API key header is present, validate it
  if (apiKey) {
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

    if (!validApiKeys.includes(apiKey)) {
      logger.warn('SecurityMiddleware', 'Invalid API key', {
        url: req.url,
        apiKey: apiKey.substring(0, 8) + '...',
      });
      return false;
    }

    logger.info('SecurityMiddleware', 'API key validated', {
      url: req.url,
    });
  }

  return true;
}

/**
 * IP allowlist check (optional)
 */
export function checkIpAllowlist(req: NextRequest): boolean {
  const allowlist = process.env.IP_ALLOWLIST?.split(',') || [];

  // If no allowlist configured, allow all
  if (allowlist.length === 0) {
    return true;
  }

  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  if (!allowlist.includes(clientIp)) {
    logger.warn('SecurityMiddleware', 'IP not in allowlist', {
      ip: clientIp,
      url: req.url,
    });
    return false;
  }

  return true;
}

/**
 * Check request method validity
 */
export function validateRequestMethod(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  if (!allowedMethods.includes(method)) {
    logger.warn('SecurityMiddleware', 'Invalid HTTP method', {
      method,
      url: req.url,
    });
    return false;
  }

  return true;
}

/**
 * Comprehensive security middleware
 */
export async function securityMiddleware(req: NextRequest): Promise<NextResponse | null> {
  try {
    // 1. Validate HTTP method
    if (!validateRequestMethod(req)) {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // 2. Validate User-Agent
    if (!validateUserAgent(req)) {
      return NextResponse.json({ error: 'Invalid User-Agent' }, { status: 403 });
    }

    // 3. Check for suspicious patterns
    if (detectSuspiciousRequest(req)) {
      return NextResponse.json({ error: 'Suspicious request blocked' }, { status: 403 });
    }

    // 4. Validate API key (if provided)
    if (!validateApiKey(req)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // 5. Check IP allowlist (if configured)
    if (!checkIpAllowlist(req)) {
      return NextResponse.json({ error: 'IP not allowed' }, { status: 403 });
    }

    // If all checks pass, return null to continue
    return null;
  } catch (error) {
    logger.error('SecurityMiddleware', 'Security check error', { error });
    return NextResponse.json({ error: 'Security check failed' }, { status: 500 });
  }
}

/**
 * Wrapper to apply security middleware and headers
 */
export function withSecurityMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    // Run security checks
    const securityResponse = await securityMiddleware(req);
    if (securityResponse) {
      return applySecurityHeaders(securityResponse);
    }

    // Call original handler
    const response = await handler(req);

    // Apply security headers to response
    return applySecurityHeaders(response);
  };
}
