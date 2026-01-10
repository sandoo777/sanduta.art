/**
 * API: CMS Blog Posts - CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data
const mockCategories = [
  { id: '1', name: 'Tutoriale', slug: 'tutoriale', postCount: 3 },
  { id: '2', name: 'Știri', slug: 'stiri', postCount: 2 },
  { id: '3', name: 'Ghiduri', slug: 'ghiduri', postCount: 4 },
];

let mockPosts = [
  {
    id: '1',
    title: 'Ghid Complet Produse Personalizate 2025',
    slug: 'ghid-produse-personalizate-2025',
    content: '<h1>Ghid Complet</h1><p>Află tot ce trebuie să știi despre produsele personalizate...</p>',
    excerpt: 'Află tot ce trebuie să știi despre produsele personalizate în 2025',
    featuredImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
    categoryId: '3',
    category: mockCategories[2],
    tags: ['personalizare', 'ghid', 'tendințe'],
    authorId: '1',
    authorName: 'Admin',
    status: 'PUBLISHED',
    publishedAt: '2025-01-10T10:00:00Z',
    createdAt: '2025-01-09T14:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
    views: 245,
    shares: 12,
  },
  {
    id: '2',
    title: 'Cum Să Alegi Materialul Potrivit',
    slug: 'cum-sa-alegi-materialul',
    content: '<h1>Ghid Materiale</h1><p>Tipuri de materiale pentru print...</p>',
    excerpt: 'Alege materialul perfect pentru proiectul tău',
    featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    categoryId: '1',
    category: mockCategories[0],
    tags: ['materiale', 'tutorial'],
    authorId: '1',
    authorName: 'Admin',
    status: 'PUBLISHED',
    publishedAt: '2025-01-08T12:00:00Z',
    createdAt: '2025-01-08T09:00:00Z',
    updatedAt: '2025-01-08T12:00:00Z',
    views: 189,
    shares: 8,
  },
  {
    id: '3',
    title: 'Noutăți Ianuarie 2025',
    slug: 'noutati-ianuarie-2025',
    content: '<h1>Noutăți</h1><p>Draft pentru noutățile lunii...</p>',
    categoryId: '2',
    category: mockCategories[1],
    tags: ['noutăți'],
    authorId: '1',
    authorName: 'Admin',
    status: 'DRAFT',
    createdAt: '2025-01-11T11:00:00Z',
    updatedAt: '2025-01-11T11:00:00Z',
  },
];

// GET /api/admin/cms/blog
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:CMS:Blog', 'Fetching blog posts', { userId: user.id });

    return NextResponse.json(mockPosts);
  } catch (err) {
    logApiError('API:CMS:Blog', err);
    return createErrorResponse('Failed to fetch blog posts', 500);
  }
}

// POST /api/admin/cms/blog
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await req.json();
    logger.info('API:CMS:Blog', 'Creating blog post', { userId: user.id, title: body.title });

    const category = mockCategories.find(c => c.id === body.categoryId);

    const newPost = {
      id: String(mockPosts.length + 1),
      ...body,
      category,
      authorId: user.id,
      authorName: user.name || 'Admin',
      publishedAt: body.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      shares: 0,
    };

    mockPosts.push(newPost);

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    logApiError('API:CMS:Blog', err);
    return createErrorResponse('Failed to create blog post', 500);
  }
}
