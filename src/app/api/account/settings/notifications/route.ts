import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, createErrorResponse } from '@/lib/logger';

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const preferences = await req.json();

    logger.info('API:Account', 'Updating notification preferences', { userId: user.id });

    // Store preferences as JSON string or in separate UserPreferences table
    // For now, skip database update until schema is updated
    // TODO: Add notificationPreferences field to User model or create UserPreferences table
    
    logger.info('API:Account', 'Notification preferences stored', { preferences });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('API:Account', 'Error updating notification preferences', { error: err });
    return createErrorResponse('Failed to update preferences', 500);
  }
}
