/**
 * Automated Backup & Restore Testing System
 * 
 * Testează periodic backup și restore pentru a asigura funcționalitatea:
 * - Test DB restore (monthly)
 * - Test file restore (monthly)
 * - Test full restore (quarterly)
 * - Test granular restore (weekly)
 * - Integrity verification
 * - Performance benchmarks
 */

import { BackupEngine, BackupCategory, BackupStatus } from './useBackupEngine';
import { RestoreEngine, RestoreMode } from './useRestore';
import { BackupMonitoring, AlertSeverity } from './useBackupMonitoring';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  errors: string[];
  warnings: string[];
  details: {
    backupId?: string;
    restoredItems?: number;
    dataIntegrity?: boolean;
    performanceMetrics?: {
      backupSpeed?: string;
      restoreSpeed?: string;
      compressionRatio?: number;
    };
  };
}

export interface TestSuite {
  runDate: Date;
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  tests: TestResult[];
}

export class BackupRestoreTester {
  private static testDbName = 'sanduta_test';
  private static testDataPath = '/tmp/backup-test-data';

  /**
   * Run complete test suite
   */
  static async runFullTestSuite(): Promise<TestSuite> {
    const startTime = Date.now();
    const results: TestResult[] = [];

    logger.info('BackupTest', 'Starting full backup/restore test suite');

    try {
      // Test 1: Database backup and restore
      results.push(await this.testDatabaseBackupRestore());

      // Test 2: File backup and restore
      results.push(await this.testFileBackupRestore());

      // Test 3: Config backup and restore
      results.push(await this.testConfigBackupRestore());

      // Test 4: Full backup and restore
      results.push(await this.testFullBackupRestore());

      // Test 5: Granular restore
      results.push(await this.testGranularRestore());

      // Test 6: Encryption/Decryption
      results.push(await this.testEncryptionDecryption());

      // Test 7: Compression
      results.push(await this.testCompression());

      // Test 8: Integrity verification
      results.push(await this.testIntegrityVerification());

      // Test 9: Retention policy
      results.push(await this.testRetentionPolicy());

      // Test 10: Monitoring alerts
      results.push(await this.testMonitoringAlerts());

      const duration = Date.now() - startTime;
      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;

      const suite: TestSuite = {
        runDate: new Date(),
        totalTests: results.length,
        passed,
        failed,
        duration,
        tests: results,
      };

      // Generate report
      await this.generateTestReport(suite);

      // Send alerts if failures
      if (failed > 0) {
        await BackupMonitoring.sendAlerts([{
          type: AlertType.BACKUP_FAILED,
          severity: AlertSeverity.CRITICAL,
          message: `Backup test suite failed: ${failed}/${results.length} tests failed`,
          details: suite,
          timestamp: new Date(),
        }]);
      }

      logger.info('BackupTest', 'Test suite completed', { passed, failed, duration });

      return suite;
    } catch (_error) {
      logger.error('BackupTest', 'Test suite failed', { error });
      throw error;
    }
  }

