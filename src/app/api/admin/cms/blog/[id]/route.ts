/**
 * API: CMS Blog Posts - Single post operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// PATCH /api/admin/cms/blog/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const id = params.id;
    const body = await req.json();

    logger.info('API:CMS:Blog', 'Updating blog post', { userId: user.id, postId: id });

    const updatedPost = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedPost);
  } catch (err) {
    logApiError('API:CMS:Blog', err);
    return createErrorResponse('Failed to update blog post', 500);
  }
}

// DELETE /api/admin/cms/blog/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const id = params.id;

    logger.info('API:CMS:Blog', 'Deleting blog post', { userId: user.id, postId: id });

    return NextResponse.json({ success: true });
  } catch (err) {
    logApiError('API:CMS:Blog', err);
    return createErrorResponse('Failed to delete blog post', 500);
  }
}
