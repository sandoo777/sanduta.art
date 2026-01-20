/**
 * API: CMS Blog Categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

const mockCategories = [
  { id: '1', name: 'Tutoriale', slug: 'tutoriale', description: 'Ghiduri pas cu pas', postCount: 3 },
  { id: '2', name: 'Știri', slug: 'stiri', description: 'Noutăți și anunțuri', postCount: 2 },
  { id: '3', name: 'Ghiduri', slug: 'ghiduri', description: 'Ghiduri complete', postCount: 4 },
  { id: '4', name: 'Inspirație', slug: 'inspiratie', description: 'Idei și inspirație', postCount: 5 },
];

// GET /api/admin/cms/blog/categories
export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:CMS:Blog', 'Fetching categories', { userId: user.id });

    return NextResponse.json(mockCategories);
  } catch (err) {
    logApiError('API:CMS:Blog', err);
    return createErrorResponse('Failed to fetch categories', 500);
  }
}
