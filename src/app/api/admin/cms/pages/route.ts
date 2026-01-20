/**
 * API: CMS Pages - CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data
const mockPages = [
  {
    id: '1',
    title: 'Despre Noi',
    slug: 'despre-noi',
    content: '<h1>Despre Noi</h1><p>Suntem o echipă pasionată de produse personalizate...</p>',
    status: 'PUBLISHED',
    publishedAt: '2025-01-01T10:00:00Z',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-05T14:30:00Z',
    seoTitle: 'Despre Noi - sanduta.art',
    seoDescription: 'Află mai multe despre echipa și misiunea sanduta.art',
  },
  {
    id: '2',
    title: 'Contact',
    slug: 'contact',
    content: '<h1>Contact</h1><p>Email: contact@sanduta.art</p>',
    status: 'PUBLISHED',
    publishedAt: '2025-01-02T11:00:00Z',
    createdAt: '2025-01-02T11:00:00Z',
    updatedAt: '2025-01-02T11:00:00Z',
  },
  {
    id: '3',
    title: 'Politica de Confidențialitate',
    slug: 'politica-confidentialitate',
    content: '<h1>Politica de Confidențialitate</h1><p>Draft...</p>',
    status: 'DRAFT',
    createdAt: '2025-01-08T09:00:00Z',
    updatedAt: '2025-01-08T09:00:00Z',
  },
];

// GET /api/admin/cms/pages
export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:CMS:Pages', 'Fetching pages', { userId: user.id });

    return NextResponse.json(mockPages);
  } catch (err) {
    logApiError('API:CMS:Pages', err);
    return createErrorResponse('Failed to fetch pages', 500);
  }
}

// POST /api/admin/cms/pages
export async function POST(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await req.json();
    logger.info('API:CMS:Pages', 'Creating page', { userId: user.id, title: body.title });

    const newPage = {
      id: String(mockPages.length + 1),
      ...body,
      publishedAt: body.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPages.push(newPage);

    return NextResponse.json(newPage, { status: 201 });
  } catch (err) {
    logApiError('API:CMS:Pages', err);
    return createErrorResponse('Failed to create page', 500);
  }
}
