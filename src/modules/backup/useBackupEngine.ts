/**
 * Backup Engine - Core Backup System
 * Handles database, files, configurations, and restore operations
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const execAsync = promisify(exec);
const pipelineAsync = promisify(pipeline);

/**
 * Backup types
 */
export enum BackupType {
  FULL = 'FULL',
  INCREMENTAL = 'INCREMENTAL',
  MANUAL = 'MANUAL',
}

export enum BackupStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum BackupCategory {
  DATABASE = 'DATABASE',
  FILES = 'FILES',
  CONFIG = 'CONFIG',
  LOGS = 'LOGS',
  FULL = 'FULL',
}

/**
 * Backup metadata interface
 */
export interface BackupMetadata {
  id: string;
  type: BackupType;
  category: BackupCategory;
  status: BackupStatus;
  size: number;
  path: string;
  encrypted: boolean;
  compressed: boolean;
  checksum: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

/**
 * Backup Engine Configuration
 */
const BACKUP_CONFIG = {
  // Storage paths
  basePath: process.env.BACKUP_BASE_PATH || '/backups',
  tempPath: process.env.BACKUP_TEMP_PATH || '/tmp/backups',

  // Encryption
  algorithm: 'aes-256-cbc' as const,
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY || randomBytes(32).toString('hex'),

  // Compression
  compressionLevel: 9, // Maximum compression

  // Database
  dbHost: process.env.DATABASE_HOST || 'localhost',
  dbPort: process.env.DATABASE_PORT || '5432',
  dbName: process.env.DATABASE_NAME || 'sanduta',
  dbUser: process.env.DATABASE_USER || 'postgres',
  dbPassword: process.env.DATABASE_PASSWORD || '',

  // Retention policy (days)
  retention: {
    daily: 30,
    weekly: 84, // 12 weeks
    monthly: 365, // 12 months
  },
};

/**
 * Backup Engine Class
 */
export class BackupEngine {
  /**
   * Create a full backup (DB + Files + Config)
   */
  static async createFullBackup(): Promise<BackupMetadata> {
    const backupId = `full_${Date.now()}`;
    const backupPath = `${BACKUP_CONFIG.basePath}/daily/${backupId}`;

    logger.info('BackupEngine', 'Starting full backup', { backupId });

    try {
      // Create backup directory
      await fs.mkdir(backupPath, { recursive: true });

      // Backup database
      const dbBackup = await this.backupDatabase(backupPath);

      // Backup files
      const filesBackup = await this.backupFiles(backupPath);

      // Backup configurations
      const configBackup = await this.backupConfig(backupPath);

      // Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        type: BackupType.FULL,
        category: BackupCategory.FULL,
        status: BackupStatus.COMPLETED,
        size: dbBackup.size + filesBackup.size + configBackup.size,
        path: backupPath,
        encrypted: true,
        compressed: true,
        checksum: await this.calculateChecksum(backupPath),
        createdAt: new Date(),
        completedAt: new Date(),
      };

      // Save metadata
      await this.saveMetadata(metadata);

      logger.info('BackupEngine', 'Full backup completed', {
        backupId,
        size: metadata.size,
      });

      return metadata;
    } catch (_error) {
      logger.error('BackupEngine', 'Full backup failed', { error, backupId });
      throw error;
    }
  }

  /**
   * Backup database (PostgreSQL dump)
   */
  static async backupDatabase(
    backupPath: string
  ): Promise<{ size: number; path: string }> {
    const dumpFile = `${backupPath}/database.sql`;
    const compressedFile = `${dumpFile}.gz`;
    const encryptedFile = `${compressedFile}.enc`;

    logger.info('BackupEngine', 'Backing up database', { backupPath });

    try {
      // PostgreSQL dump
      const dumpCommand = `pg_dump -h ${BACKUP_CONFIG.dbHost} -p ${BACKUP_CONFIG.dbPort} -U ${BACKUP_CONFIG.dbUser} -d ${BACKUP_CONFIG.dbName} -F c -f ${dumpFile}`;

      await execAsync(dumpCommand, {
        env: { ...process.env, PGPASSWORD: BACKUP_CONFIG.dbPassword },
      });

      // Compress
      await this.compressFile(dumpFile, compressedFile);

      // Encrypt
      await this.encryptFile(compressedFile, encryptedFile);

      // Get file size
      const stats = await fs.stat(encryptedFile);

      // Cleanup intermediate files
      await fs.unlink(dumpFile);
      await fs.unlink(compressedFile);

      logger.info('BackupEngine', 'Database backup completed', {
        size: stats.size,
      });

      return { size: stats.size, path: encryptedFile };
    } catch (_error) {
      logger.error('BackupEngine', 'Database backup failed', { error });
      throw error;
    }
  }

