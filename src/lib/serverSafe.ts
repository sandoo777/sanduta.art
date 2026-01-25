/**
 * Server Component Safety Layer
 * 
 * Protejează Server Components împotriva:
 * - redirect() neprotejat
 * - throw statements necontrolate
 * - date nevalidate
 * - Prefetch crashes
 * 
 * Previne 502 errors prin error handling sigur.
 */

import { redirect } from 'next/navigation';
import { logger } from './logger';

/**
 * Error types pentru Server Components
 */
export class ServerComponentError extends Error {
  constructor(
    message: string,
    public code: string = 'SERVER_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ServerComponentError';
  }
}

export class ServerRedirectError extends Error {
  constructor(
    public path: string,
    message: string = 'Redirect required'
  ) {
    super(message);
    this.name = 'ServerRedirectError';
  }
}

/**
 * Safe redirect wrapper pentru Server Components
 * Previne 502 prin logging și fallback
 */
export function safeRedirect(path: string, type?: 'replace' | 'push'): never {
  try {
    logger.info('ServerSafe', 'Safe redirect', { path, type });
    redirect(path);
  } catch (error) {
    // redirect() throws NEXT_REDIRECT care e normal
    if (error && typeof error === 'object' && 'digest' in error) {
      logger.info('ServerSafe', 'Redirect successful', { path });
      throw error; // Re-throw NEXT_REDIRECT
    }
    
    // Orice altă eroare e problematică
    logger.error('ServerSafe', 'Redirect failed', { path, error });
    throw new ServerRedirectError(path, 'Failed to redirect');
  }
}

/**
 * Validează date înainte de utilizare în Server Components
 */
export function validateServerData<T>(
  data: T | null | undefined,
  errorMessage: string = 'Data validation failed'
): T {
  if (data === null || data === undefined) {
    throw new ServerComponentError(errorMessage, 'VALIDATION_ERROR', 404);
  }
  return data;
}

/**
 * Safe wrapper pentru Server Component functions
 * Prinde toate erorile și returnează fallback UI
 */
export async function serverSafe<T>(
  fn: () => Promise<T>,
  options: {
    fallback?: T;
    redirectOnError?: string;
    logTag?: string;
  } = {}
): Promise<T> {
  const { fallback, redirectOnError, logTag = 'ServerComponent' } = options;

  try {
    return await fn();
  } catch (error) {
    // Permite NEXT_REDIRECT să treacă
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as any).digest;
      if (typeof digest === 'string' && digest.includes('NEXT_REDIRECT')) {
        logger.info(logTag, 'Allowing Next.js redirect', { digest });
        throw error;
      }
    }

    // Log eroarea
    logger.error(logTag, 'Server component error caught', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Redirect la error page dacă specificat
    if (redirectOnError) {
      logger.info(logTag, 'Redirecting to error page', { redirectOnError });
      redirect(redirectOnError);
    }

    // Returnează fallback dacă specificat
    if (fallback !== undefined) {
      logger.info(logTag, 'Returning fallback value');
      return fallback;
    }

    // Throw custom error pentru a preveni 502
    throw new ServerComponentError(
      'Server component failed safely',
      'SAFE_ERROR',
      500
    );
  }
}

/**
 * Wrapper pentru async Server Component pages
 * Previne 502 prin error boundaries
 */
export function withServerSafety<P extends Record<string, any>>(
  Component: (props: P) => Promise<React.ReactElement>,
  options: {
    fallbackComponent?: React.ReactElement;
    redirectOnError?: string;
    logTag?: string;
  } = {}
) {
  return async function SafeServerComponent(props: P) {
    try {
      return await Component(props);
    } catch (error) {
      // Permite NEXT_REDIRECT
      if (error && typeof error === 'object' && 'digest' in error) {
        const digest = (error as any).digest;
        if (typeof digest === 'string' && digest.includes('NEXT_REDIRECT')) {
          throw error;
        }
      }

      // Log error
      const logTag = options.logTag || Component.name || 'ServerComponent';
      logger.error(logTag, 'Component render failed', {
        error: error instanceof Error ? error.message : String(error),
        props,
      });

      // Redirect dacă specificat
      if (options.redirectOnError) {
        redirect(options.redirectOnError);
      }

      // Returnează fallback component
      if (options.fallbackComponent) {
        return options.fallbackComponent;
      }

      // Default error message (return null to prevent render, let Next.js error boundary handle it)
      logger.error('ServerSafe', 'Component failed without fallback', { error });
      return null;
    }
  };
}

/**
 * Safe data fetcher pentru Server Components
 * Include retry logic și timeout
 */
export async function fetchServerData<T>(
  fetcher: () => Promise<T>,
  options: {
    timeout?: number;
    retries?: number;
    fallback?: T;
    logTag?: string;
  } = {}
): Promise<T> {
  const {
    timeout = 10000,
    retries = 2,
    fallback,
    logTag = 'ServerData',
  } = options;

  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Timeout wrapper
      const result = await Promise.race([
        fetcher(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Fetch timeout')), timeout)
        ),
      ]);

      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        logger.warn(logTag, `Fetch attempt ${attempt + 1} failed, retrying...`, {
          error: error instanceof Error ? error.message : String(error),
        });
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // All retries failed
  logger.error(logTag, 'All fetch attempts failed', {
    retries,
    error: lastError instanceof Error ? lastError.message : String(lastError),
  });

  if (fallback !== undefined) {
    logger.info(logTag, 'Returning fallback data');
    return fallback;
  }

  throw new ServerComponentError(
    'Failed to fetch server data',
    'FETCH_ERROR',
    500
  );
}

/**
 * Type guards pentru safe data access
 */
export function isValidArray<T>(data: unknown): data is T[] {
  return Array.isArray(data);
}

export function isValidObject(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
}

export function hasRequiredFields<T extends Record<string, any>>(
  data: unknown,
  fields: (keyof T)[]
): data is T {
  if (!isValidObject(data)) return false;
  return fields.every(field => field in data);
}
