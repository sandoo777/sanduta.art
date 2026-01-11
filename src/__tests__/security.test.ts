/**
 * Security Testing Suite
 * Comprehensive security tests for all security modules
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PasswordSecurity, BruteForceProtection } from '@/modules/auth/security';
import { sanitizeHtml, sanitizePlainText, sanitizeUrl, detectXssPattern } from '@/lib/security/sanitize';
import { FileUploadValidator, ALLOWED_MIME_TYPES } from '@/modules/files/validateFile';
import { PasswordPolicy } from '@/lib/security/passwordPolicy';
import { validateCsrfToken, generateCsrfToken } from '@/lib/security/csrf';

describe('Security Testing Suite', () => {
  describe('Password Security', () => {
    it('should hash password with Argon2id', async () => {
      const password = 'MySecureP@ssw0rd123';
      const hash = await PasswordSecurity.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify correct password', async () => {
      const password = 'MySecureP@ssw0rd123';
      const hash = await PasswordSecurity.hashPassword(password);
      const isValid = await PasswordSecurity.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'MySecureP@ssw0rd123';
      const hash = await PasswordSecurity.hashPassword(password);
      const isValid = await PasswordSecurity.verifyPassword('WrongPassword', hash);

      expect(isValid).toBe(false);
    });

    it('should detect weak passwords', () => {
      const result = PasswordSecurity.checkPasswordStrength('12345');

      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept strong passwords', () => {
      const result = PasswordSecurity.checkPasswordStrength('MyV3ry$tr0ng!P@ssw0rd');

      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.errors.length).toBe(0);
    });
  });

  describe('Brute Force Protection', () => {
    beforeEach(() => {
      // Reset attempts before each test
      BruteForceProtection.resetAttempts('test-user');
    });

    it('should not lock out user with few attempts', () => {
      BruteForceProtection.recordFailedAttempt('test-user');
      BruteForceProtection.recordFailedAttempt('test-user');

      const isLockedOut = BruteForceProtection.isLockedOut('test-user');
      expect(isLockedOut).toBe(false);
    });

    it('should lock out user after max attempts', () => {
      for (let i = 0; i < 5; i++) {
        BruteForceProtection.recordFailedAttempt('test-user');
      }

      const isLockedOut = BruteForceProtection.isLockedOut('test-user');
      expect(isLockedOut).toBe(true);
    });

    it('should show remaining attempts', () => {
      BruteForceProtection.recordFailedAttempt('test-user');
      BruteForceProtection.recordFailedAttempt('test-user');

      const remaining = BruteForceProtection.getRemainingAttempts('test-user');
      expect(remaining).toBe(3);
    });

    it('should reset attempts after successful login', () => {
      BruteForceProtection.recordFailedAttempt('test-user');
      BruteForceProtection.resetAttempts('test-user');

      const remaining = BruteForceProtection.getRemainingAttempts('test-user');
      expect(remaining).toBe(5);
    });
  });

  describe('XSS Protection', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("XSS")</script>Hello';
      const safe = sanitizeHtml(malicious);

      expect(safe).not.toContain('<script>');
      expect(safe).toBe('Hello');
    });

    it('should remove event handlers', () => {
      const malicious = '<img src="x" onerror="alert(\'XSS\')" />';
      const safe = sanitizeHtml(malicious);

      expect(safe).not.toContain('onerror');
    });

    it('should allow safe HTML tags', () => {
      const safe = '<p>Hello <strong>World</strong></p>';
      const sanitized = sanitizeHtml(safe);

      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
    });

    it('should detect XSS patterns', () => {
      const patterns = [
        '<script>alert("XSS")</script>',
        'javascript:alert(1)',
        '<img onerror="alert(1)">',
        '<iframe src="evil.com">',
      ];

      patterns.forEach((pattern) => {
        const detected = detectXssPattern(pattern);
        expect(detected).toBe(true);
      });
    });

    it('should sanitize plain text', () => {
      const text = '<h1>Not HTML</h1>';
      const safe = sanitizePlainText(text);

      expect(safe).not.toContain('<h1>');
      expect(safe).toBe('Not HTML');
    });
  });

  describe('URL Sanitization', () => {
    it('should allow safe URLs', () => {
      const urls = ['https://example.com', 'http://example.com', '/relative/path', 'mailto:test@example.com'];

      urls.forEach((url) => {
        const safe = sanitizeUrl(url);
        expect(safe).toBeTruthy();
      });
    });

    it('should block dangerous protocols', () => {
      const dangerous = ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox'];

      dangerous.forEach((url) => {
        const safe = sanitizeUrl(url);
        expect(safe).toBeNull();
      });
    });
  });

  describe('File Upload Validation', () => {
    it('should accept valid image files', async () => {
      // Create a mock File object
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const result = await FileUploadValidator.validateFile(file, ALLOWED_MIME_TYPES.images, 5 * 1024 * 1024);

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject files that are too large', async () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

      const result = await FileUploadValidator.validateFile(file, ALLOWED_MIME_TYPES.images, 10 * 1024 * 1024);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size exceeds maximum allowed (10.00 MB)');
    });

    it('should reject executable files', async () => {
      const file = new File(['test'], 'malware.exe', { type: 'application/x-msdownload' });

      const result = await FileUploadValidator.validateFile(file, ALLOWED_MIME_TYPES.images, 5 * 1024 * 1024);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('executable'))).toBe(true);
    });

    it('should generate secure random filenames', () => {
      const filename1 = FileUploadValidator.generateSecureFilename('test.jpg');
      const filename2 = FileUploadValidator.generateSecureFilename('test.jpg');

      expect(filename1).not.toBe(filename2);
      expect(filename1).toMatch(/^\d+_[a-f0-9]+\.jpg$/);
    });
  });

  describe('Password Policy', () => {
    it('should enforce minimum length', () => {
      const result = PasswordPolicy.validate('Short1!');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('10 characters'))).toBe(true);
    });

    it('should require complexity', () => {
      const result = PasswordPolicy.validate('alllowercase');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject common passwords', () => {
      const result = PasswordPolicy.validate('Password123!');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('too common'))).toBe(true);
    });

    it('should accept strong passwords', () => {
      const result = PasswordPolicy.validate('MyV3ry$tr0ng!P@ssw0rd2024');

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.strength).toMatch(/strong|very-strong/);
      expect(result.score).toBeGreaterThan(60);
    });

    it('should prevent user info in password', () => {
      const result = PasswordPolicy.validate('JohnDoe123!@#', {
        email: 'john.doe@example.com',
        name: 'John Doe',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('email') || e.includes('name'))).toBe(true);
    });

    it('should detect sequential characters', () => {
      const result = PasswordPolicy.validate('Abc123456!@#');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('sequential'))).toBe(true);
    });
  });

  describe('CSRF Protection', () => {
    it('should generate unique CSRF tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
    });

    // Note: Full CSRF validation requires NextRequest mock, skipping for now
  });

  describe('Integration Tests', () => {
    it('should handle complete authentication flow', async () => {
      // 1. Validate password policy
      const password = 'MySecure!P@ssw0rd2024';
      const policyResult = PasswordPolicy.validate(password);
      expect(policyResult.isValid).toBe(true);

      // 2. Hash password
      const hash = await PasswordSecurity.hashPassword(password);
      expect(hash).toBeDefined();

      // 3. Verify password
      const isValid = await PasswordSecurity.verifyPassword(password, hash);
      expect(isValid).toBe(true);

      // 4. Check brute force
      const isLockedOut = BruteForceProtection.isLockedOut('test-user');
      expect(isLockedOut).toBe(false);
    });

    it('should handle malicious input sanitization', () => {
      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        'javascript:void(0)',
        '<img src=x onerror="alert(1)">',
        'SELECT * FROM users; DROP TABLE users;--',
      ];

      maliciousInputs.forEach((input) => {
        const sanitized = sanitizePlainText(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror');
      });
    });
  });
});

/**
 * Manual security testing checklist
 */
