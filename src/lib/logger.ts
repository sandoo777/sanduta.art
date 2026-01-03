/**
 * Structured logging utility for consistent log formatting
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogContext {
  [key: string]: any;
}

/**
 * Logs a message with structured context
 */
export function log(
  level: LogLevel,
  tag: string,
  message: string,
  context?: LogContext
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    tag,
    message,
    ...(context && { context }),
  };

  const prefix = `[${timestamp}] [${level}] [${tag}]`;
  
  switch (level) {
    case 'ERROR':
      console.error(prefix, message, context || '');
      break;
    case 'WARN':
      console.warn(prefix, message, context || '');
      break;
    case 'DEBUG':
      if (process.env.NODE_ENV === 'development') {
        console.debug(prefix, message, context || '');
      }
      break;
    default:
      console.log(prefix, message, context || '');
  }

  return logEntry;
}

/**
 * Helper functions for each log level
 */
export const logger = {
  info: (tag: string, message: string, context?: LogContext) => 
    log('INFO', tag, message, context),
  
  warn: (tag: string, message: string, context?: LogContext) => 
    log('WARN', tag, message, context),
  
  error: (tag: string, message: string, context?: LogContext) => 
    log('ERROR', tag, message, context),
  
  debug: (tag: string, message: string, context?: LogContext) => 
    log('DEBUG', tag, message, context),
};

/**
 * API-specific logger with automatic error formatting
 */
export function logApiError(
  tag: string,
  error: unknown,
  context?: LogContext
) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error(tag, errorMessage, {
    ...context,
    ...(errorStack && { stack: errorStack }),
  });
}

/**
 * Standard error response builder
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  details?: any
) {
  return Response.json(
    {
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
