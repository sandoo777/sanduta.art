/**
 * API: List Backups
 * GET /api/admin/backups
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { BackupEngine } from '@/modules/backup/useBackupEngine';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    // Only ADMIN can access backups
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:Backups', 'Listing backups', { userId: user.id });

    // Get all backups
    const backups = await BackupEngine.listBackups();

    return NextResponse.json({
      success: true,
      backups,
      count: backups.length,
    });
  } catch (err) {
    logApiError('API:Backups', err);
    return createErrorResponse('Failed to list backups', 500);
  }
}

/**
 * API: Create Manual Backup
 * POST /api/admin/backups
 */
export async function POST(req: NextRequest) {
  try {
    // Only ADMIN can create backups
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const body = await req.json();
    const { category } = body;

    logger.info('API:Backups', 'Creating manual backup', { userId: user.id, category });

    let result;
    switch (category) {
      case 'DATABASE':
        result = await BackupEngine.backupDatabase();
        break;
      case 'FILES':
        result = await BackupEngine.backupFiles();
        break;
      case 'CONFIG':
        result = await BackupEngine.backupConfig();
        break;
      case 'FULL':
      default:
        result = await BackupEngine.createFullBackup();
        break;
    }

    if (result.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        backup: result.metadata,
        message: 'Backup created successfully',
      });
    } else {
      return createErrorResponse(result.error || 'Backup failed', 500);
    }
  } catch (err) {
    logApiError('API:Backups', err);
    return createErrorResponse('Failed to create backup', 500);
  }
}
