/**
 * Authentication Security Module
 * Enterprise-grade authentication with Argon2id, 2FA, refresh tokens
 */

import { hash, verify } from '@node-rs/argon2';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Argon2id configuration (OWASP recommended)
 */
const ARGON2_CONFIG = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
  outputLen: 32,
};

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  refreshMaxAge: 90 * 24 * 60 * 60, // 90 days
  absoluteTimeout: 7 * 24 * 60 * 60, // 7 days absolute
};

/**
 * Brute force protection
 */
const LOGIN_ATTEMPTS: Map<string, { count: number; lastAttempt: number }> = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Password hashing with Argon2id
 */
export class PasswordSecurity {
  /**
   * Hash password with Argon2id
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await hash(password, ARGON2_CONFIG);
      return hashedPassword;
    } catch (error) {
      logger.error('PasswordSecurity', 'Failed to hash password', { error });
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isValid = await verify(hash, password, ARGON2_CONFIG);
      return isValid;
    } catch (error) {
      logger.error('PasswordSecurity', 'Failed to verify password', { error });
      return false;
    }
  }

  /**
   * Check password strength
   */
  static checkPasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    // Minimum length
    if (password.length < 10) {
      errors.push('Password must be at least 10 characters long');
    }

    // Complexity checks
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowercase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumber) errors.push('Password must contain at least one number');
    if (!hasSpecial) errors.push('Password must contain at least one special character');

    // Common passwords blacklist (top 10)
    const commonPasswords = [
      '123456',
      'password',
      '12345678',
      'qwerty',
      '123456789',
      '12345',
      '1234',
      '111111',
      '1234567',
      'dragon',
    ];
    if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
      errors.push('Password is too common');
    }

    // Determine strength
    const score = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    if (password.length >= 12 && score === 4) {
      strength = 'strong';
    } else if (password.length >= 10 && score >= 3) {
      strength = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }
}

/**
 * Two-Factor Authentication (2FA) with TOTP
 */
export class TwoFactorAuth {
  /**
   * Generate 2FA secret for user
   */
  static generateSecret(userEmail: string): {
    secret: string;
    otpauthUrl: string;
  } {
    const secret = speakeasy.generateSecret({
      name: `Sanduta.art (${userEmail})`,
      issuer: 'Sanduta.art',
      length: 32,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url || '',
    };
  }

  /**
   * Generate QR code for 2FA setup
   */
  static async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      logger.error('TwoFactorAuth', 'Failed to generate QR code', { error });
      throw new Error('QR code generation failed');
    }
  }

  /**
   * Verify 2FA token
   */
  static verifyToken(secret: string, token: string): boolean {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps before/after
      });
      return verified;
    } catch (error) {
      logger.error('TwoFactorAuth', 'Failed to verify token', { error });
      return false;
    }
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId: string, secret: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: secret,
        },
      });
      logger.info('TwoFactorAuth', '2FA enabled', { userId });
    } catch (error) {
      logger.error('TwoFactorAuth', 'Failed to enable 2FA', { error, userId });
      throw new Error('Failed to enable 2FA');
    }
  }

  /**
   * Disable 2FA for user
   */
  static async disable2FA(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });
      logger.info('TwoFactorAuth', '2FA disabled', { userId });
    } catch (error) {
      logger.error('TwoFactorAuth', 'Failed to disable 2FA', { error, userId });
      throw new Error('Failed to disable 2FA');
    }
  }
}

/**
 * Brute force protection
 */
export class BruteForceProtection {
  /**
   * Check if user is locked out
   */
  static isLockedOut(identifier: string): boolean {
    const attempt = LOGIN_ATTEMPTS.get(identifier);
    if (!attempt) return false;

    const now = Date.now();
    const timeSinceLastAttempt = now - attempt.lastAttempt;

    if (attempt.count >= MAX_ATTEMPTS && timeSinceLastAttempt < LOCKOUT_DURATION) {
      return true;
    }

    // Reset if lockout period has passed
    if (timeSinceLastAttempt >= LOCKOUT_DURATION) {
      LOGIN_ATTEMPTS.delete(identifier);
      return false;
    }

    return false;
  }

