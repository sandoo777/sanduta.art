/**
 * XSS Protection & Input Sanitization
 * Protects against Cross-Site Scripting attacks
 */

import DOMPurify from 'isomorphic-dompurify';
import { logger } from '@/lib/logger';

/**
 * Sanitize HTML content (for rich text editors)
 */
export function sanitizeHtml(html: string): string {
  try {
    // Configure DOMPurify
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
        'img',
        'blockquote',
        'code',
        'pre',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });

    return clean;
  } catch (error) {
    logger.error('Sanitize', 'Failed to sanitize HTML', { error });
    return '';
  }
}

/**
 * Sanitize plain text (remove all HTML and dangerous protocols)
 */
export function sanitizePlainText(text: string): string {
  try {
    // First, remove dangerous protocols
    let clean = text;
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    for (const protocol of dangerousProtocols) {
      const regex = new RegExp(protocol, 'gi');
      clean = clean.replace(regex, '');
    }

    // Then, remove all HTML tags
    clean = DOMPurify.sanitize(clean, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    return clean.trim();
  } catch (error) {
    logger.error('Sanitize', 'Failed to sanitize plain text', { error });
    return '';
  }
}

/**
 * Sanitize URL (prevent javascript: and data: protocols)
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const trimmedUrl = url.trim();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = trimmedUrl.toLowerCase();

    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        logger.warn('Sanitize', 'Blocked dangerous URL protocol', { url: trimmedUrl });
        return null;
      }
    }

    // Validate URL format
    try {
      const parsedUrl = new URL(trimmedUrl);
      // Only allow http, https, mailto
      if (!['http:', 'https:', 'mailto:'].includes(parsedUrl.protocol)) {
        return null;
      }
      return parsedUrl.toString();
    } catch {
      // If not a valid URL, check if it's a relative path
      if (trimmedUrl.startsWith('/')) {
        return trimmedUrl;
      }
      return null;
    }
  } catch (error) {
    logger.error('Sanitize', 'Failed to sanitize URL', { error });
    return null;
  }
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize object (recursively sanitize all string values)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizePlainText(value) as any;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      // @ts-ignore - Type inference issue with array map
      sanitized[key] = value.map((item: unknown) =>
        typeof item === 'string' ? sanitizePlainText(item) : item
      ) as any;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  try {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      return null;
    }

    // Remove any HTML
    const clean = sanitizePlainText(trimmed);
    return clean;
  } catch (error) {
    logger.error('Sanitize', 'Failed to sanitize email', { error });
    return null;
  }
}

/**
 * Sanitize filename (prevent path traversal)
 */
export function sanitizeFilename(filename: string): string {
  try {
    // Remove path separators
    let clean = filename.replace(/[\/\\]/g, '');

    // Remove special characters
    clean = clean.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Remove leading dots
    clean = clean.replace(/^\.+/, '');

    // Limit length
    if (clean.length > 255) {
      const ext = clean.substring(clean.lastIndexOf('.'));
      clean = clean.substring(0, 255 - ext.length) + ext;
    }

    return clean || 'unnamed_file';
  } catch (error) {
    logger.error('Sanitize', 'Failed to sanitize filename', { error });
    return 'unnamed_file';
  }
}

/**
 * Detect XSS patterns
 */
export function detectXssPattern(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'].*["']/gi, // onclick, onerror, etc.
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      logger.warn('Sanitize', 'XSS pattern detected', { pattern: pattern.source });
      return true;
    }
  }

  return false;
}

/**
 * Sanitize for SQL (basic protection, use parameterized queries instead)
 */
export function sanitizeForSql(input: string): string {
  // Remove SQL keywords and special characters
  return input.replace(/['";\\]/g, '');
}

/**
 * Input validation result
 */
export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
}

/**
 * Comprehensive input validation
 */
export function validateAndSanitize(
  input: string,
  type: 'text' | 'html' | 'email' | 'url' | 'filename'
): ValidationResult {
  const errors: string[] = [];
  let sanitized = '';

  try {
    // Check for XSS patterns
    if (detectXssPattern(input)) {
      errors.push('Input contains potentially malicious code');
    }

    // Sanitize based on type
    switch (type) {
      case 'text':
        sanitized = sanitizePlainText(input);
        break;
      case 'html':
        sanitized = sanitizeHtml(input);
        break;
      case 'email':
        const email = sanitizeEmail(input);
        if (!email) {
          errors.push('Invalid email format');
        }
        sanitized = email || '';
        break;
      case 'url':
        const url = sanitizeUrl(input);
        if (!url) {
          errors.push('Invalid or unsafe URL');
        }
        sanitized = url || '';
        break;
      case 'filename':
        sanitized = sanitizeFilename(input);
        break;
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors,
    };
  } catch (error) {
    logger.error('Sanitize', 'Validation failed', { error });
    return {
      isValid: false,
      sanitized: '',
      errors: ['Validation error occurred'],
    };
  }
}
