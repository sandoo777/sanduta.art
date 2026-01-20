import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

/**
 * GET /api/admin/theme/versions
 * Obține toate versiunile salvate ale temei
 */
export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:Theme', 'Fetching theme versions', { userId: user.id });

    // Obține toate backup-urile
    const backups = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'theme_backup_',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Ultimele 10 backup-uri
    });

    const versions = backups.map((backup) => ({
      id: backup.key,
      timestamp: parseInt(backup.key.replace('theme_backup_', '')),
      createdAt: backup.createdAt,
      theme: backup.value,
    }));

    return NextResponse.json({
      versions,
      total: versions.length,
    });
  } catch (err) {
    logApiError('API:Theme', err);
    return createErrorResponse('Failed to fetch theme versions', 500);
  }
}

/**
 * POST /api/admin/theme/versions/restore
 * Restaurează o versiune anterioară
 */
export async function POST(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const body = await req.json();
    const { versionId } = body as { versionId: string };

    if (!versionId || !versionId.startsWith('theme_backup_')) {
      return createErrorResponse('Invalid version ID', 400);
    }

    logger.info('API:Theme', 'Restoring theme version', {
      userId: user.id,
      versionId,
    });

    // Obține versiunea
    const version = await prisma.setting.findFirst({
      where: { key: versionId },
    });

    if (!version) {
      return createErrorResponse('Version not found', 404);
    }

    // Restaurează ca draft
    const restored = await prisma.setting.upsert({
      where: {
        key: 'theme_draft',
      },
      create: {
        key: 'theme_draft',
        value: version.value,
      },
      update: {
        value: version.value,
        updatedAt: new Date(),
      },
    });

    logger.info('API:Theme', 'Theme version restored', {
      versionId,
      restoredAt: restored.updatedAt,
    });

    return NextResponse.json({
      success: true,
      theme: restored.value,
      message: 'Theme restored to draft. Publish to make it live.',
    });
  } catch (err) {
    logApiError('API:Theme', err);
    return createErrorResponse('Failed to restore theme version', 500);
  }
}
