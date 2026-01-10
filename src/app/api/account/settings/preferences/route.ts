import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, createErrorResponse } from '@/lib/logger';

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { language, currency, timezone } = await req.json();

    logger.info('API:Account', 'Updating user preferences', { userId: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        language,
        currency,
        timezone,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('API:Account', 'Error updating preferences', { error: err });
    return createErrorResponse('Failed to update preferences', 500);
  }
}