export const SECURITY_TEST_CHECKLIST = {
  bruteForce: {
    description: 'Test brute force protection',
    steps: [
      '1. Attempt to login with wrong password 5 times',
      '2. Verify account is locked',
      '3. Wait 15 minutes',
      '4. Verify account is unlocked',
    ],
    expected: 'Account should be locked after 5 failed attempts',
  },
  csrf: {
    description: 'Test CSRF protection',
    steps: [
      '1. Send POST request without CSRF token',
      '2. Verify request is rejected with 403',
      '3. Send POST with valid token',
      '4. Verify request is accepted',
    ],
    expected: 'Requests without valid CSRF token should be rejected',
  },
  xss: {
    description: 'Test XSS protection',
    steps: [
      '1. Submit form with <script>alert(1)</script>',
      '2. Verify script is not executed',
      '3. Check database to ensure script is sanitized',
      '4. Try other XSS vectors (img onerror, javascript:, etc.)',
    ],
    expected: 'All XSS attempts should be sanitized',
  },
  fileUpload: {
    description: 'Test file upload security',
    steps: [
      '1. Try to upload .exe file',
      '2. Verify upload is rejected',
      '3. Try to upload file with fake extension (malware.jpg.exe)',
      '4. Try to upload oversized file',
      '5. Try to upload file with malicious content',
    ],
    expected: 'All dangerous files should be rejected',
  },
  apiSecurity: {
    description: 'Test API rate limiting',
    steps: [
      '1. Send 100 requests rapidly to /api/products',
      '2. Verify rate limit kicks in after 60 requests',
      '3. Wait 1 minute',
      '4. Verify rate limit resets',
    ],
    expected: 'Rate limit should block excessive requests',
  },
  rolePermissions: {
    description: 'Test role-based access control',
    steps: [
      '1. Login as OPERATOR',
      '2. Try to access /api/admin/users (should fail)',
      '3. Try to access /api/admin/orders (should succeed)',
      '4. Login as ADMIN',
      '5. Try to access /api/admin/users (should succeed)',
    ],
    expected: 'Users should only access resources they have permission for',
  },
  auditLogs: {
    description: 'Test audit logging',
    steps: [
      '1. Login successfully',
      '2. Change password',
      '3. Upload file',
      '4. Check audit logs',
      '5. Verify all actions are logged',
    ],
    expected: 'All security-relevant actions should be logged',
  },
  headers: {
    description: 'Test security headers',
    steps: [
      '1. Make request to any endpoint',
      '2. Check response headers',
      '3. Verify X-Frame-Options: DENY',
      '4. Verify Content-Security-Policy is set',
      '5. Verify Strict-Transport-Security is set',
    ],
    expected: 'All security headers should be present',
  },
};
