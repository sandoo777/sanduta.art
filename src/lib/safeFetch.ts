/**
 * GLOBAL SAFE FETCH HELPER
 * Previne erorile de tip "Unexpected end of JSON input" și asigură răspunsuri sigure
 */

import { logger } from '@/lib/logger';

export interface SafeFetchOptions<T> extends RequestInit {
  /**
   * Valoarea returnată dacă request-ul eșuează sau răspunsul nu e valid
   */
  fallback: T;
  
  /**
   * Tag pentru logging (ex: 'Orders', 'Products')
   */
  logTag?: string;
  
  /**
   * Dacă true, nu loghează erorile (pentru polling, etc.)
   */
  silent?: boolean;
  
  /**
   * Timeout în milisecunde (default: 30000)
   */
  timeout?: number;
  
  /**
   * Număr de retry-uri (default: 0)
   */
  retries?: number;
  
  /**
   * Dacă true, validează că response.ok = true
   */
  requireOk?: boolean;
}

/**
 * Safe fetch care returnează întotdeauna un rezultat valid
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const data = await safeFetch('/api/orders', {
 *   fallback: [],
 *   logTag: 'Orders'
 * });
 * 
 * // With options
 * const data = await safeFetch('/api/users', {
 *   fallback: { users: [], total: 0 },
 *   method: 'POST',
 *   body: JSON.stringify({ filter: 'active' }),
 *   headers: { 'Content-Type': 'application/json' },
 *   timeout: 5000,
 *   retries: 2
 * });
 * ```
 */
export async function safeFetch<T>(
  url: string,
  options: SafeFetchOptions<T>
): Promise<T> {
  const {
    fallback,
    logTag = 'API',
    silent = false,
    timeout = 30000,
    retries = 0,
    requireOk = true,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check HTTP status
      if (requireOk && !response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Try to parse JSON
      const text = await response.text();
      
      // Empty response -> return fallback
      if (!text || text.trim() === '') {
        if (!silent) {
          logger.warn(logTag, 'Empty response from API', { url });
        }
        return fallback;
      }

      // Parse JSON
      try {
        const data = JSON.parse(text) as T;
        return data;
      } catch (parseError) {
        if (!silent) {
          logger.error(logTag, 'JSON parse error', {
            url,
            text: text.substring(0, 100),
            error: parseError instanceof Error ? parseError.message : 'Unknown error'
          });
        }
        return fallback;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Abort error (timeout)
      if (lastError.name === 'AbortError') {
        if (!silent) {
          logger.error(logTag, `Request timeout after ${timeout}ms`, { url, attempt });
        }
      } else if (!silent) {
        logger.error(logTag, 'Fetch error', {
          url,
          attempt,
          error: lastError.message
        });
      }

      // Retry sau return fallback
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  // All retries failed
  if (!silent && lastError) {
    logger.error(logTag, 'All retries exhausted', { url, error: lastError.message });
  }
  
  return fallback;
}

/**
 * Safe fetch pentru GET requests (shorthand)
 */
export async function safeGet<T>(
  url: string,
  fallback: T,
  logTag?: string
): Promise<T> {
  return safeFetch(url, {
    method: 'GET',
    fallback,
    logTag,
  });
}

/**
 * Safe fetch pentru POST requests (shorthand)
 */
export async function safePost<T>(
  url: string,
  data: unknown,
  fallback: T,
  logTag?: string
): Promise<T> {
  return safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    fallback,
    logTag,
  });
}

/**
 * Safe fetch pentru PUT requests (shorthand)
 */
export async function safePut<T>(
  url: string,
  data: unknown,
  fallback: T,
  logTag?: string
): Promise<T> {
  return safeFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    fallback,
    logTag,
  });
}

/**
 * Safe fetch pentru DELETE requests (shorthand)
 */
export async function safeDelete<T>(
  url: string,
  fallback: T,
  logTag?: string
): Promise<T> {
  return safeFetch(url, {
    method: 'DELETE',
    fallback,
    logTag,
  });
}

/**
 * Validează că un API route returnează JSON valid
 * Folosește-l în API routes pentru a verifica output
 */
export function ensureJsonResponse(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    logger.error('API', 'Failed to stringify response', { error });
    return JSON.stringify({ error: 'Internal server error' });
  }
}
