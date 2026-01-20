/**
 * API: CMS Media Folders
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

const mockFolders = [
  { id: '1', name: 'Bannere', fileCount: 5, createdAt: '2025-01-01T10:00:00Z' },
  { id: '2', name: 'Produse', fileCount: 23, createdAt: '2025-01-02T11:00:00Z' },
  { id: '3', name: 'Blog', fileCount: 12, createdAt: '2025-01-03T09:00:00Z' },
];

// GET /api/admin/cms/media/folders
export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:CMS:Media', 'Fetching folders', { userId: user.id });

    return NextResponse.json(mockFolders);
  } catch (err) {
    logApiError('API:CMS:Media', err);
    return createErrorResponse('Failed to fetch folders', 500);
  }
}