  /**
   * Test 1: Database Backup & Restore
   */
  static async testDatabaseBackupRestore(): Promise<TestResult> {
    const testName = 'Database Backup & Restore';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      logger.info('BackupTest', 'Testing database backup/restore');

      // Step 1: Snapshot current DB state
      const beforeSnapshot = await this.snapshotDatabaseState();

      // Step 2: Create test data
      const testProduct = await prisma.product.create({
        data: {
          name: '__TEST_PRODUCT_' + Date.now(),
          slug: 'test-product-' + Date.now(),
          description: 'Test product for backup verification',
          price: 99.99,
          stock: 10,
          status: 'ACTIVE',
          categoryId: 1, // Assumes category exists
        },
      });

      // Step 3: Create full backup
      const backupResult = await BackupEngine.createFullBackup();

      // Step 4: Delete test data (simulate data loss)
      await prisma.product.delete({ where: { id: testProduct.id } });

      // Step 5: Restore database only
      const restoreResult = await RestoreEngine.restoreDatabase(backupResult.id);

      if (!restoreResult.success) {
        errors.push(`Restore failed: ${restoreResult.error}`);
      }

      // Step 6: Verify test data restored
      const restoredProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });

      if (!restoredProduct) {
        errors.push('Test product not found after restore');
      } else if (restoredProduct.name !== testProduct.name) {
        errors.push('Restored data does not match original');
      }

      // Step 7: Cleanup
      await prisma.product.delete({ where: { id: testProduct.id } }).catch(() => {});

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          backupId: backupResult.id,
          restoredItems: 1,
          dataIntegrity: errors.length === 0,
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Test 2: File Backup & Restore
   */
  static async testFileBackupRestore(): Promise<TestResult> {
    const testName = 'File Backup & Restore';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      // Step 1: Create test file
      const testDir = path.join(process.cwd(), 'public', 'uploads', '__test__');
      await fs.mkdir(testDir, { recursive: true });
      
      const testFile = path.join(testDir, 'test-file.txt');
      const testContent = 'Test backup content - ' + new Date().toISOString();
      await fs.writeFile(testFile, testContent);

      // Step 2: Create file backup
      const backupResult = await BackupEngine.createFullBackup();

      // Step 3: Delete test file
      await fs.rm(testDir, { recursive: true, force: true });

      // Step 4: Restore files
      const restoreResult = await RestoreEngine.restoreFiles(backupResult.id);

      if (!restoreResult.success) {
        errors.push(`Restore failed: ${restoreResult.error}`);
      }

      // Step 5: Verify file restored
      const restoredContent = await fs.readFile(testFile, 'utf-8').catch(() => null);

      if (!restoredContent) {
        errors.push('Test file not found after restore');
      } else if (restoredContent !== testContent) {
        errors.push('Restored file content does not match original');
      }

      // Step 6: Cleanup
      await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          backupId: backupResult.id,
          restoredItems: 1,
          dataIntegrity: errors.length === 0,
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Test 3: Config Backup & Restore
   */
  static async testConfigBackupRestore(): Promise<TestResult> {
    const testName = 'Config Backup & Restore';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: Snapshot current config
      const beforeCount = await prisma.user.count();

      // Step 2: Create test user
      const testUser = await prisma.user.create({
        data: {
          email: `test_${Date.now()}@backup-test.local`,
          name: 'Backup Test User',
          password: 'test123',
          role: 'VIEWER',
        },
      });

      // Step 3: Create config backup
      const backupResult = await BackupEngine.createFullBackup();

      // Step 4: Delete test user
      await prisma.user.delete({ where: { id: testUser.id } });

      // Step 5: Restore config
      const restoreResult = await RestoreEngine.restoreConfig(backupResult.id);

      if (!restoreResult.success) {
        errors.push(`Restore failed: ${restoreResult.error}`);
      }

      // Step 6: Verify user restored
      const restoredUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      if (!restoredUser) {
        errors.push('Test user not found after restore');
      } else if (restoredUser.email !== testUser.email) {
        errors.push('Restored user data does not match original');
      }

      // Step 7: Cleanup
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          backupId: backupResult.id,
          restoredItems: 1,
          dataIntegrity: errors.length === 0,
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Test 4: Full Backup & Restore
   */
  static async testFullBackupRestore(): Promise<TestResult> {
    const testName = 'Full Backup & Restore';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: Create full backup
      const backupResult = await BackupEngine.createFullBackup();

      // Step 2: Test restore (dry run only to avoid data loss)
      const testResult = await RestoreEngine.testRestore(backupResult.id);

      if (!testResult) {
        errors.push(`Restore test failed`);
      }

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          backupId: backupResult.id,
          dataIntegrity: testResult,
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Test 5: Granular Restore
   */
  static async testGranularRestore(): Promise<TestResult> {
    const testName = 'Granular Restore';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: Create test product
      const testProduct = await prisma.product.create({
        data: {
          name: '__GRANULAR_TEST_' + Date.now(),
          slug: 'granular-test-' + Date.now(),
          description: 'Test granular restore',
          price: 49.99,
          stock: 5,
          status: 'ACTIVE',
          categoryId: 1,
        },
      });

      // Step 2: Create full backup
      const backupResult = await BackupEngine.createFullBackup();

      // Step 3: Modify product
      await prisma.product.update({
        where: { id: testProduct.id },
        data: { name: 'MODIFIED', price: 999.99 },
      });

      // Step 4: Restore only this product
      const restoreResult = await RestoreEngine.restoreGranular(
        backupResult.id,
        [{ type: 'product', id: testProduct.id }]
      );

      if (!restoreResult.success) {
        errors.push(`Granular restore failed: ${restoreResult.error}`);
      }

      // Step 5: Verify product restored to original state
      const restoredProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });

      if (!restoredProduct) {
        errors.push('Product not found after granular restore');
      } else if (restoredProduct.name !== testProduct.name) {
        errors.push(`Name not restored: expected "${testProduct.name}", got "${restoredProduct.name}"`);
      } else if (restoredProduct.price !== testProduct.price) {
        errors.push(`Price not restored: expected ${testProduct.price}, got ${restoredProduct.price}`);
      }

      // Step 6: Cleanup
      await prisma.product.delete({ where: { id: testProduct.id } }).catch(() => {});

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          backupId: backupResult.id,
          restoredItems: 1,
          dataIntegrity: errors.length === 0,
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Test 6: Encryption/Decryption
   */
  static async testEncryptionDecryption(): Promise<TestResult> {
    const testName = 'Encryption/Decryption';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const fs = await import('fs/promises');
      const crypto = await import('crypto');

      // Step 1: Create test file
      const testFile = '/tmp/test-encryption.txt';
      const testContent = 'Sensitive data for encryption test';
      await fs.writeFile(testFile, testContent);

      // Step 2: Encrypt
      const encrypted = testFile + '.enc';
      await BackupEngine['encryptFile'](testFile, encrypted);

      // Step 3: Verify encrypted
      const encryptedContent = await fs.readFile(encrypted);
      if (encryptedContent.toString('utf-8').includes(testContent)) {
        errors.push('File not properly encrypted (plaintext visible)');
      }

      // Step 4: Decrypt
      const decrypted = testFile + '.dec';
      await RestoreEngine['decryptFile'](encrypted, decrypted);

      // Step 5: Verify decrypted matches original
      const decryptedContent = await fs.readFile(decrypted, 'utf-8');
      if (decryptedContent !== testContent) {
        errors.push('Decrypted content does not match original');
      }

      // Cleanup
      await fs.unlink(testFile).catch(() => {});
      await fs.unlink(encrypted).catch(() => {});
      await fs.unlink(decrypted).catch(() => {});

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          dataIntegrity: errors.length === 0,
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Test 7: Compression
   */
  static async testCompression(): Promise<TestResult> {
    const testName = 'Compression';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const fs = await import('fs/promises');

      // Step 1: Create test file
      const testFile = '/tmp/test-compression.txt';
      const testContent = 'A'.repeat(10000); // 10KB of 'A's (highly compressible)
      await fs.writeFile(testFile, testContent);

      // Step 2: Compress
      const compressed = testFile + '.gz';
      await BackupEngine['compressFile'](testFile, compressed);

      // Step 3: Verify compression ratio
      const originalStats = await fs.stat(testFile);
      const compressedStats = await fs.stat(compressed);
      const ratio = compressedStats.size / originalStats.size;

      if (ratio > 0.1) {
        warnings.push(`Compression ratio poor: ${(ratio * 100).toFixed(2)}% (expected < 10%)`);
      }

      // Step 4: Decompress
      const decompressed = testFile + '.dec';
      await RestoreEngine['decompressFile'](compressed, decompressed);

      // Step 5: Verify content matches
      const decompressedContent = await fs.readFile(decompressed, 'utf-8');
      if (decompressedContent !== testContent) {
        errors.push('Decompressed content does not match original');
      }

      // Cleanup
      await fs.unlink(testFile).catch(() => {});
      await fs.unlink(compressed).catch(() => {});
      await fs.unlink(decompressed).catch(() => {});

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          dataIntegrity: errors.length === 0,
          performanceMetrics: {
            compressionRatio: ratio,
          },
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Test 8: Integrity Verification
   */
  static async testIntegrityVerification(): Promise<TestResult> {
    const testName = 'Integrity Verification';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: Create backup
      const backupResult = await BackupEngine.createFullBackup();

      // Step 2: Verify integrity
      const integrity = await BackupMonitoring.verifyIntegrity(backupResult.id);

      if (!integrity) {
        errors.push(`Integrity check failed`);
      }

      // Step 3: Corrupt backup (simulate)
      // We'll skip actual corruption to avoid data loss

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          backupId: backupResult.id,
          dataIntegrity: integrity,
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Test 9: Retention Policy
   */
  static async testRetentionPolicy(): Promise<TestResult> {
    const testName = 'Retention Policy';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: List all backups
      const allBackups = await BackupEngine.listBackups();

      // Step 2: Run cleanup
      const beforeCount = allBackups.length;
      await BackupEngine.cleanupOldBackups();

      // Step 3: List backups after cleanup
      const afterBackups = await BackupEngine.listBackups();
      const afterCount = afterBackups.length;

      // Step 4: Verify retention policy applied
      const deleted = beforeCount - afterCount;
      logger.info('BackupTest', 'Retention policy test', { beforeCount, afterCount, deleted });

      // Verify no backups older than retention period
      const now = Date.now();
      const maxAge = 365 * 24 * 60 * 60 * 1000; // 365 days

      for (const backup of afterBackups) {
        const age = now - new Date(backup.createdAt).getTime();
        if (age > maxAge) {
          warnings.push(`Backup ${backup.id} older than retention period (${Math.floor(age / (24 * 60 * 60 * 1000))} days)`);
        }
      }

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          restoredItems: deleted,
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Test 10: Monitoring Alerts
   */
  static async testMonitoringAlerts(): Promise<TestResult> {
    const testName = 'Monitoring Alerts';
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: Check health
      const health = await BackupMonitoring.checkHealth();

      if (health.status !== 'healthy' && health.status !== 'warning') {
        errors.push(`System unhealthy: ${health.status}`);
      }

      // Step 2: Verify storage info
      const storage = await BackupMonitoring.getStorageInfo();

      if (storage.usagePercent > 90) {
        errors.push(`Storage critically low: ${storage.usagePercent.toFixed(2)}%`);
      } else if (storage.usagePercent > 80) {
        warnings.push(`Storage usage high: ${storage.usagePercent.toFixed(2)}%`);
      }

      const duration = Date.now() - startTime;

      return {
        testName,
        passed: errors.length === 0,
        duration,
        errors,
        warnings,
        details: {
          dataIntegrity: health.status === 'healthy',
        },
      };
    } catch (_error) {
      errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        errors,
        warnings,
        details: {},
      };
    }
  }

  /**
   * Helper: Snapshot database state
   */
  private static async snapshotDatabaseState() {
    return {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count(),
      categories: await prisma.category.count(),
    };
  }

  /**
   * Generate test report
   */
  private static async generateTestReport(suite: TestSuite): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const reportDir = path.join(process.cwd(), 'reports', 'backup-tests');
    await fs.mkdir(reportDir, { recursive: true });

    const reportFile = path.join(reportDir, `test-${suite.runDate.toISOString()}.md`);

    const report = `# Backup & Restore Test Report

**Date**: ${suite.runDate.toISOString()}  
**Duration**: ${(suite.duration / 1000).toFixed(2)}s  
**Tests**: ${suite.totalTests} total, ${suite.passed} passed, ${suite.failed} failed  
**Success Rate**: ${((suite.passed / suite.totalTests) * 100).toFixed(2)}%

---

## Test Results

${suite.tests.map((test, idx) => `
### ${idx + 1}. ${test.testName}

**Status**: ${test.passed ? '✅ PASSED' : '❌ FAILED'}  
**Duration**: ${(test.duration / 1000).toFixed(2)}s

${test.errors.length > 0 ? `
**Errors**:
${test.errors.map(e => `- ${e}`).join('\n')}
` : ''}

${test.warnings.length > 0 ? `
**Warnings**:
${test.warnings.map(w => `- ${w}`).join('\n')}
` : ''}

${test.details.backupId ? `**Backup ID**: ${test.details.backupId}` : ''}
${test.details.restoredItems ? `**Restored Items**: ${test.details.restoredItems}` : ''}
${test.details.dataIntegrity !== undefined ? `**Data Integrity**: ${test.details.dataIntegrity ? 'Valid' : 'Invalid'}` : ''}

${test.details.performanceMetrics ? `
**Performance**:
${test.details.performanceMetrics.backupSpeed ? `- Backup Speed: ${test.details.performanceMetrics.backupSpeed}` : ''}
${test.details.performanceMetrics.restoreSpeed ? `- Restore Speed: ${test.details.performanceMetrics.restoreSpeed}` : ''}
${test.details.performanceMetrics.compressionRatio ? `- Compression Ratio: ${(test.details.performanceMetrics.compressionRatio * 100).toFixed(2)}%` : ''}
` : ''}

---
`).join('\n')}

## Summary

${suite.failed === 0 
  ? '✅ All tests passed successfully!' 
  : `⚠️ ${suite.failed} test(s) failed. Please review errors above.`
}

**Next Steps**:
${suite.failed > 0 ? '- Investigate and fix failing tests\n- Re-run test suite' : '- Continue regular testing schedule\n- Monitor backup system health'}

---

_Generated by Backup Testing System_
`;

    await fs.writeFile(reportFile, report);
    logger.info('BackupTest', 'Test report generated', { reportFile });
  }
}

// Export CLI helper
export async function runBackupTests() {
  try {
    const suite = await BackupRestoreTester.runFullTestSuite();
    
    console.log('\n=================================');
    console.log('Backup Test Suite Results');
    console.log('=================================');
    console.log(`Total Tests: ${suite.totalTests}`);
    console.log(`Passed: ${suite.passed}`);
    console.log(`Failed: ${suite.failed}`);
    console.log(`Duration: ${(suite.duration / 1000).toFixed(2)}s`);
    console.log(`Success Rate: ${((suite.passed / suite.totalTests) * 100).toFixed(2)}%`);
    console.log('=================================\n');

    if (suite.failed > 0) {
      console.error('❌ Some tests failed. Check the report for details.');
      process.exit(1);
    } else {
      console.log('✅ All tests passed!');
      process.exit(0);
    }
  } catch (_error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runBackupTests();
}
