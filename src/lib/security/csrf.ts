/**
 * CSRF Protection Module
 * Protects against Cross-Site Request Forgery attacks
 */

import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

/**
 * CSRF token configuration
 */
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Set CSRF token in cookie
 */
export function setCsrfToken(response: Response, token: string): Response {
  const headers = new Headers(response.headers);
  headers.set(
    'Set-Cookie',
    `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Get CSRF token from request
 */
export function getCsrfTokenFromRequest(req: NextRequest): string | null {
  // Check header first
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  if (headerToken) return headerToken;

  // Check cookie
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  return cookieToken || null;
}

/**
 * Get CSRF token from cookie
 */
export function getCsrfTokenFromCookie(req: NextRequest): string | null {
  return req.cookies.get(CSRF_COOKIE_NAME)?.value || null;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(req: NextRequest): boolean {
  // Skip validation for GET, HEAD, OPTIONS (safe methods)
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }

  // Get tokens
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Both must exist
  if (!headerToken || !cookieToken) {
    logger.warn('CSRF', 'Missing CSRF token', { method, path: req.nextUrl.pathname });
    return false;
  }

  // Must match
  if (headerToken !== cookieToken) {
    logger.warn('CSRF', 'CSRF token mismatch', { method, path: req.nextUrl.pathname });
    return false;
  }

  return true;
}

/**
 * CSRF middleware wrapper
 */
export function withCsrfProtection(
  handler: (req: NextRequest) => Promise<Response>
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    // Validate CSRF token
    if (!validateCsrfToken(req)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid CSRF token',
          message: 'Request rejected due to missing or invalid CSRF token',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Call original handler
    const response = await handler(req);

    // Set new CSRF token if needed
    const method = req.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const newToken = generateCsrfToken();
      return setCsrfToken(response, newToken);
    }

    return response;
  };
}

/**
 * Generate CSRF token for forms
 */
export function getCsrfTokenForForm(req: NextRequest): string {
  let token = getCsrfTokenFromCookie(req);
  if (!token) {
    token = generateCsrfToken();
  }
  return token;
}

/**
 * Validate form CSRF token
 */
export function validateFormCsrfToken(req: NextRequest, formToken: string): boolean {
  const cookieToken = getCsrfTokenFromCookie(req);
  if (!cookieToken) return false;
  return formToken === cookieToken;
}
