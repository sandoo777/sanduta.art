/**
 * Password Policy & Validation
 * Enterprise-grade password requirements
 */

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

/**
 * Password policy configuration
 */
export const PASSWORD_POLICY = {
  minLength: 10,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true, // Prevent passwords containing username/email
  expirationDays: 0, // 0 = no expiration, or set to 90 for 90 days
  historyCount: 5, // Remember last 5 passwords
};

/**
 * Top 100 most common passwords (blacklist)
 */
const COMMON_PASSWORDS = [
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
  '123123',
  'baseball',
  'iloveyou',
  'trustno1',
  '1234567890',
  'sunshine',
  'master',
  '123123123',
  'welcome',
  'shadow',
  'ashley',
  'football',
  'jesus',
  'michael',
  'ninja',
  'mustang',
  'password1',
  '123456789',
  'abc123',
  'letmein',
  'monkey',
  '1qaz2wsx',
  'admin',
  'qwertyuiop',
  'solo',
  'passw0rd',
  'starwars',
];

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
}

/**
 * Password Policy Validator
 */
export class PasswordPolicy {
  /**
   * Validate password against policy
   */
  static validate(password: string, userInfo?: { email?: string; name?: string }): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // 1. Length check
    if (password.length < PASSWORD_POLICY.minLength) {
      errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
    } else {
      score += Math.min((password.length - PASSWORD_POLICY.minLength) * 5, 20);
    }

    if (password.length > PASSWORD_POLICY.maxLength) {
      errors.push(`Password must not exceed ${PASSWORD_POLICY.maxLength} characters`);
    }

    // 2. Uppercase check
    if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 15;
    }

    // 3. Lowercase check
    if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 15;
    }

    // 4. Numbers check
    if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (/[0-9]/.test(password)) {
      score += 15;
    }

    // 5. Special characters check
    if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 15;
    }

    // 6. Common passwords check
    if (PASSWORD_POLICY.preventCommonPasswords) {
      const lowerPassword = password.toLowerCase();
      if (COMMON_PASSWORDS.some((common) => lowerPassword === common || lowerPassword.includes(common))) {
        errors.push('Password is too common and easily guessable');
        score -= 30;
      } else {
        score += 10;
      }
    }

    // 7. User info check
    if (PASSWORD_POLICY.preventUserInfo && userInfo) {
      const lowerPassword = password.toLowerCase();
      if (userInfo.email) {
        const emailPrefix = userInfo.email.split('@')[0].toLowerCase();
        if (lowerPassword.includes(emailPrefix)) {
          errors.push('Password cannot contain your email address');
          score -= 20;
        }
      }
      if (userInfo.name) {
        const nameParts = userInfo.name.toLowerCase().split(' ');
        if (nameParts.some((part) => part.length > 3 && lowerPassword.includes(part))) {
          errors.push('Password cannot contain your name');
          score -= 20;
        }
      }
    }

    // 8. Pattern detection (sequential, repeated)
    if (/(.)\1{2,}/.test(password)) {
      // Repeated characters (e.g., "aaa", "111")
      errors.push('Password contains too many repeated characters');
      score -= 10;
    }

    if (/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
      // Sequential characters
      errors.push('Password contains sequential characters');
      score -= 10;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine strength
    let strength: PasswordValidationResult['strength'] = 'very-weak';
    if (score >= 80) strength = 'very-strong';
    else if (score >= 60) strength = 'strong';
    else if (score >= 40) strength = 'medium';
    else if (score >= 20) strength = 'weak';

    if (errors.length > 0) {
      logger.warn('PasswordPolicy', 'Password validation failed', {
        errors: errors.length,
        strength,
        score,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
      score,
    };
  }

  /**
   * Check password expiration
   */
  static async isPasswordExpired(userId: string): Promise<boolean> {
    if (PASSWORD_POLICY.expirationDays === 0) {
      return false; // No expiration
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { updatedAt: true }, // TODO: Add passwordChangedAt field to User model
      });

      if (!user || !user.updatedAt) {
        return false; // No password change date, consider not expired
      }

      const daysSinceChange = Math.floor(
        (Date.now() - user.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSinceChange > PASSWORD_POLICY.expirationDays;
    } catch (error) {
      logger.error('PasswordPolicy', 'Failed to check password expiration', { error, userId });
      return false;
    }
  }

  /**
   * Check password history (prevent reuse)
   */
  static async isPasswordInHistory(userId: string, newPasswordHash: string): Promise<boolean> {
    if (PASSWORD_POLICY.historyCount === 0) {
      return false; // No history tracking
    }

    try {
      // TODO: Implement password history table
      // For now, return false
      return false;
    } catch (error) {
      logger.error('PasswordPolicy', 'Failed to check password history', { error, userId });
      return false;
    }
  }

  /**
   * Force password change on next login
   */
  static async forcePasswordChange(userId: string): Promise<void> {
    try {
      // TODO: Add passwordExpired field to User model
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: { passwordExpired: true },
      // });
      logger.info('PasswordPolicy', 'Password change forced', { userId });
    } catch (error) {
      logger.error('PasswordPolicy', 'Failed to force password change', { error, userId });
      throw new Error('Failed to force password change');
    }
  }

  /**
   * Get password policy for display
   */
  static getPolicy(): typeof PASSWORD_POLICY {
    return { ...PASSWORD_POLICY };
  }

  /**
   * Generate password requirements message
   */
  static getRequirementsMessage(): string {
    const requirements: string[] = [];

    requirements.push(`At least ${PASSWORD_POLICY.minLength} characters long`);

    if (PASSWORD_POLICY.requireUppercase) {
      requirements.push('At least one uppercase letter (A-Z)');
    }

    if (PASSWORD_POLICY.requireLowercase) {
      requirements.push('At least one lowercase letter (a-z)');
    }

    if (PASSWORD_POLICY.requireNumbers) {
      requirements.push('At least one number (0-9)');
    }

    if (PASSWORD_POLICY.requireSpecialChars) {
      requirements.push('At least one special character (!@#$%^&*...)');
    }

    if (PASSWORD_POLICY.preventCommonPasswords) {
      requirements.push('Must not be a common password');
    }

    if (PASSWORD_POLICY.preventUserInfo) {
      requirements.push('Must not contain your email or name');
    }

    return 'Password requirements:\n- ' + requirements.join('\n- ');
  }
}

/**
 * Password strength meter
 */
export function getPasswordStrengthLabel(score: number): string {
  if (score >= 80) return 'Very Strong 💪';
  if (score >= 60) return 'Strong 👍';
  if (score >= 40) return 'Medium 😐';
  if (score >= 20) return 'Weak 👎';
  return 'Very Weak 😱';
}

/**
 * Password strength color
 */
export function getPasswordStrengthColor(score: number): string {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#3b82f6'; // Blue
  if (score >= 40) return '#f59e0b'; // Orange
  if (score >= 20) return '#ef4444'; // Red
  return '#991b1b'; // Dark Red
}
