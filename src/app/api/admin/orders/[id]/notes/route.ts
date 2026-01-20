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
    const { searchParams } = new URL(request.url);
    const includeInternal = searchParams.get('includeInternal') !== 'false';

    logger.info('API:OrderNotes', 'Fetching notes', { userId: user.id, orderId });

    const where: any = { orderId };
    
    // Operators can only see non-internal notes unless explicitly requested
    if (user.role === 'OPERATOR' && includeInternal) {
      where.isInternal = false;
    }

    const notes = await prisma.orderNote.findMany({
      where,
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

    return NextResponse.json(notes);
  } catch (error) {
    logApiError('API:OrderNotes', error);
    return createErrorResponse('Failed to fetch order notes', 500);
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
    const { content, isInternal } = body;

    if (!content || content.trim().length === 0) {
      return createErrorResponse('Note content is required', 400);
    }

    logger.info('API:OrderNotes', 'Adding note', { 
      userId: user.id, 
      orderId,
      isInternal 
    });

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true }
    });

    if (!order) {
      return createErrorResponse('Order not found', 404);
    }

    // Create note
    const note = await prisma.orderNote.create({
      data: {
        orderId,
        content: content.trim(),
        isInternal: isInternal !== false, // Default to true
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

    // Add timeline entry for note
    await prisma.orderTimeline.create({
      data: {
        orderId,
        eventType: 'note_added',
        description: isInternal 
          ? `${user.name} a adăugat o notă internă`
          : `${user.name} a adăugat o notă`,
        eventData: {
          noteId: note.id,
          isInternal,
          preview: content.substring(0, 100)
        },
        createdById: user.id
      }
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    logApiError('API:OrderNotes', error);
    return createErrorResponse('Failed to add note', 500);
  }
}
