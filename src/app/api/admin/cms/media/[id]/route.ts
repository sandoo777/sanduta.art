/**
 * API: CMS Media - Single file operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// DELETE /api/admin/cms/media/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const id = params.id;

    logger.info('API:CMS:Media', 'Deleting file', { userId: user.id, fileId: id });

    // TODO: Delete file from storage (Cloudinary, S3, etc.)

    return NextResponse.json({ success: true });
  } catch (err) {
    logApiError('API:CMS:Media', err);
    return createErrorResponse('Failed to delete file', 500);
  }
}
