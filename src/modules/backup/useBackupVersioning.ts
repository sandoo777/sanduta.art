/**
 * Backup Versioning System
 * 
 * Gestionează versiunile de backup:
 * - List versions (toate versiunile pentru un backup)
 * - Compare versions (diff între versiuni)
 * - Restore specific version
 * - Retention policy enforcement (30/84/365 days)
 * - Version tagging (stable/beta/rollback)
 */

import { BackupEngine, BackupMetadata, BackupCategory } from './useBackupEngine';
import { logger } from '@/lib/logger';

export enum VersionTag {
  STABLE = 'STABLE',
  BETA = 'BETA',
  ROLLBACK = 'ROLLBACK',
  MILESTONE = 'MILESTONE',
  PRE_DEPLOYMENT = 'PRE_DEPLOYMENT',
  POST_DEPLOYMENT = 'POST_DEPLOYMENT',
}

export interface BackupVersion {
  id: string;
  backupId: string;
  version: number;
  tag?: VersionTag;
  createdAt: Date;
  size: number;
  category: BackupCategory;
  metadata: BackupMetadata;
  parent?: string; // Parent version for incrementals
  changes?: VersionChanges;
}

export interface VersionChanges {
  added: number;
  modified: number;
  deleted: number;
  details: {
    tables?: string[];
    files?: string[];
    configs?: string[];
  };
}

export interface VersionComparison {
  version1: BackupVersion;
  version2: BackupVersion;
  differences: {
    database?: {
      tablesAdded: string[];
      tablesRemoved: string[];
      rowsChanged: Record<string, number>;
    };
    files?: {
      filesAdded: string[];
      filesRemoved: string[];
      filesModified: string[];
    };
    config?: {
      settingsAdded: string[];
      settingsRemoved: string[];
      settingsModified: string[];
    };
  };
  similarity: number; // 0-100%
}

export class BackupVersioning {
  /**
   * List all versions for a backup ID or category
   */
  static async listVersions(
    filter?: { backupId?: string; category?: BackupCategory; tag?: VersionTag }
  ): Promise<BackupVersion[]> {
    try {
      const allBackups = await BackupEngine.listBackups(filter?.category);

      // Convert to versions
      const versions: BackupVersion[] = allBackups.map((backup, idx) => ({
        id: backup.id,
        backupId: backup.id,
        version: idx + 1,
        tag: this.inferTag(backup),
        createdAt: new Date(backup.createdAt),
        size: backup.size || 0,
        category: backup.category,
        metadata: backup,
      }));

      // Filter by tag if specified
      if (filter?.tag) {
        return versions.filter(v => v.tag === filter.tag);
      }

      // Sort by version (newest first)
      return versions.sort((a, b) => b.version - a.version);
    } catch (error) {
      logger.error('BackupVersioning', 'Failed to list versions', { error, filter });
      throw error;
    }
  }

  /**
   * Get specific version by ID
   */
  static async getVersion(backupId: string): Promise<BackupVersion | null> {
    try {
      const allBackups = await BackupEngine.listBackups();
      const backup = allBackups.find(b => b.id === backupId);

      if (!backup) {
        return null;
      }

      const versions = await this.listVersions();
      const versionNumber = versions.findIndex(v => v.id === backupId) + 1;

      return {
        id: backup.id,
        backupId: backup.id,
        version: versionNumber,
        tag: this.inferTag(backup),
        createdAt: new Date(backup.createdAt),
        size: backup.size || 0,
        category: backup.category,
        metadata: backup,
      };
    } catch (error) {
      logger.error('BackupVersioning', 'Failed to get version', { error, backupId });
      throw error;
    }
  }

