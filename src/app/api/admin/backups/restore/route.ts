/**
 * API: Restore Backup
 * POST /api/admin/backups/restore
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { RestoreEngine, RestoreMode } from '@/modules/backup/useRestore';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function POST(_req: NextRequest) {
  try {
    // Only ADMIN can restore backups
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const body = await req.json();
    const { backupId, mode } = body;

    if (!backupId || !mode) {
      return createErrorResponse('Missing backupId or mode', 400);
    }

    logger.info('API:Backups:Restore', 'Restoring backup', {
      userId: user.id,
      backupId,
      mode,
    });

    // Restore backup
    const result = await RestoreEngine.restore(backupId, mode as RestoreMode);

    if (result.success) {
      return NextResponse.json({
        success: true,
        result,
        message: 'Backup restored successfully',
      });
    } else {
      return createErrorResponse(result.error || 'Restore failed', 500);
    }
  } catch (err) {
    logApiError('API:Backups:Restore', err);
    return createErrorResponse('Failed to restore backup', 500);
  }
}