  /**
   * Backup files (media, uploads, projects)
   */
  static async backupFiles(
    backupPath: string
  ): Promise<{ size: number; path: string }> {
    const filesArchive = `${backupPath}/files.tar`;
    const compressedArchive = `${filesArchive}.gz`;
    const encryptedArchive = `${compressedArchive}.enc`;

    logger.info('BackupEngine', 'Backing up files', { backupPath });

    try {
      // Directories to backup
      const dirsToBackup = [
        'public/uploads',
        'public/media',
        'public/products',
        'public/banners',
        'storage/editor',
        'storage/projects',
      ];

      // Create tar archive
      const tarCommand = `tar -cf ${filesArchive} ${dirsToBackup.join(' ')}`;
      await execAsync(tarCommand);

      // Compress
      await this.compressFile(filesArchive, compressedArchive);

      // Encrypt
      await this.encryptFile(compressedArchive, encryptedArchive);

      // Get file size
      const stats = await fs.stat(encryptedArchive);

      // Cleanup
      await fs.unlink(filesArchive);
      await fs.unlink(compressedArchive);

      logger.info('BackupEngine', 'Files backup completed', { size: stats.size });

      return { size: stats.size, path: encryptedArchive };
    } catch (_error) {
      logger.error('BackupEngine', 'Files backup failed', { error });
      throw error;
    }
  }

  /**
   * Backup configurations (settings, CMS, etc)
   */
  static async backupConfig(
    backupPath: string
  ): Promise<{ size: number; path: string }> {
    const configFile = `${backupPath}/config.json`;
    const compressedFile = `${configFile}.gz`;
    const encryptedFile = `${compressedFile}.enc`;

    logger.info('BackupEngine', 'Backing up configurations', { backupPath });

    try {
      // Export configurations from database
      const config = {
        // Theme settings (if exists in DB)
        // theme: await prisma.setting.findMany({ where: { category: 'theme' } }),

        // CMS pages (if exists)
        // pages: await prisma.page.findMany(),

        // Blog posts
        // posts: await prisma.post.findMany(),

        // SEO settings
        // seo: await prisma.setting.findMany({ where: { category: 'seo' } }),

        // Marketing settings
        // marketing: await prisma.setting.findMany({ where: { category: 'marketing' } }),

        // Roles & permissions (users)
        users: await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            active: true,
          },
        }),

        // Categories
        categories: await prisma.category.findMany(),

