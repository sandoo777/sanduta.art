/**
 * API: Get Backup Health
 * GET /api/admin/backups/health
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { BackupMonitoring } from '@/modules/backup/useBackupMonitoring';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(_req: NextRequest) {
  try {
    // Only ADMIN can access backup health
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:Backups:Health', 'Checking backup health', { userId: user.id });

    // Get health status
    const health = await BackupMonitoring.checkHealth();

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (err) {
    logApiError('API:Backups:Health', err);
    return createErrorResponse('Failed to check health', 500);
  }
}