  /**
   * Compare two versions
   */
  static async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<VersionComparison> {
    try {
      const v1 = await this.getVersion(version1Id);
      const v2 = await this.getVersion(version2Id);

      if (!v1 || !v2) {
        throw new Error('One or both versions not found');
      }

      logger.info('BackupVersioning', 'Comparing versions', {
        v1: version1Id,
        v2: version2Id,
      });

      // Compare database
      const dbDiff = await this.compareDatabase(v1, v2);

      // Compare files
      const filesDiff = await this.compareFiles(v1, v2);

      // Compare config
      const configDiff = await this.compareConfig(v1, v2);

      // Calculate similarity
      const similarity = this.calculateSimilarity(dbDiff, filesDiff, configDiff);

      return {
        version1: v1,
        version2: v2,
        differences: {
          database: dbDiff,
          files: filesDiff,
          config: configDiff,
        },
        similarity,
      };
    } catch (error) {
      logger.error('BackupVersioning', 'Failed to compare versions', {
        error,
        version1Id,
        version2Id,
      });
      throw error;
    }
  }

  /**
   * Tag a version
   */
  static async tagVersion(backupId: string, tag: VersionTag): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      // Load metadata
      const metadataFile = path.join(
        BackupEngine['config'].basePath,
        backupId,
        'metadata.json'
      );
      const metadata = JSON.parse(await fs.readFile(metadataFile, 'utf-8'));

      // Add tag
      metadata.tags = metadata.tags || [];
      if (!metadata.tags.includes(tag)) {
        metadata.tags.push(tag);
      }