        // Products (minimal data)
        products: await prisma.product.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            active: true,
            categoryId: true,
          },
        }),

        // Export timestamp
        exportedAt: new Date().toISOString(),
      };

      // Write to file
      await fs.writeFile(configFile, JSON.stringify(config, null, 2));

      // Compress
      await this.compressFile(configFile, compressedFile);

      // Encrypt
      await this.encryptFile(compressedFile, encryptedFile);

      // Get file size
      const stats = await fs.stat(encryptedFile);

      // Cleanup
      await fs.unlink(configFile);
      await fs.unlink(compressedFile);

      logger.info('BackupEngine', 'Config backup completed', { size: stats.size });

      return { size: stats.size, path: encryptedFile };
    } catch (_error) {
      logger.error('BackupEngine', 'Config backup failed', { error });
      throw error;
    }
  }

  /**
   * Compress file using gzip
   */
  static async compressFile(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    return pipelineAsync(
      createReadStream(inputPath),
      createGzip({ level: BACKUP_CONFIG.compressionLevel }),
      createWriteStream(outputPath)
    );
  }

  /**
   * Decompress file using gunzip
   */
  static async decompressFile(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    return pipelineAsync(
      createReadStream(inputPath),
      createGunzip(),
      createWriteStream(outputPath)
    );
  }

  /**
   * Encrypt file using AES-256-CBC
   */
  static async encryptFile(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    const key = Buffer.from(BACKUP_CONFIG.encryptionKey, 'hex');
    const iv = randomBytes(16);

    const cipher = createCipheriv(BACKUP_CONFIG.algorithm, key, iv);

    // Write IV at the beginning of the file
    const output = createWriteStream(outputPath);
    output.write(iv);

    return pipelineAsync(createReadStream(inputPath), cipher, output);
  }

  /**
   * Decrypt file
   */
  static async decryptFile(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    const key = Buffer.from(BACKUP_CONFIG.encryptionKey, 'hex');

    // Read IV from the beginning of the file
    const input = createReadStream(inputPath);
    const iv = await new Promise<Buffer>((resolve, reject) => {
      input.once('readable', () => {
        const iv = input.read(16);
        if (iv) resolve(iv);
        else reject(new Error('Failed to read IV'));
      });
    });

    const decipher = createDecipheriv(BACKUP_CONFIG.algorithm, key, iv);

    return pipelineAsync(input, decipher, createWriteStream(outputPath));
  }

  /**
   * Calculate checksum (SHA-256) of backup directory
   */
  static async calculateChecksum(backupPath: string): Promise<string> {
    const { createHash } = await import('crypto');
    const hash = createHash('sha256');

    // Hash all files in backup directory
    const files = await fs.readdir(backupPath);
    for (const file of files) {
      const content = await fs.readFile(`${backupPath}/${file}`);
      hash.update(content);
    }

    return hash.digest('hex');
  }

  /**
   * Save backup metadata to database
   */
  static async saveMetadata(metadata: BackupMetadata): Promise<void> {
    const metadataPath = `${metadata.path}/metadata.json`;
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // TODO: Also save to database table if exists
    // await prisma.backup.create({ data: metadata });
  }

  /**
   * List all backups
   */
  static async listBackups(category?: BackupCategory): Promise<BackupMetadata[]> {
    const backups: BackupMetadata[] = [];

    try {
      const dirs = ['daily', 'weekly', 'monthly', 'manual'];

      for (const dir of dirs) {
        const dirPath = `${BACKUP_CONFIG.basePath}/${dir}`;
        const exists = await fs
          .access(dirPath)
          .then(() => true)
          .catch(() => false);

        if (!exists) continue;

        const items = await fs.readdir(dirPath);

        for (const item of items) {
          const metadataPath = `${dirPath}/${item}/metadata.json`;
          const exists = await fs
            .access(metadataPath)
            .then(() => true)
            .catch(() => false);

          if (!exists) continue;

          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));

          if (!category || metadata.category === category) {
            backups.push(metadata);
          }
        }
      }

      // Sort by date (newest first)
      return backups.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (_error) {
      logger.error('BackupEngine', 'Failed to list backups', { error });
      return [];
    }
  }

  /**
   * Delete old backups based on retention policy
   */
  static async cleanupOldBackups(): Promise<void> {
    logger.info('BackupEngine', 'Starting backup cleanup');

    try {
      const now = Date.now();
      const backups = await this.listBackups();

      for (const backup of backups) {
        const age = now - new Date(backup.createdAt).getTime();
        const ageInDays = age / (1000 * 60 * 60 * 24);

        let shouldDelete = false;

        // Check retention policy based on backup type
        if (backup.path.includes('/daily/') && ageInDays > BACKUP_CONFIG.retention.daily) {
          shouldDelete = true;
        } else if (
          backup.path.includes('/weekly/') &&
          ageInDays > BACKUP_CONFIG.retention.weekly
        ) {
          shouldDelete = true;
        } else if (
          backup.path.includes('/monthly/') &&
          ageInDays > BACKUP_CONFIG.retention.monthly
        ) {
          shouldDelete = true;
        }

        if (shouldDelete) {
          await fs.rm(backup.path, { recursive: true, force: true });
          logger.info('BackupEngine', 'Deleted old backup', {
            backupId: backup.id,
            age: ageInDays,
          });
        }
      }

      logger.info('BackupEngine', 'Backup cleanup completed');
    } catch (_error) {
      logger.error('BackupEngine', 'Backup cleanup failed', { error });
    }
  }
}

/**
 * Singleton instance
 */
export const backupEngine = BackupEngine;
