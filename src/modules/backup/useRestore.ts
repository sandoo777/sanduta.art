/**
 * Restore System
 * Handles full, partial, and granular restore operations
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { logger } from '@/lib/logger';
import { BackupEngine, BackupMetadata, BackupCategory } from './useBackupEngine';
import { prisma } from '@/lib/prisma';

const execAsync = promisify(exec);

/**
 * Restore modes
 */
export enum RestoreMode {
  FULL = 'FULL', // DB + Files + Config
  DATABASE_ONLY = 'DATABASE_ONLY',
  FILES_ONLY = 'FILES_ONLY',
  CONFIG_ONLY = 'CONFIG_ONLY',
  GRANULAR = 'GRANULAR', // Specific items only
}

/**
 * Restore status
 */
export enum RestoreStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Restore result interface
 */
export interface RestoreResult {
  success: boolean;
  mode: RestoreMode;
  backupId: string;
  restoredAt: Date;
  duration: number; // milliseconds
  details: {
    database?: boolean;
    files?: boolean;
    config?: boolean;
    granular?: string[];
  };
  error?: string;
}

/**
 * Restore Engine Class
 */
export class RestoreEngine {
  /**
   * Restore full backup (DB + Files + Config)
   */
  static async restoreFull(backupId: string): Promise<RestoreResult> {
    const startTime = Date.now();

    logger.info('RestoreEngine', 'Starting full restore', { backupId });

    try {
      // Get backup metadata
      const backups = await BackupEngine.listBackups();
      const backup = backups.find((b) => b.id === backupId);

      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      // Restore database
      await this.restoreDatabase(backup);

      // Restore files
      await this.restoreFiles(backup);

      // Restore config
      await this.restoreConfig(backup);

      const duration = Date.now() - startTime;

      logger.info('RestoreEngine', 'Full restore completed', {
        backupId,
        duration,
      });

      return {
        success: true,
        mode: RestoreMode.FULL,
        backupId,
        restoredAt: new Date(),
        duration,
        details: {
          database: true,
          files: true,
          config: true,
        },
      };
    } catch (_error) {
      logger.error('RestoreEngine', 'Full restore failed', { error, backupId });

      return {
        success: false,
        mode: RestoreMode.FULL,
        backupId,
        restoredAt: new Date(),
        duration: Date.now() - startTime,
        details: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Restore database only
   */
  static async restoreDatabaseOnly(backupId: string): Promise<RestoreResult> {
    const startTime = Date.now();

    logger.info('RestoreEngine', 'Starting database restore', { backupId });

    try {
      const backups = await BackupEngine.listBackups();
      const backup = backups.find((b) => b.id === backupId);

      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      await this.restoreDatabase(backup);

      const duration = Date.now() - startTime;

      return {
        success: true,
        mode: RestoreMode.DATABASE_ONLY,
        backupId,
        restoredAt: new Date(),
        duration,
        details: { database: true },
      };
    } catch (_error) {
      return {
        success: false,
        mode: RestoreMode.DATABASE_ONLY,
        backupId,
        restoredAt: new Date(),
        duration: Date.now() - startTime,
        details: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Restore files only
   */
  static async restoreFilesOnly(backupId: string): Promise<RestoreResult> {
    const startTime = Date.now();

    logger.info('RestoreEngine', 'Starting files restore', { backupId });

    try {
      const backups = await BackupEngine.listBackups();
      const backup = backups.find((b) => b.id === backupId);

      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      await this.restoreFiles(backup);

      const duration = Date.now() - startTime;

      return {
        success: true,
        mode: RestoreMode.FILES_ONLY,
        backupId,
        restoredAt: new Date(),
        duration,
        details: { files: true },
      };
    } catch (_error) {
      return {
        success: false,
        mode: RestoreMode.FILES_ONLY,
        backupId,
        restoredAt: new Date(),
        duration: Date.now() - startTime,
        details: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Granular restore (specific items only)
   */
  static async restoreGranular(
    backupId: string,
    items: { type: 'product' | 'category' | 'user'; id: string }[]
  ): Promise<RestoreResult> {
    const startTime = Date.now();

    logger.info('RestoreEngine', 'Starting granular restore', {
      backupId,
      items,
    });

    try {
      const backups = await BackupEngine.listBackups();
      const backup = backups.find((b) => b.id === backupId);

      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      // Decrypt and decompress config file
      const configFile = `${backup.path}/config.json.gz.enc`;
      const decryptedFile = `${backup.path}/config.json.gz`;
      const decompressedFile = `${backup.path}/config.json`;

      await BackupEngine.decryptFile(configFile, decryptedFile);
      await BackupEngine.decompressFile(decryptedFile, decompressedFile);

      // Read config
      const config = JSON.parse(await fs.readFile(decompressedFile, 'utf-8'));

      const restoredItems: string[] = [];

      // Restore specific items
      for (const item of items) {
        if (item.type === 'product') {
          const product = config.products.find((p: any) => p.id === item.id);
          if (product) {
            // Restore product (upsert)
            await prisma.product.upsert({
              where: { id: product.id },
              create: product,
              update: product,
            });
            restoredItems.push(`product:${item.id}`);
          }
        } else if (item.type === 'category') {
          const category = config.categories.find((c: any) => c.id === item.id);
          if (category) {
            await prisma.category.upsert({
              where: { id: category.id },
              create: category,
              update: category,
            });
            restoredItems.push(`category:${item.id}`);
          }
        } else if (item.type === 'user') {
          const user = config.users.find((u: any) => u.id === item.id);
          if (user) {
            await prisma.user.upsert({
              where: { id: user.id },
              create: user as any,
              update: user as any,
            });
            restoredItems.push(`user:${item.id}`);
          }
        }
      }

      // Cleanup temp files
      await fs.unlink(decryptedFile);
      await fs.unlink(decompressedFile);

      const duration = Date.now() - startTime;

      logger.info('RestoreEngine', 'Granular restore completed', {
        backupId,
        restoredItems,
        duration,
      });

      return {
        success: true,
        mode: RestoreMode.GRANULAR,
        backupId,
        restoredAt: new Date(),
        duration,
        details: { granular: restoredItems },
      };
    } catch (_error) {
      logger.error('RestoreEngine', 'Granular restore failed', { error, backupId });

      return {
        success: false,
        mode: RestoreMode.GRANULAR,
        backupId,
        restoredAt: new Date(),
        duration: Date.now() - startTime,
        details: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Internal: Restore database from backup
   */
  private static async restoreDatabase(backup: BackupMetadata): Promise<void> {
    logger.info('RestoreEngine', 'Restoring database', { backupId: backup.id });

    const dbFile = `${backup.path}/database.sql.gz.enc`;
    const decryptedFile = `${backup.path}/database.sql.gz`;
    const decompressedFile = `${backup.path}/database.sql`;

    try {
      // Decrypt
      await BackupEngine.decryptFile(dbFile, decryptedFile);

      // Decompress
      await BackupEngine.decompressFile(decryptedFile, decompressedFile);

      // Restore database
      const restoreCommand = `pg_restore -h localhost -p 5432 -U postgres -d sanduta -c ${decompressedFile}`;

      await execAsync(restoreCommand, {
        env: { ...process.env, PGPASSWORD: process.env.DATABASE_PASSWORD },
      });

      // Cleanup temp files
      await fs.unlink(decryptedFile);
      await fs.unlink(decompressedFile);

      logger.info('RestoreEngine', 'Database restored successfully');
    } catch (_error) {
      logger.error('RestoreEngine', 'Database restore failed', { error });
      throw error;
    }
  }

  /**
   * Internal: Restore files from backup
   */
  private static async restoreFiles(backup: BackupMetadata): Promise<void> {
    logger.info('RestoreEngine', 'Restoring files', { backupId: backup.id });

    const filesArchive = `${backup.path}/files.tar.gz.enc`;
    const decryptedArchive = `${backup.path}/files.tar.gz`;
    const decompressedArchive = `${backup.path}/files.tar`;

    try {
      // Decrypt
      await BackupEngine.decryptFile(filesArchive, decryptedArchive);

      // Decompress
      await BackupEngine.decompressFile(decryptedArchive, decompressedArchive);

      // Extract tar archive
      const extractCommand = `tar -xf ${decompressedArchive} -C /`;
      await execAsync(extractCommand);

      // Cleanup temp files
      await fs.unlink(decryptedArchive);
      await fs.unlink(decompressedArchive);

      logger.info('RestoreEngine', 'Files restored successfully');
    } catch (_error) {
      logger.error('RestoreEngine', 'Files restore failed', { error });
      throw error;
    }
  }

  /**
   * Internal: Restore config from backup
   */
  private static async restoreConfig(backup: BackupMetadata): Promise<void> {
    logger.info('RestoreEngine', 'Restoring config', { backupId: backup.id });

    const configFile = `${backup.path}/config.json.gz.enc`;
    const decryptedFile = `${backup.path}/config.json.gz`;
    const decompressedFile = `${backup.path}/config.json`;

    try {
      // Decrypt
      await BackupEngine.decryptFile(configFile, decryptedFile);

      // Decompress
      await BackupEngine.decompressFile(decryptedFile, decompressedFile);

      // Read config
      const config = JSON.parse(await fs.readFile(decompressedFile, 'utf-8'));

      // Restore configurations to database
      // Note: This will overwrite existing data

      // Restore users
      if (config.users) {
        for (const user of config.users) {
          await prisma.user.upsert({
            where: { id: user.id },
            create: user as any,
            update: user as any,
          });
        }
      }

      // Restore categories
      if (config.categories) {
        for (const category of config.categories) {
          await prisma.category.upsert({
            where: { id: category.id },
            create: category,
            update: category,
          });
        }
      }

      // Restore products
      if (config.products) {
        for (const product of config.products) {
          await prisma.product.upsert({
            where: { id: product.id },
            create: product as any,
            update: product as any,
          });
        }
      }

      // Cleanup temp files
      await fs.unlink(decryptedFile);
      await fs.unlink(decompressedFile);

      logger.info('RestoreEngine', 'Config restored successfully');
    } catch (_error) {
      logger.error('RestoreEngine', 'Config restore failed', { error });
      throw error;
    }
  }

  /**
   * Test restore (dry run) - doesn't actually restore
   */
  static async testRestore(backupId: string): Promise<boolean> {
    logger.info('RestoreEngine', 'Testing restore', { backupId });

    try {
      const backups = await BackupEngine.listBackups();
      const backup = backups.find((b) => b.id === backupId);

      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      // Verify backup files exist
      const dbFile = `${backup.path}/database.sql.gz.enc`;
      const filesArchive = `${backup.path}/files.tar.gz.enc`;
      const configFile = `${backup.path}/config.json.gz.enc`;

      await fs.access(dbFile);
      await fs.access(filesArchive);
      await fs.access(configFile);

      // Verify checksum
      const currentChecksum = await BackupEngine.calculateChecksum(backup.path);
      if (currentChecksum !== backup.checksum) {
        throw new Error('Backup checksum mismatch - backup may be corrupted');
      }

      logger.info('RestoreEngine', 'Restore test passed', { backupId });
      return true;
    } catch (_error) {
      logger.error('RestoreEngine', 'Restore test failed', { error, backupId });
      return false;
    }
  }
}

/**
 * Singleton instance
 */
export const restoreEngine = RestoreEngine;
