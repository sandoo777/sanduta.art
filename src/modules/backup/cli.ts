#!/usr/bin/env tsx

/**
 * Backup CLI
 * 
 * Command-line interface pentru management backup:
 * - npm run backup:full - Create full backup
 * - npm run backup:db - Create database backup
 * - npm run backup:files - Create files backup
 * - npm run backup:config - Create config backup
 * - npm run backup:list - List all backups
 * - npm run backup:restore -- --id=<backup_id> --mode=FULL
 * - npm run backup:health - Check system health
 * - npm run backup:cleanup - Run retention policy cleanup
 */

import { BackupEngine, BackupCategory } from './useBackupEngine';
import { RestoreEngine, RestoreMode } from './useRestore';
import { BackupMonitoring } from './useBackupMonitoring';
import { BackupVersioning } from './useBackupVersioning';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'create':
      await createBackup();
      break;
    case 'list':
      await listBackups();
      break;
    case 'restore':
      await restoreBackup();
      break;
    case 'health':
      await checkHealth();
      break;
    case 'cleanup':
      await cleanupBackups();
      break;
    case 'versions':
      await listVersions();
      break;
    case 'compare':
      await compareVersions();
      break;
    default:
      printHelp();
  }
}

async function createBackup() {
  const typeArg = args.find(a => a.startsWith('--type='));
  const type = typeArg?.split('=')[1] || 'full';

  console.log(`\n🔄 Creating ${type} backup...`);

  try {
    let result;
    switch (type.toLowerCase()) {
      case 'full':
      default:
        result = await BackupEngine.createFullBackup();
        break;
    }

    console.log(`✅ Backup created successfully!`);
    console.log(`   ID: ${result.id}`);
    console.log(`   Type: ${result.type}`);
    console.log(`   Category: ${result.category}`);
    console.log(`   Size: ${formatSize(result.size)}`);
    console.log(`   Path: ${result.path}`);
    console.log(`   Encrypted: ${result.encrypted ? 'Yes' : 'No'}`);
    console.log(`   Compressed: ${result.compressed ? 'Yes' : 'No'}`);
  } catch (_error) {
    console.error(`❌ Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

async function listBackups() {
  console.log('\n📋 Listing backups...\n');

  const backups = await BackupEngine.listBackups();

  if (backups.length === 0) {
    console.log('No backups found.');
    return;
  }

  console.log(`Found ${backups.length} backup(s):\n`);

  for (const backup of backups) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`ID: ${backup.id}`);
    console.log(`Category: ${backup.category}`);
    console.log(`Status: ${backup.status}`);
    console.log(`Created: ${new Date(backup.createdAt).toLocaleString()}`);
    console.log(`Size: ${formatSize(backup.size || 0)}`);
    console.log(`Encrypted: ${backup.encrypted ? 'Yes' : 'No'}`);
    console.log(`Compressed: ${backup.compressed ? 'Yes' : 'No'}`);
    if (backup.checksum) {
      console.log(`Checksum: ${backup.checksum.substring(0, 16)}...`);
    }
    console.log('');
  }
}

async function restoreBackup() {
  const idArg = args.find(a => a.startsWith('--id='));
  const modeArg = args.find(a => a.startsWith('--mode='));

  if (!idArg) {
    console.error('❌ Missing --id parameter');
    console.log('Usage: npm run backup:restore -- --id=<backup_id> --mode=<FULL|DATABASE_ONLY|FILES_ONLY>');
    process.exit(1);
  }

  const backupId = idArg.split('=')[1];
  const mode = (modeArg?.split('=')[1] || 'FULL') as RestoreMode;

  console.log(`\n🔄 Restoring backup ${backupId} (mode: ${mode})...`);
  console.log('⚠️  This operation may overwrite existing data!\n');

  // Test restore first
  console.log('Running pre-restore tests...');
  const testResult = await RestoreEngine.testRestore(backupId);

  if (!testResult) {
    console.error('❌ Restore test failed');
    process.exit(1);
  }

  console.log('✅ Pre-restore tests passed\n');

  // Perform restore
  let result;
  switch (mode) {
    case RestoreMode.FULL:
      result = await RestoreEngine.restoreFull(backupId);
      break;
    case RestoreMode.DATABASE_ONLY:
      result = await RestoreEngine.restoreDatabase(backupId);
      break;
    case RestoreMode.FILES_ONLY:
      result = await RestoreEngine.restoreFiles(backupId);
      break;
    case RestoreMode.CONFIG_ONLY:
      result = await RestoreEngine.restoreConfig(backupId);
      break;
    default:
      result = await RestoreEngine.restoreFull(backupId);
  }

  if (result.success) {
    console.log(`✅ Restore completed successfully!`);
    console.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);
    if (result.details) {
      console.log(`   Database: ${result.details.database ? 'Restored' : 'Skipped'}`);
      console.log(`   Files: ${result.details.files ? 'Restored' : 'Skipped'}`);
      console.log(`   Config: ${result.details.config ? 'Restored' : 'Skipped'}`);
    }
  } else {
    console.error(`❌ Restore failed: ${result.error}`);
    process.exit(1);
  }
}

async function checkHealth() {
  console.log('\n🏥 Checking backup system health...\n');

  const health = await BackupMonitoring.checkHealth();

  console.log(`Status: ${health.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log(`Last Backup: ${health.lastBackup ? new Date(health.lastBackup).toLocaleString() : 'Never'}`);
  console.log(`Total Backups: ${health.totalBackups}`);
  
  if (health.storageUsed !== undefined && health.storageAvailable !== undefined) {
    const total = health.storageUsed + health.storageAvailable;
    const usagePercent = (health.storageUsed / total) * 100;
    console.log(`Storage: ${formatSize(health.storageUsed)} / ${formatSize(total)} (${usagePercent.toFixed(2)}%)`);
  }

  console.log(`Failed Backups: ${health.failedBackups || 0}`);

  if (health.alerts.length > 0) {
    console.log('\n⚠️  Alerts:');
    health.alerts.forEach(alert => console.log(`   - [${alert.severity}] ${alert.message}`));
  } else {
    console.log('\n✅ No issues detected');
  }

  // Get storage info
  const storage = await BackupMonitoring.getStorageStats();
  console.log(`\n💾 Storage Details:`);
  const storageTotal = storage.storageUsed + storage.storageAvailable;
  const storageUsagePercent = (storage.storageUsed / storageTotal) * 100;
  console.log(`   Used: ${formatSize(storage.storageUsed)}`);
  console.log(`   Available: ${formatSize(storage.storageAvailable)}`);
  console.log(`   Total: ${formatSize(storageTotal)}`);
  console.log(`   Usage: ${storageUsagePercent.toFixed(2)}%`);
}

async function cleanupBackups() {
  console.log('\n🧹 Running cleanup (retention policy)...\n');

  const result = await BackupVersioning.enforceRetentionPolicy();

  console.log(`✅ Cleanup completed`);
  console.log(`   Deleted: ${result.deleted} backup(s)`);
  console.log(`   Kept: ${result.kept} backup(s)`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors:`);
    result.errors.forEach(err => console.log(`   - ${err}`));
  }
}

async function listVersions() {
  console.log('\n📚 Listing backup versions...\n');

  const versions = await BackupVersioning.listVersions();

  if (versions.length === 0) {
    console.log('No versions found.');
    return;
  }

  console.log(`Found ${versions.length} version(s):\n`);

  for (const version of versions) {
    console.log(`Version ${version.version}: ${version.id}`);
    console.log(`  Category: ${version.category}`);
    console.log(`  Tag: ${version.tag || 'None'}`);
    console.log(`  Created: ${version.createdAt.toLocaleString()}`);
    console.log(`  Size: ${formatSize(version.size)}`);
    console.log('');
  }
}

async function compareVersions() {
  const v1Arg = args.find(a => a.startsWith('--v1='));
  const v2Arg = args.find(a => a.startsWith('--v2='));

  if (!v1Arg || !v2Arg) {
    console.error('❌ Missing version parameters');
    console.log('Usage: npm run backup:compare -- --v1=<backup_id> --v2=<backup_id>');
    process.exit(1);
  }

  const v1 = v1Arg.split('=')[1];
  const v2 = v2Arg.split('=')[1];

  console.log(`\n🔍 Comparing versions...\n`);

  const comparison = await BackupVersioning.compareVersions(v1, v2);

  console.log(`Version 1: ${comparison.version1.id}`);
  console.log(`Version 2: ${comparison.version2.id}`);
  console.log(`Similarity: ${comparison.similarity.toFixed(2)}%`);
  console.log('');

  if (comparison.differences.database) {
    const db = comparison.differences.database;
    console.log('Database Changes:');
    console.log(`  Tables Added: ${db.tablesAdded.length}`);
    console.log(`  Tables Removed: ${db.tablesRemoved.length}`);
    console.log('');
  }

  if (comparison.differences.files) {
    const files = comparison.differences.files;
    console.log('File Changes:');
    console.log(`  Files Added: ${files.filesAdded.length}`);
    console.log(`  Files Removed: ${files.filesRemoved.length}`);
    console.log(`  Files Modified: ${files.filesModified.length}`);
    console.log('');
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function printHelp() {
  console.log(`
Backup CLI - sanduta.art Backup System

Commands:
  create       Create a new backup
    --type=full|database|files|config

  list         List all backups

  restore      Restore a backup
    --id=<backup_id>
    --mode=FULL|DATABASE_ONLY|FILES_ONLY

  health       Check backup system health

  cleanup      Run retention policy cleanup

  versions     List backup versions

  compare      Compare two versions
    --v1=<backup_id>
    --v2=<backup_id>

Examples:
  npm run backup:full
  npm run backup:db
  npm run backup:list
  npm run backup:restore -- --id=abc123 --mode=FULL
  npm run backup:health
  npm run backup:cleanup

For more information, see docs/BACKUP_SYSTEM.md
  `);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
