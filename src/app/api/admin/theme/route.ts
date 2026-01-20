import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import type { ThemeConfig } from '@/types/theme';

/**
 * GET /api/admin/theme
 * Obține tema curentă (published sau draft)
 */
export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const version = searchParams.get('version') || 'published';

    logger.info('API:Theme', 'Fetching theme', { version, userId: user.id });

    // Caută tema în baza de date
    const theme = await prisma.setting.findFirst({
      where: {
        key: version === 'draft' ? 'theme_draft' : 'theme_published',
      },
    });

    if (!theme) {
      return NextResponse.json(
        { theme: null, version, message: 'No theme found' },
        { status: 404 }
      );
    }

    const themeConfig = theme.value as ThemeConfig;

    return NextResponse.json({
      theme: themeConfig,
      version,
      updatedAt: theme.updatedAt,
    });
  } catch (err) {
    logApiError('API:Theme', err);
    return createErrorResponse('Failed to fetch theme', 500);
  }
}

/**
 * POST /api/admin/theme
 * Salvează tema ca draft
 */
export async function POST(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    const body = await req.json();
    const { theme } = body as { theme: ThemeConfig };

    if (!theme) {
      return createErrorResponse('Theme configuration is required', 400);
    }

    logger.info('API:Theme', 'Saving theme draft', {
      userId: user.id,
      hasColors: !!theme.colors,
      hasTypography: !!theme.typography,
    });

    // Salvează ca draft
    const saved = await prisma.setting.upsert({
      where: {
        key: 'theme_draft',
      },
      create: {
        key: 'theme_draft',
        value: JSON.parse(JSON.stringify(theme)),
      },
      update: {
        value: JSON.parse(JSON.stringify(theme)),
        updatedAt: new Date(),
      },
    });

    logger.info('API:Theme', 'Theme draft saved', {
      id: saved.id,
      updatedAt: saved.updatedAt,
    });

    return NextResponse.json({
      success: true,
      theme: saved.value as ThemeConfig,
      version: 'draft',
      updatedAt: saved.updatedAt,
    });
  } catch (err) {
    logApiError('API:Theme', err);
    return createErrorResponse('Failed to save theme', 500);
  }
}

/**
 * PUT /api/admin/theme/publish
 * Publică tema (draft -> published)
 */
export async function PUT(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:Theme', 'Publishing theme', { userId: user.id });

    // Obține draft-ul
    const draft = await prisma.setting.findFirst({
      where: { key: 'theme_draft' },
    });

    if (!draft) {
      return createErrorResponse('No draft theme found', 404);
    }

    // Creează backup al temei publicate curente
    const currentPublished = await prisma.setting.findFirst({
      where: { key: 'theme_published' },
    });

    if (currentPublished) {
      await prisma.setting.create({
        data: {
          key: `theme_backup_${Date.now()}`,
          value: currentPublished.value,
        },
      });
    }

    // Publică draft-ul
    const published = await prisma.setting.upsert({
      where: {
        key: 'theme_published',
      },
      create: {
        key: 'theme_published',
        value: draft.value,
      },
      update: {
        value: draft.value,
        updatedAt: new Date(),
      },
    });

    logger.info('API:Theme', 'Theme published', {
      id: published.id,
      backupCreated: !!currentPublished,
    });

    return NextResponse.json({
      success: true,
      theme: published.value as ThemeConfig,
      version: 'published',
      updatedAt: published.updatedAt,
    });
  } catch (err) {
    logApiError('API:Theme', err);
    return createErrorResponse('Failed to publish theme', 500);
  }
}

/**
 * DELETE /api/admin/theme
 * Resetează tema la default
 */
export async function DELETE(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:Theme', 'Resetting theme', { userId: user.id });

    // Șterge draft și published
    await prisma.setting.deleteMany({
      where: {
        key: {
          in: ['theme_draft', 'theme_published'],
        },
      },
    });

    logger.info('API:Theme', 'Theme reset complete');

    return NextResponse.json({
      success: true,
      message: 'Theme reset to default',
    });
  } catch (err) {
    logApiError('API:Theme', err);
    return createErrorResponse('Failed to reset theme', 500);
  }
}
