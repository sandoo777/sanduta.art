import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the authenticated user
 */
export async function PATCH(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }

    const userId = session.user.id;

    logger.info('API:Notifications', 'Marking all notifications as read', { userId });

    // Update all unread notifications for the user
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        updatedAt: new Date(),
      },
    });

    logger.info('API:Notifications', 'All notifications marked as read', { 
      userId,
      count: result.count 
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count 
    });
  } catch (err) {
    logApiError('API:Notifications', err);
    return createErrorResponse('Failed to mark all notifications as read', 500);
  }
}
