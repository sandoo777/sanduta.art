/**
 * SERVER FAILSAFE SYSTEM
 * 
 * Sistem global de protecție împotriva crash-urilor server-side în Next.js.
 * Prinde toate erorile din Server Components și returnează fallback-uri controlate.
 * 
 * @module server-safe
 */

import { redirect } from 'next/navigation';
import { logger } from './logger';

/**
 * Opțiuni pentru failsafe wrapper
 */
export interface ServerSafeOptions {
  /** Context pentru logging (ex: "AdminLayout", "ProductsPage") */
  context: string;
  /** Redirect URL în caz de eroare (opțional) */
  redirectTo?: string;
  /** Fallback component în caz de eroare (opțional) */
  fallback?: React.ReactNode;
  /** Dacă trebuie să re-throw eroarea după logging (default: false) */
  rethrow?: boolean;
}

/**
 * Rezultat din serverSafe wrapper
 */
export type ServerSafeResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: Error;
};

/**
 * Wrapper pentru protecție globală a operațiilor async server-side
 * 
 * @example
 * ```tsx
 * export default async function Page() {
 *   const result = await serverSafe(
 *     async () => {
 *       const user = await getCurrentUser();
 *       const data = await prisma.product.findMany();
 *       return { user, data };
 *     },
 *     { context: 'ProductsPage', redirectTo: '/login' }
 *   );
 * 
 *   if (!result.success) {
 *     return <ErrorState />;
 *   }
 * 
 *   return <ProductsList data={result.data} />;
 * }
 * ```
 */
export async function serverSafe<T>(
  operation: () => Promise<T>,
  options: ServerSafeOptions
): Promise<ServerSafeResult<T>> {
  const { context, redirectTo, rethrow = false } = options;

  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    // Logging detaliat
    logger.error(
      `ServerSafe:${context}`,
      'Server operation failed',
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        redirectTo,
      }
    );

    // Dacă avem redirect, executăm redirect
    if (redirectTo) {
      redirect(redirectTo);
    }

    // Dacă trebuie să re-throw
    if (rethrow) {
      throw error;
    }

    // Returnăm rezultat de eroare
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Guard pentru validarea session cu redirect automat
 * 
 * @example
 * ```tsx
 * export default async function AdminLayout({ children }) {
 *   await requireAuthOrRedirect('/login', 'AdminLayout');
 *   return <>{children}</>;
 * }
 * ```
 */
export async function requireAuthOrRedirect(
  redirectTo: string,
  context: string,
  sessionGetter: () => Promise<any>
): Promise<void> {
  try {
    const session = await sessionGetter();
    
    if (!session || !session.user) {
      logger.warn(`ServerSafe:${context}`, 'Unauthorized access attempt', {
        redirectTo,
      });
      redirect(redirectTo);
    }
  } catch (error) {
    logger.error(`ServerSafe:${context}`, 'Auth check failed', {
      error: error instanceof Error ? error.message : String(error),
      redirectTo,
    });
    redirect(redirectTo);
  }
}

/**
 * Guard pentru validarea role cu redirect automat
 * 
 * @example
 * ```tsx
 * export default async function ManagerPage() {
 *   await requireRoleOrRedirect(
 *     ['ADMIN', 'MANAGER'],
 *     '/unauthorized',
 *     'ManagerPage',
 *     getCurrentUser
 *   );
 *   return <ManagerDashboard />;
 * }
 * ```
 */
export async function requireRoleOrRedirect(
  allowedRoles: string[],
  redirectTo: string,
  context: string,
  userGetter: () => Promise<{ role: string } | null>
): Promise<void> {
  try {
    const user = await userGetter();
    
    if (!user || !allowedRoles.includes(user.role)) {
      logger.warn(`ServerSafe:${context}`, 'Insufficient permissions', {
        userRole: user?.role,
        allowedRoles,
        redirectTo,
      });
      redirect(redirectTo);
    }
  } catch (error) {
    logger.error(`ServerSafe:${context}`, 'Role check failed', {
      error: error instanceof Error ? error.message : String(error),
      redirectTo,
    });
    redirect(redirectTo);
  }
}

/**
 * Safe JSON parse cu fallback
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T,
  context: string
): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.error(`ServerSafe:${context}`, 'JSON parse failed', {
      error: error instanceof Error ? error.message : String(error),
      jsonPreview: json.substring(0, 100),
    });
    return fallback;
  }
}

/**
 * Safe fetch cu retry și fallback
 */
export async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  context: string,
  retries = 2
): Promise<{ success: true; data: T } | { success: false; error: Error }> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < retries) {
        logger.warn(`ServerSafe:${context}`, `Fetch attempt ${attempt + 1} failed, retrying...`, {
          url,
          error: lastError.message,
        });
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  logger.error(`ServerSafe:${context}`, 'Fetch failed after retries', {
    url,
    retries,
    error: lastError.message,
  });

  return { success: false, error: lastError };
}

/**
 * Wrapper pentru Prisma queries cu error handling
 */
export async function safePrismaQuery<T>(
  query: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    logger.error(`ServerSafe:${context}`, 'Prisma query failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
}

/**
 * Component wrapper pentru Error Boundary server-side
 */
export function ServerErrorFallback({
  error,
  reset,
  context,
}: {
  error: Error;
  reset?: () => void;
  context: string;
}) {
  logger.error(`ServerSafe:${context}`, 'Component error boundary triggered', {
    error: error.message,
    stack: error.stack,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Ceva nu a funcționat
          </h2>
        </div>
        
        <p className="mb-6 text-gray-600">
          Ne pare rău, dar a apărut o eroare. Echipa noastră a fost notificată 
          și lucrăm la rezolvarea problemei.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded bg-gray-100 p-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Detalii eroare (doar în development):
            </p>
            <p className="text-xs text-gray-600">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3">
          {reset && (
            <button
              onClick={reset}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Încearcă din nou
            </button>
          )}
          <a
            href="/"
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Înapoi la pagina principală
          </a>
        </div>
      </div>
    </div>
  );
}
