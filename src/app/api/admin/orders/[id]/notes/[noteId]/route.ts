import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { noteId } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return createErrorResponse('Note content is required', 400);
    }

    logger.info('API:OrderNotes', 'Updating note', { 
      userId: user.id, 
      noteId 
    });

    // Verify note exists and get order info
    const existingNote = await prisma.orderNote.findUnique({
      where: { id: noteId },
      include: { order: { select: { id: true } } }
    });

    if (!existingNote) {
      return createErrorResponse('Note not found', 404);
    }

    // Update note
    const note = await prisma.orderNote.update({
      where: { id: noteId },
      data: {
        content: content.trim(),
        updatedAt: new Date()
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

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId: existingNote.order.id,
        eventType: 'note_updated',
        description: `${user.name} a modificat o notă`,
        eventData: {
          noteId,
          updatedBy: user.name
        },
        createdById: user.id
      }
    });

    return NextResponse.json(note);
  } catch (error) {
    logApiError('API:OrderNotes', error);
    return createErrorResponse('Failed to update note', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { noteId } = params;

    logger.info('API:OrderNotes', 'Deleting note', { 
      userId: user.id, 
      noteId 
    });

    // Verify note exists and get order info
    const existingNote = await prisma.orderNote.findUnique({
      where: { id: noteId },
      include: { order: { select: { id: true } } }
    });

    if (!existingNote) {
      return createErrorResponse('Note not found', 404);
    }

    // Delete note
    await prisma.orderNote.delete({
      where: { id: noteId }
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId: existingNote.order.id,
        eventType: 'note_deleted',
        description: `${user.name} a șters o notă`,
        eventData: {
          deletedBy: user.name,
          notePreview: existingNote.content.substring(0, 100)
        },
        createdById: user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('API:OrderNotes', error);
    return createErrorResponse('Failed to delete note', 500);
  }
}
