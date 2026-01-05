/**
 * Rate Limiting System pentru protecție anti-abuse
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Verifică dacă requestul depășește limita
   * @returns true dacă este permis, false dacă depășește limita
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.storage.get(identifier);

    // Dacă nu există entry sau a expirat, creează unul nou
    if (!entry || now > entry.resetTime) {
      this.storage.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });

      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
      };
    }

    // Incrementează counter-ul
    entry.count++;
    this.storage.set(identifier, entry);

    const allowed = entry.count <= limit;
    const remaining = Math.max(0, limit - entry.count);

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset manual pentru un identifier
   */
  reset(identifier: string): void {
    this.storage.delete(identifier);
  }

  /**
   * Curăță entries expirate
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.storage.forEach((entry, key) => {
      if (now > entry.resetTime) {
        toDelete.push(key);
      }
    });

    toDelete.forEach((key) => this.storage.delete(key));
  }

  /**
   * Distruge instanța
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.storage.clear();
  }
}

// Singleton instance
const limiter = new RateLimiter();

/**
 * Rate limit configs predefinite
 */
export const RATE_LIMITS = {
  // Login/Auth - strict
  LOGIN: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minute
  },
  REGISTER: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 oră
  },
  PASSWORD_RESET: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 oră
  },

  // API General
  API_GENERAL: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minut
  },
  API_STRICT: {
    limit: 20,
    windowMs: 60 * 1000, // 1 minut
  },

  // File uploads
  UPLOAD: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minut
  },

  // Search/Filters
  SEARCH: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minut
  },
} as const;

/**
 * Obține identifier pentru rate limiting
 */
export function getRateLimitIdentifier(
  request: Request,
  prefix: string = 'default'
): string {
  // Încearcă să obții IP-ul
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  // Combină cu user agent pentru identificare mai bună
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const hash = Buffer.from(`${ip}-${userAgent}`).toString('base64').slice(0, 32);

  return `${prefix}:${hash}`;
}

/**
 * Middleware pentru rate limiting
 */
export async function rateLimit(
  request: Request,
  config: { limit: number; windowMs: number },
  identifier?: string
): Promise<
  | { allowed: true; remaining: number; resetTime: number }
  | { allowed: false; error: string; resetTime: number }
> {
  const id = identifier || getRateLimitIdentifier(request);
  const result = limiter.check(id, config.limit, config.windowMs);

  if (!result.allowed) {
    return {
      allowed: false,
      error: 'Prea multe cereri. Te rugăm să încerci din nou mai târziu.',
      resetTime: result.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: result.remaining,
    resetTime: result.resetTime,
  };
}

/**
 * Helper pentru a adăuga headers de rate limit la response
 */
export function addRateLimitHeaders(
  response: Response,
  result: { remaining: number; resetTime: number; limit?: number }
): Response {
  const headers = new Headers(response.headers);
  
  headers.set('X-RateLimit-Limit', (result.limit || 100).toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set(
    'X-RateLimit-Reset',
    new Date(result.resetTime).toISOString()
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Wrapper pentru API routes cu rate limiting
 */
export function withRateLimit(
  config: { limit: number; windowMs: number },
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    const result = await rateLimit(request, config);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: result.error,
          resetTime: new Date(result.resetTime).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(
              (result.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const response = await handler(request);
    return addRateLimitHeaders(response, {
      remaining: result.remaining,
      resetTime: result.resetTime,
      limit: config.limit,
    });
  };
}

export default limiter;
