import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

/**
 * POST /api/admin/theme/rollback
 * Rollback la o versiune anterioară
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const body = await req.json();
    const { versionId } = body as { versionId: string };

    if (!versionId) {
      return createErrorResponse('Version ID is required', 400);
    }

    logger.info('API:Theme:Rollback', 'Rolling back theme', {
      userId: user.id,
      versionId,
    });

    // Obține versiunea backup
    const backup = await prisma.setting.findFirst({
      where: { key: versionId },
    });

    if (!backup) {
      return createErrorResponse('Backup version not found', 404);
    }

    // Creează backup al versiunii curente înainte de rollback
    const current = await prisma.setting.findFirst({
      where: { key: 'theme_published' },
    });

    if (current) {
      await prisma.setting.create({
        data: {
          key: `theme_backup_before_rollback_${Date.now()}`,
          value: current.value,
        },
      });
    }

    // Aplică rollback
    const rolled = await prisma.setting.upsert({
      where: {
        key: 'theme_published',
      },
      create: {
        key: 'theme_published',
        value: backup.value,
      },
      update: {
        value: backup.value,
        updatedAt: new Date(),
      },
    });

    // Actualizează și draft-ul cu versiunea rollback
    await prisma.setting.upsert({
      where: {
        key: 'theme_draft',
      },
      create: {
        key: 'theme_draft',
        value: backup.value,
      },
      update: {
        value: backup.value,
        updatedAt: new Date(),
      },
    });

    logger.info('API:Theme:Rollback', 'Theme rolled back successfully', {
      versionId,
      backupCreated: !!current,
    });

    return NextResponse.json({
      success: true,
      theme: rolled.value,
      version: 'published',
      rolledBackFrom: versionId,
      updatedAt: rolled.updatedAt,
    });
  } catch (err) {
    logApiError('API:Theme:Rollback', err);
    return createErrorResponse('Failed to rollback theme', 500);
  }
}
