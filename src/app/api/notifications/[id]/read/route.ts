import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

/**
 * PATCH /api/notifications/[id]/read
 * Mark a notification as read
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }

    const notificationId = params.id;
    const userId = session.user.id;

    logger.info('API:Notifications', 'Marking notification as read', { 
      notificationId,
      userId 
    });

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return createErrorResponse('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      return createErrorResponse('Forbidden', 403);
    }

    // Update notification
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        updatedAt: new Date(),
      },
    });

    logger.info('API:Notifications', 'Notification marked as read', { 
      notificationId 
    });

    return NextResponse.json(updated);
  } catch (err) {
    logApiError('API:Notifications', err);
    return createErrorResponse('Failed to mark notification as read', 500);
  }
}
