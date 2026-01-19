/**
 * File Upload Security Module
 * Validates and secures file uploads
 */

import { logger } from '@/lib/logger';
import { sanitizeFilename } from '@/lib/security/sanitize';

/**
 * File validation configuration
 */
export const FILE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  maxImageSize: 5 * 1024 * 1024, // 5 MB
  maxDocumentSize: 20 * 1024 * 1024, // 20 MB
};

/**
 * Allowed MIME types
 */
export const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif',
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  archives: ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'],
};

/**
 * Blocked file extensions (executables, scripts)
 */
const BLOCKED_EXTENSIONS = [
  '.exe',
  '.dll',
  '.bat',
  '.cmd',
  '.com',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.app',
  '.deb',
  '.rpm',
  '.sh',
  '.bash',
  '.ps1',
  '.msi',
];

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedFilename?: string;
  detectedMimeType?: string;
}

/**
 * File Upload Validator
 */
export class FileUploadValidator {
  /**
   * Validate file
   */
  static async validateFile(
    file: File,
    allowedTypes: string[] = ALLOWED_MIME_TYPES.images,
    maxSize: number = FILE_CONFIG.maxImageSize
  ): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Check file size
      if (file.size > maxSize) {
        errors.push(
          `File size exceeds maximum allowed (${(maxSize / 1024 / 1024).toFixed(2)} MB)`
        );
      }

      if (file.size === 0) {
        errors.push('File is empty');
      }

      // 2. Check filename
      const sanitizedFilename = sanitizeFilename(file.name);
      if (!sanitizedFilename || sanitizedFilename === 'unnamed_file') {
        errors.push('Invalid filename');
      }

      // 3. Check extension
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (BLOCKED_EXTENSIONS.includes(extension)) {
        errors.push('File type is not allowed (executable or script)');
      }

      // 4. Check MIME type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed`);
      }

      // 5. Verify MIME type matches content (magic number check)
      const isMimeValid = await this.verifyMimeType(file);
      if (!isMimeValid) {
        warnings.push('File content does not match declared MIME type');
      }

      // 6. Check for embedded malicious content (basic)
      const hasEmbeddedScript = await this.detectEmbeddedScript(file);
      if (hasEmbeddedScript) {
        errors.push('File contains potentially malicious embedded content');
      }

      logger.info('FileValidator', 'File validation completed', {
        filename: sanitizedFilename,
        size: file.size,
        type: file.type,
        errors: errors.length,
        warnings: warnings.length,
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedFilename,
        detectedMimeType: file.type,
      };
    } catch (_error) {
      logger.error('FileValidator', 'File validation error', { error });
      return {
        isValid: false,
        errors: ['File validation failed'],
        warnings: [],
      };
    }
  }

  /**
   * Verify MIME type by checking magic numbers
   */
  private static async verifyMimeType(file: File): Promise<boolean> {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const hex = Array.from(bytes.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Check magic numbers
      const magicNumbers: Record<string, string[]> = {
        'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
        'image/png': ['89504e47'],
        'image/gif': ['47494638'],
        'image/webp': ['52494646'],
        'application/pdf': ['25504446'],
        'application/zip': ['504b0304', '504b0506'],
      };

      const declaredType = file.type;
      const expectedMagic = magicNumbers[declaredType];

      if (expectedMagic) {
        return expectedMagic.some((magic) => hex.startsWith(magic));
      }

      // If no magic number defined, allow (not all types have magic numbers)
      return true;
    } catch (_error) {
      logger.error('FileValidator', 'MIME type verification error', { error });
      return false;
    }
  }

  /**
   * Detect embedded scripts in file content
   */
  private static async detectEmbeddedScript(file: File): Promise<boolean> {
    try {
      // Only check text-based files
      if (!file.type.startsWith('text/') && !file.type.includes('svg')) {
        return false;
      }

      const text = await file.text();
      const scriptPatterns = [
        /<script/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<embed/gi,
        /<object/gi,
      ];

      for (const pattern of scriptPatterns) {
        if (pattern.test(text)) {
          return true;
        }
      }

      return false;
    } catch (_error) {
      // If we can't read as text, it's probably binary, so skip check
      return false;
    }
  }

  /**
   * Generate secure random filename
   */
  static generateSecureFilename(originalFilename: string): string {
    const crypto = require('crypto');
    const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
    const randomName = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}_${randomName}${extension}`;
  }

  /**
   * Get upload directory based on file type
   */
  static getUploadDirectory(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'uploads/images';
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return 'uploads/documents';
    } else {
      return 'uploads/misc';
    }
  }

  /**
   * Validate multiple files
   */
  static async validateFiles(
    files: File[],
    allowedTypes: string[],
    maxSize: number
  ): Promise<FileValidationResult[]> {
    const results = await Promise.all(
      files.map((file) => this.validateFile(file, allowedTypes, maxSize))
    );
    return results;
  }

  /**
   * Check if file is image
   */
  static isImage(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.images.includes(mimeType);
  }

  /**
   * Check if file is document
   */
  static isDocument(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.documents.includes(mimeType);
  }
}

/**
 * Antivirus scan result (placeholder for ClamAV integration)
 */
export interface AntivirusScanResult {
  isClean: boolean;
  virusFound?: string;
  scanDate: Date;
}

/**
 * Antivirus Scanner (placeholder)
 */
export class AntivirusScanner {
  /**
   * Scan file for viruses (placeholder - integrate ClamAV)
   */
  static async scanFile(file: File): Promise<AntivirusScanResult> {
    try {
      // TODO: Integrate with ClamAV or external API
      // For now, just return clean
      logger.info('AntivirusScanner', 'File scanned', { filename: file.name });

      return {
        isClean: true,
        scanDate: new Date(),
      };
    } catch (_error) {
      logger.error('AntivirusScanner', 'Scan failed', { error });
      return {
        isClean: false,
        virusFound: 'Scan error',
        scanDate: new Date(),
      };
    }
  }
}