      // Save metadata
      await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));

      logger.info('BackupVersioning', 'Version tagged', { backupId, tag });
    } catch (error) {
      logger.error('BackupVersioning', 'Failed to tag version', { error, backupId, tag });
      throw error;
    }
  }

  /**
   * Delete old versions according to retention policy
   */
  static async enforceRetentionPolicy(): Promise<{
    deleted: number;
    kept: number;
    errors: string[];
  }> {
    try {
      const now = Date.now();
      const allVersions = await this.listVersions();

      const retentionRules = [
        { age: 30 * 24 * 60 * 60 * 1000, keep: 'daily' }, // 30 days: keep daily
        { age: 84 * 24 * 60 * 60 * 1000, keep: 'weekly' }, // 84 days: keep weekly
        { age: 365 * 24 * 60 * 60 * 1000, keep: 'monthly' }, // 365 days: keep monthly
      ];

      const toDelete: string[] = [];
      const toKeep: string[] = [];
      const errors: string[] = [];

      for (const version of allVersions) {
        const age = now - version.createdAt.getTime();

        // Always keep tagged versions
        if (version.tag && version.tag !== VersionTag.BETA) {
          toKeep.push(version.id);
          continue;
        }

        // Apply retention rules
        let shouldKeep = false;
        for (const rule of retentionRules) {
          if (age < rule.age) {
            shouldKeep = true;
            break;
          }
        }

        // If older than 365 days, delete unless it's a milestone
        if (age > 365 * 24 * 60 * 60 * 1000 && version.tag !== VersionTag.MILESTONE) {
          toDelete.push(version.id);
        } else if (shouldKeep) {
          toKeep.push(version.id);
        } else {
          toDelete.push(version.id);
        }
      }

      // Delete old versions
      for (const backupId of toDelete) {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const backupDir = path.join(BackupEngine['config'].basePath, backupId);
          await fs.rm(backupDir, { recursive: true, force: true });
          logger.info('BackupVersioning', 'Version deleted', { backupId });
        } catch (error) {
          const err = error instanceof Error ? error.message : String(error);
          errors.push(`Failed to delete ${backupId}: ${err}`);
          logger.error('BackupVersioning', 'Failed to delete version', { error, backupId });
        }
      }

      logger.info('BackupVersioning', 'Retention policy enforced', {
        deleted: toDelete.length,
        kept: toKeep.length,
        errors: errors.length,
      });

      return {
        deleted: toDelete.length,
        kept: toKeep.length,
        errors,
      };
    } catch (error) {
      logger.error('BackupVersioning', 'Failed to enforce retention policy', { error });
      throw error;
    }
  }

  /**
   * Get version history (changelog)
   */
  static async getVersionHistory(limit = 20): Promise<BackupVersion[]> {
    try {
      const versions = await this.listVersions();
      return versions.slice(0, limit);
    } catch (error) {
      logger.error('BackupVersioning', 'Failed to get version history', { error });
      throw error;
    }
  }

  /**
   * Rollback to specific version
   */
  static async rollbackToVersion(
    backupId: string,
    options?: { skipFiles?: boolean; skipConfig?: boolean }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const RestoreEngine = await import('./useRestore').then(m => m.RestoreEngine);

      logger.info('BackupVersioning', 'Rolling back to version', { backupId, options });

      // Tag current state before rollback
      const currentBackup = await BackupEngine.createFullBackup();
      if (currentBackup.metadata) {
        await this.tagVersion(currentBackup.metadata.id, VersionTag.ROLLBACK);
      }

      // Restore selected version
      const result = await RestoreEngine.restore(backupId, 'FULL' as any);

      if (result.success) {
        logger.info('BackupVersioning', 'Rollback successful', { backupId });
        return {
          success: true,
          message: `Successfully rolled back to version ${backupId}`,
        };
      } else {
        throw new Error(result.error || 'Rollback failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('BackupVersioning', 'Rollback failed', { error, backupId });
      return {
        success: false,
        message: `Rollback failed: ${message}`,
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Infer tag from backup metadata
   */
  private static inferTag(backup: BackupMetadata): VersionTag | undefined {
    if (backup.tags?.includes(VersionTag.STABLE)) return VersionTag.STABLE;
    if (backup.tags?.includes(VersionTag.MILESTONE)) return VersionTag.MILESTONE;
    if (backup.tags?.includes(VersionTag.ROLLBACK)) return VersionTag.ROLLBACK;
    if (backup.tags?.includes(VersionTag.PRE_DEPLOYMENT)) return VersionTag.PRE_DEPLOYMENT;
    if (backup.tags?.includes(VersionTag.POST_DEPLOYMENT)) return VersionTag.POST_DEPLOYMENT;
    return undefined;
  }

  /**
   * Compare database between versions
   */
  private static async compareDatabase(v1: BackupVersion, v2: BackupVersion) {
    // Simplified comparison (would need full DB diff in production)
    return {
      tablesAdded: [],
      tablesRemoved: [],
      rowsChanged: {},
    };
  }

  /**
   * Compare files between versions
   */
  private static async compareFiles(v1: BackupVersion, v2: BackupVersion) {
    // Simplified comparison
    return {
      filesAdded: [],
      filesRemoved: [],
      filesModified: [],
    };
  }

  /**
   * Compare config between versions
   */
  private static async compareConfig(v1: BackupVersion, v2: BackupVersion) {
    // Simplified comparison
    return {
      settingsAdded: [],
      settingsRemoved: [],
      settingsModified: [],
    };
  }

  /**
   * Calculate similarity percentage
   */
  private static calculateSimilarity(dbDiff: any, filesDiff: any, configDiff: any): number {
    // Simplified calculation (would be more sophisticated in production)
    const totalChanges =
      (dbDiff?.tablesAdded?.length || 0) +
      (dbDiff?.tablesRemoved?.length || 0) +
      (filesDiff?.filesAdded?.length || 0) +
      (filesDiff?.filesRemoved?.length || 0) +
      (filesDiff?.filesModified?.length || 0) +
      (configDiff?.settingsAdded?.length || 0) +
      (configDiff?.settingsRemoved?.length || 0) +
      (configDiff?.settingsModified?.length || 0);

    // If no changes, 100% similar
    if (totalChanges === 0) return 100;

    // Otherwise calculate based on changes (simplified)
    return Math.max(0, 100 - totalChanges * 5);
  }
}
