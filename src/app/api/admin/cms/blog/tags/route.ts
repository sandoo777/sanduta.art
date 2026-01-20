/**
 * API: CMS Blog Tags
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

const mockTags = [
  { id: '1', name: 'personalizare', slug: 'personalizare', postCount: 8 },
  { id: '2', name: 'ghid', slug: 'ghid', postCount: 5 },
  { id: '3', name: 'materiale', slug: 'materiale', postCount: 3 },
  { id: '4', name: 'tutorial', slug: 'tutorial', postCount: 4 },
  { id: '5', name: 'tendințe', slug: 'tendinte', postCount: 2 },
  { id: '6', name: 'noutăți', slug: 'noutati', postCount: 3 },
];

// GET /api/admin/cms/blog/tags
export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:CMS:Blog', 'Fetching tags', { userId: user.id });

    return NextResponse.json(mockTags);
  } catch (err) {
    logApiError('API:CMS:Blog', err);
    return createErrorResponse('Failed to fetch tags', 500);
  }
}
