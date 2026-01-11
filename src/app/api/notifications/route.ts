import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { Notification } from '@prisma/client';

/**
 * GET /api/notifications
 * Fetch notifications for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }

    const userId = session.user.id;
    
    logger.info('API:Notifications', 'Fetching notifications', { userId });

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Build where clause
    const where: any = { userId };
    
    if (!includeArchived) {
      where.archived = false;
    }
    
    if (unreadOnly) {
      where.read = false;
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    logger.info('API:Notifications', 'Fetched notifications', { 
      userId, 
      count: notifications.length,
      unreadCount: notifications.filter((n: Notification) => !n.read).length
    });

    return NextResponse.json(notifications);
  } catch (err) {
    logApiError('API:Notifications', err);
    return createErrorResponse('Failed to fetch notifications', 500);
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin/system only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { userId, type, title, message, link } = body;

    if (!userId || !type || !title || !message) {
      return createErrorResponse('Missing required fields', 400);
    }

    logger.info('API:Notifications', 'Creating notification', { 
      createdBy: session.user.id, 
      targetUser: userId,
      type 
    });

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
      },
    });

    logger.info('API:Notifications', 'Notification created', { 
      notificationId: notification.id 
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (err) {
    logApiError('API:Notifications', err);
    return createErrorResponse('Failed to create notification', 500);
  }
}
