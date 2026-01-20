// Feature Flags System
// src/modules/flags/useFeatureFlags.ts

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { IS_PRODUCTION, IS_STAGING, IS_DEV } from '@/lib/env';
import React from 'react';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledForUsers?: string[]; // User IDs
  enabledForRoles?: string[]; // User roles
  rolloutPercentage?: number; // 0-100
  environment?: ('development' | 'staging' | 'production')[];
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface FeatureFlagConfig {
  flags: Record<string, FeatureFlag>;
}

/**
 * Feature Flags System
 * 
 * Permite:
 * - Activare/dezactivare funcționalități
 * - Rollout gradual (percentage-based)
 * - Testare A/B
 * - Feature toggles per environment
 * - Feature toggles per user/role
 */
export class FeatureFlagsSystem {
  private flags: Map<string, FeatureFlag> = new Map();
  private cache: Map<string, boolean> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeDefaultFlags();
  }

  /**
   * Initialize default feature flags
   */
  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'new_editor',
        name: 'New Editor',
        description: 'New design editor with advanced features',
        enabled: !IS_PRODUCTION,
        environment: ['development', 'staging'],
        rolloutPercentage: IS_PRODUCTION ? 10 : 100,
      },
      {
        key: 'advanced_reports',
        name: 'Advanced Reports',
        description: 'Advanced reporting and analytics',
        enabled: true,
        enabledForRoles: ['ADMIN', 'MANAGER'],
      },
      {
        key: 'cms_system',
        name: 'CMS System',
        description: 'Content Management System',
        enabled: true,
        enabledForRoles: ['ADMIN'],
      },
      {
        key: 'theme_customizer',
        name: 'Theme Customizer',
        description: 'Live theme customization',
        enabled: true,
      },
      {
        key: 'notifications',
        name: 'Real-time Notifications',
        description: 'Real-time notification system',
        enabled: true,
      },
      {
        key: 'backup_system',
        name: 'Backup System',
        description: 'Automated backup and restore',
        enabled: true,
        enabledForRoles: ['ADMIN'],
      },
      {
        key: 'marketing_tools',
        name: 'Marketing Tools',
        description: 'Marketing automation tools',
        enabled: IS_PRODUCTION || IS_STAGING,
        enabledForRoles: ['ADMIN', 'MANAGER'],
      },
      {
        key: 'beta_features',
        name: 'Beta Features',
        description: 'Early access to beta features',
        enabled: !IS_PRODUCTION,
        environment: ['development', 'staging'],
      },
    ];

    defaultFlags.forEach((flag) => {
      this.flags.set(flag.key, flag);
    });

    logger.info('FeatureFlags:Init', 'Feature flags initialized', {
      count: defaultFlags.length,
    });
  }

  /**
   * Check if feature is enabled
   */
  async isEnabled(
    flagKey: string,
    context?: {
      userId?: string;
      userRole?: string;
      environment?: string;
    }
  ): Promise<boolean> {
    // Check cache first
    const cacheKey = this.getCacheKey(flagKey, context);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const flag = await this.getFlag(flagKey);
    if (!flag) {
      logger.warn('FeatureFlags:NotFound', 'Feature flag not found', { flagKey });
      return false;
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      this.cacheResult(cacheKey, false);
      return false;
    }

    // Check if flag is expired
    if (flag.expiresAt && flag.expiresAt < new Date()) {
      this.cacheResult(cacheKey, false);
      return false;
    }

    // Check environment
    if (flag.environment && flag.environment.length > 0) {
      const currentEnv = this.getCurrentEnvironment();
      if (!flag.environment.includes(currentEnv as any)) {
        this.cacheResult(cacheKey, false);
        return false;
      }
    }

    // Check user-specific flags
    if (context?.userId && flag.enabledForUsers) {
      const enabled = flag.enabledForUsers.includes(context.userId);
      this.cacheResult(cacheKey, enabled);
      return enabled;
    }

    // Check role-specific flags
    if (context?.userRole && flag.enabledForRoles) {
      const enabled = flag.enabledForRoles.includes(context.userRole);
      this.cacheResult(cacheKey, enabled);
      return enabled;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const enabled = this.checkRollout(flagKey, context?.userId, flag.rolloutPercentage);
      this.cacheResult(cacheKey, enabled);
      return enabled;
    }

    // Default to enabled if no restrictions
    this.cacheResult(cacheKey, true);
    return true;
  }

  /**
   * Get feature flag
   */
  private async getFlag(flagKey: string): Promise<FeatureFlag | null> {
    // Check in-memory flags first
    if (this.flags.has(flagKey)) {
      return this.flags.get(flagKey)!;
    }

    // TODO: Load from database if available
    try {
      // await prisma.featureFlag.findUnique({ where: { key: flagKey } });
      logger.debug('FeatureFlags:GetFlag', 'Loading flag from database', { flagKey });
    } catch (_error) {
      logger.error('FeatureFlags:GetFlag:Failed', 'Failed to load flag', {
        error,
        flagKey,
      });
    }

    return null;
  }

  /**
   * Check rollout percentage
   */
  private checkRollout(
    flagKey: string,
    userId: string | undefined,
    percentage: number
  ): boolean {
    // Use consistent hashing for same user
    const hash = this.hashString(`${flagKey}:${userId || 'anonymous'}`);
    const userPercentage = (hash % 100) + 1;
    return userPercentage <= percentage;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get current environment
   */
  private getCurrentEnvironment(): string {
    if (IS_PRODUCTION) return 'production';
    if (IS_STAGING) return 'staging';
    return 'development';
  }

  /**
   * Get cache key
   */
  private getCacheKey(
    flagKey: string,
    context?: {
      userId?: string;
      userRole?: string;
    }
  ): string {
    return `${flagKey}:${context?.userId || 'anon'}:${context?.userRole || 'none'}`;
  }

  /**
   * Cache result
   */
  private cacheResult(cacheKey: string, result: boolean): void {
    this.cache.set(cacheKey, result);

    // Auto-expire cache
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, this.cacheExpiry);
  }

  /**
   * Set feature flag
   */
  async setFlag(flag: FeatureFlag): Promise<void> {
    this.flags.set(flag.key, flag);

    // TODO: Save to database
    try {
      logger.info('FeatureFlags:SetFlag', 'Feature flag updated', {
        key: flag.key,
        enabled: flag.enabled,
      });
    } catch (_error) {
      logger.error('FeatureFlags:SetFlag:Failed', 'Failed to update flag', {
        error,
        flag,
      });
    }

    // Clear cache for this flag
    this.clearFlagCache(flag.key);
  }

  /**
   * Enable feature flag
   */
  async enableFlag(flagKey: string): Promise<void> {
    const flag = await this.getFlag(flagKey);
    if (flag) {
      flag.enabled = true;
      await this.setFlag(flag);
    }
  }

  /**
   * Disable feature flag
   */
  async disableFlag(flagKey: string): Promise<void> {
    const flag = await this.getFlag(flagKey);
    if (flag) {
      flag.enabled = false;
      await this.setFlag(flag);
    }
  }

  /**
   * Update rollout percentage
   */
  async setRolloutPercentage(flagKey: string, percentage: number): Promise<void> {
    const flag = await this.getFlag(flagKey);
    if (flag) {
      flag.rolloutPercentage = Math.max(0, Math.min(100, percentage));
      await this.setFlag(flag);
      
      logger.info('FeatureFlags:SetRollout', 'Rollout percentage updated', {
        flagKey,
        percentage: flag.rolloutPercentage,
      });
    }
  }

  /**
   * Add user to feature flag
   */
  async addUserToFlag(flagKey: string, userId: string): Promise<void> {
    const flag = await this.getFlag(flagKey);
    if (flag) {
      flag.enabledForUsers = flag.enabledForUsers || [];
      if (!flag.enabledForUsers.includes(userId)) {
        flag.enabledForUsers.push(userId);
        await this.setFlag(flag);
      }
    }
  }

  /**
   * Remove user from feature flag
   */
  async removeUserFromFlag(flagKey: string, userId: string): Promise<void> {
    const flag = await this.getFlag(flagKey);
    if (flag) {
      flag.enabledForUsers = (flag.enabledForUsers || []).filter((id) => id !== userId);
      await this.setFlag(flag);
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    return Array.from(this.flags.values());
  }

  /**
   * Get flags for user
   */
  async getFlagsForUser(userId: string, userRole: string): Promise<Record<string, boolean>> {
    const flags = await this.getAllFlags();
    const result: Record<string, boolean> = {};

    for (const flag of flags) {
      result[flag.key] = await this.isEnabled(flag.key, { userId, userRole });
    }

    return result;
  }

  /**
   * Clear cache for specific flag
   */
  private clearFlagCache(flagKey: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${flagKey}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('FeatureFlags:ClearCache', 'Cache cleared');
  }

  /**
   * Export flags configuration
   */
  async exportConfig(): Promise<FeatureFlagConfig> {
    const flags = await this.getAllFlags();
    const config: FeatureFlagConfig = {
      flags: {},
    };

    flags.forEach((flag) => {
      config.flags[flag.key] = flag;
    });

    return config;
  }

  /**
   * Import flags configuration
   */
  async importConfig(config: FeatureFlagConfig): Promise<void> {
    for (const [key, flag] of Object.entries(config.flags)) {
      await this.setFlag(flag);
    }

    logger.info('FeatureFlags:Import', 'Configuration imported', {
      count: Object.keys(config.flags).length,
    });
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagsSystem();

// React hook for feature flags
export function useFeatureFlags() {
  const [flags, setFlags] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      // Get user context from session
      // const session = await getSession();
      // const userId = session?.user?.id;
      // const userRole = session?.user?.role;

      // For now, load flags without user context
      const allFlags = await featureFlags.getAllFlags();
      const flagsState: Record<string, boolean> = {};

      for (const flag of allFlags) {
        flagsState[flag.key] = await featureFlags.isEnabled(flag.key);
      }

      setFlags(flagsState);
    } catch (_error) {
      logger.error('useFeatureFlags', 'Failed to load flags', { error });
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (flagKey: string): boolean => {
    return flags[flagKey] || false;
  };

  const refresh = async () => {
    setLoading(true);
    await loadFlags();
  };

  return {
    flags,
    isEnabled,
    loading,
    refresh,
  };
}

// Simple helper for checking flags in components
export function useFeatureFlag(flagKey: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagKey);
}

// Server-side helper
export async function checkFeatureFlag(
  flagKey: string,
  context?: {
    userId?: string;
    userRole?: string;
  }
): Promise<boolean> {
  return await featureFlags.isEnabled(flagKey, context);
}

// CLI helper
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const flagKey = args[1];

  switch (command) {
    case 'list':
      featureFlags.getAllFlags().then((flags) => {
        console.log('Feature Flags:');
        flags.forEach((flag) => {
          console.log(`- ${flag.key}: ${flag.enabled ? '✅' : '❌'} (${flag.name})`);
        });
      });
      break;

    case 'enable':
      if (!flagKey) {
        console.error('Usage: node useFeatureFlags.js enable <flag-key>');
        process.exit(1);
      }
      featureFlags.enableFlag(flagKey).then(() => {
        console.log(`✅ Flag "${flagKey}" enabled`);
      });
      break;

    case 'disable':
      if (!flagKey) {
        console.error('Usage: node useFeatureFlags.js disable <flag-key>');
        process.exit(1);
      }
      featureFlags.disableFlag(flagKey).then(() => {
        console.log(`❌ Flag "${flagKey}" disabled`);
      });
      break;

    case 'rollout':
      const percentage = parseInt(args[2], 10);
      if (!flagKey || isNaN(percentage)) {
        console.error('Usage: node useFeatureFlags.js rollout <flag-key> <percentage>');
        process.exit(1);
      }
      featureFlags.setRolloutPercentage(flagKey, percentage).then(() => {
        console.log(`📊 Flag "${flagKey}" rollout set to ${percentage}%`);
      });
      break;

    case 'export':
      featureFlags.exportConfig().then((config) => {
        console.log(JSON.stringify(config, null, 2));
      });
      break;

    default:
      console.log(`
Feature Flags CLI

Commands:
  list                          List all feature flags
  enable <flag-key>             Enable a feature flag
  disable <flag-key>            Disable a feature flag
  rollout <flag-key> <percent>  Set rollout percentage
  export                        Export flags configuration
      `);
  }
}
