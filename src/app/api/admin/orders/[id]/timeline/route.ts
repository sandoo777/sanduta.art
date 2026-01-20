import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const orderId = params.id;

    logger.info('API:OrderTimeline', 'Fetching timeline', { userId: user.id, orderId });

    const timeline = await prisma.orderTimeline.findMany({
      where: { orderId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(timeline);
  } catch (error) {
    logApiError('API:OrderTimeline', error);
    return createErrorResponse('Failed to fetch order timeline', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER', 'OPERATOR']);
    if (error) return error;

    const orderId = params.id;
    const body = await request.json();
    const { eventType, description, eventData } = body;

    if (!eventType || !description) {
      return createErrorResponse('Event type and description are required', 400);
    }

    logger.info('API:OrderTimeline', 'Adding timeline event', { 
      userId: user.id, 
      orderId,
      eventType 
    });

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true }
    });

    if (!order) {
      return createErrorResponse('Order not found', 404);
    }

    // Create timeline entry
    const timelineEntry = await prisma.orderTimeline.create({
      data: {
        orderId,
        eventType,
        description,
        eventData: eventData || undefined,
        createdById: user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json(timelineEntry, { status: 201 });
  } catch (error) {
    logApiError('API:OrderTimeline', error);
    return createErrorResponse('Failed to add timeline event', 500);
  }
}
