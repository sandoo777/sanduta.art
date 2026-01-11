/**
 * Sentry Configuration for Frontend Error Tracking
 * Captures and reports frontend errors, editor issues, configurator errors
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Set sample rates
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', /^https:\/\/sanduta\.art/],
      }),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Filter out specific errors
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Filter out network errors (they're logged separately)
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);
        if (message.includes('NetworkError') || message.includes('fetch')) {
          return null;
        }
      }

      // Add custom tags
      if (event.tags) {
        event.tags.app_section = getAppSection();
      }

      return event;
    },

    // Custom error grouping
    beforeSendTransaction(event) {
      // Add performance context
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          event.contexts = event.contexts || {};
          event.contexts.performance = {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            download: navigation.responseEnd - navigation.responseStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart,
            domComplete: navigation.domComplete - navigation.fetchStart,
          };
        }
      }

      return event;
    },
  });
}

/**
 * Get current app section from URL
 */
function getAppSection(): string {
  if (typeof window === 'undefined') return 'server';
  
  const path = window.location.pathname;
  
  if (path.startsWith('/editor')) return 'editor';
  if (path.startsWith('/products') && path.includes('configurator')) return 'configurator';
  if (path.startsWith('/checkout')) return 'checkout';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/dashboard')) return 'production';
  if (path === '/cart') return 'cart';
  
  return 'main';
}

/**
 * Capture error with context
 */
export function captureError(
  error: Error,
  context?: {
    section?: string;
    userId?: string;
    action?: string;
    extra?: Record<string, any>;
  }
) {
  if (!SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    if (context?.section) {
      scope.setTag('section', context.section);
    }
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    if (context?.action) {
      scope.setContext('action', { name: context.action });
    }
    if (context?.extra) {
      scope.setContext('extra', context.extra);
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture editor error
 */
export function captureEditorError(
  error: Error,
  editorState?: any,
  userId?: string
) {
  captureError(error, {
    section: 'editor',
    userId,
    extra: {
      editorState: editorState ? JSON.stringify(editorState).substring(0, 1000) : undefined,
    },
  });
}

/**
 * Capture configurator error
 */
export function captureConfiguratorError(
  error: Error,
  productId?: string,
  configuration?: any,
  userId?: string
) {
  captureError(error, {
    section: 'configurator',
    userId,
    extra: {
      productId,
      configuration: configuration ? JSON.stringify(configuration).substring(0, 1000) : undefined,
    },
  });
}

/**
 * Capture checkout error
 */
export function captureCheckoutError(
  error: Error,
  step?: string,
  orderData?: any,
  userId?: string
) {
  captureError(error, {
    section: 'checkout',
    userId,
    action: step,
    extra: {
      orderData: orderData ? JSON.stringify(orderData).substring(0, 1000) : undefined,
    },
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
) {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a transaction for performance tracking
 */
export function startTransaction(name: string, op: string) {
  if (!SENTRY_DSN) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Set user context
 */
export function setUser(userId: string, email?: string, username?: string) {
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context
 */
export function clearUser() {
  if (!SENTRY_DSN) return;

  Sentry.setUser(null);
}
