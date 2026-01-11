/**
 * API: Download/Delete Specific Backup
 * GET /api/admin/backups/[id]/download - Download backup
 * DELETE /api/admin/backups/[id] - Delete backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only ADMIN can download backups
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const backupId = params.id;

    logger.info('API:Backups:Download', 'Downloading backup', {
      userId: user.id,
      backupId,
    });

    const fs = await import('fs/promises');
    const path = await import('path');
    const { BackupEngine } = await import('@/modules/backup/useBackupEngine');

    // Get backup path
    const backupDir = path.join(BackupEngine['config'].basePath, backupId);
    const archivePath = path.join(backupDir, 'backup.tar.gz.enc');

    // Check if backup exists
    try {
      await fs.access(archivePath);
    } catch {
      return createErrorResponse('Backup not found', 404);
    }

    // Read backup file
    const buffer = await fs.readFile(archivePath);

    // Return as download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="backup-${backupId}.tar.gz"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    logApiError('API:Backups:Download', err);
    return createErrorResponse('Failed to download backup', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only ADMIN can delete backups
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const backupId = params.id;

    logger.info('API:Backups:Delete', 'Deleting backup', {
      userId: user.id,
      backupId,
    });

    const fs = await import('fs/promises');
    const path = await import('path');
    const { BackupEngine } = await import('@/modules/backup/useBackupEngine');

    // Get backup path
    const backupDir = path.join(BackupEngine['config'].basePath, backupId);

    // Delete backup directory
    await fs.rm(backupDir, { recursive: true, force: true });

    logger.info('API:Backups:Delete', 'Backup deleted', { backupId });

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
    });
  } catch (err) {
    logApiError('API:Backups:Delete', err);
    return createErrorResponse('Failed to delete backup', 500);
  }
}
