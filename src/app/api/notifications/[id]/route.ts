import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
export async function DELETE(
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

    logger.info('API:Notifications', 'Deleting notification', { 
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

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    logger.info('API:Notifications', 'Notification deleted', { 
      notificationId 
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logApiError('API:Notifications', err);
    return createErrorResponse('Failed to delete notification', 500);
  }
}