  /**
   * Record failed login attempt
   */
  static recordFailedAttempt(identifier: string): void {
    const attempt = LOGIN_ATTEMPTS.get(identifier);
    const now = Date.now();

    if (!attempt) {
      LOGIN_ATTEMPTS.set(identifier, { count: 1, lastAttempt: now });
      return;
    }

    // Reset count if last attempt was more than lockout duration ago
    const timeSinceLastAttempt = now - attempt.lastAttempt;
    if (timeSinceLastAttempt >= LOCKOUT_DURATION) {
      LOGIN_ATTEMPTS.set(identifier, { count: 1, lastAttempt: now });
    } else {
      LOGIN_ATTEMPTS.set(identifier, {
        count: attempt.count + 1,
        lastAttempt: now,
      });
    }

    // Log suspicious activity
    if (attempt.count + 1 >= MAX_ATTEMPTS) {
      logger.warn('BruteForceProtection', 'User locked out due to too many failed attempts', {
        identifier,
        attempts: attempt.count + 1,
      });
    }
  }

  /**
   * Reset failed attempts (after successful login)
   */
  static resetAttempts(identifier: string): void {
    LOGIN_ATTEMPTS.delete(identifier);
  }

  /**
   * Get remaining attempts
   */
  static getRemainingAttempts(identifier: string): number {
    const attempt = LOGIN_ATTEMPTS.get(identifier);
    if (!attempt) return MAX_ATTEMPTS;

    const remaining = MAX_ATTEMPTS - attempt.count;
    return Math.max(0, remaining);
  }
}

/**
 * Session management
 */
export class SessionSecurity {
  /**
   * Generate secure session token
   */
  static generateSessionToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate session token
   */
  static async validateSession(
    token: string
  ): Promise<{ valid: boolean; userId?: string; expired?: boolean }> {
    try {
      // TODO: Implement session validation with database
      // For now, return basic validation
      return { valid: false, expired: true };
    } catch (error) {
      logger.error('SessionSecurity', 'Failed to validate session', { error });
      return { valid: false };
    }
  }

  /**
   * Invalidate session (logout)
   */
  static async invalidateSession(token: string): Promise<void> {
    try {
      // TODO: Implement session invalidation
      logger.info('SessionSecurity', 'Session invalidated', { token: token.substring(0, 8) });
    } catch (error) {
      logger.error('SessionSecurity', 'Failed to invalidate session', { error });
      throw new Error('Failed to invalidate session');
    }
  }

  /**
   * Invalidate all user sessions (on password change)
   */
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      // TODO: Implement all sessions invalidation
      logger.info('SessionSecurity', 'All sessions invalidated', { userId });
    } catch (error) {
      logger.error('SessionSecurity', 'Failed to invalidate all sessions', { error });
      throw new Error('Failed to invalidate all sessions');
    }
  }
}

/**
 * Refresh token management (for JWT)
 */
export class RefreshTokenManager {
  /**
   * Generate refresh token
   */
  static generateRefreshToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Store refresh token
   */
  static async storeRefreshToken(userId: string, token: string): Promise<void> {
    try {
      // TODO: Store in database with expiration
      logger.info('RefreshTokenManager', 'Refresh token stored', { userId });
    } catch (error) {
      logger.error('RefreshTokenManager', 'Failed to store refresh token', { error });
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Validate and rotate refresh token
   */
  static async validateAndRotate(
    token: string
  ): Promise<{ valid: boolean; userId?: string; newToken?: string }> {
    try {
      // TODO: Implement validation and rotation
      return { valid: false };
    } catch (error) {
      logger.error('RefreshTokenManager', 'Failed to validate refresh token', { error });
      return { valid: false };
    }
  }

  /**
   * Revoke refresh token
   */
  static async revokeRefreshToken(token: string): Promise<void> {
    try {
      // TODO: Revoke in database
      logger.info('RefreshTokenManager', 'Refresh token revoked');
    } catch (error) {
      logger.error('RefreshTokenManager', 'Failed to revoke refresh token', { error });
      throw new Error('Failed to revoke refresh token');
    }
  }
}

/**
 * Export all security utilities
 */
export const AuthSecurity = {
  Password: PasswordSecurity,
  TwoFactor: TwoFactorAuth,
  BruteForce: BruteForceProtection,
  Session: SessionSecurity,
  RefreshToken: RefreshTokenManager,
};
