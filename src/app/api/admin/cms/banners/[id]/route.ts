/**
 * API: CMS Banners - Single banner operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// PATCH /api/admin/cms/banners/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const id = params.id;
    const body = await req.json();

    logger.info('API:CMS:Banners', 'Updating banner', { userId: user.id, bannerId: id });

    const updatedBanner = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedBanner);
  } catch (err) {
    logApiError('API:CMS:Banners', err);
    return createErrorResponse('Failed to update banner', 500);
  }
}

// DELETE /api/admin/cms/banners/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const id = params.id;

    logger.info('API:CMS:Banners', 'Deleting banner', { userId: user.id, bannerId: id });

    return NextResponse.json({ success: true });
  } catch (err) {
    logApiError('API:CMS:Banners', err);
    return createErrorResponse('Failed to delete banner', 500);
  }
}
