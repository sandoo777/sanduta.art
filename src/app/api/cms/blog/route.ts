/**
 * Public API: List all blog posts
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data
const mockPosts = [
  {
    id: '1',
    title: 'Ghid Complet Produse Personalizate 2025',
    slug: 'ghid-produse-personalizate-2025',
    excerpt: 'Află tot ce trebuie să știi despre produsele personalizate în 2025',
    featuredImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
    category: { id: '3', name: 'Ghiduri', slug: 'ghiduri' },
    tags: ['personalizare', 'ghid', 'tendințe'],
    authorName: 'Admin',
    publishedAt: '2025-01-10T10:00:00Z',
    views: 245,
  },
  {
    id: '2',
    title: 'Cum Să Alegi Materialul Potrivit',
    slug: 'cum-sa-alegi-materialul',
    excerpt: 'Alege materialul perfect pentru proiectul tău',
    featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: { id: '1', name: 'Tutoriale', slug: 'tutoriale' },
    tags: ['materiale', 'tutorial'],
    authorName: 'Admin',
    publishedAt: '2025-01-08T12:00:00Z',
    views: 189,
  },
];

// GET /api/cms/blog
export async function GET(req: NextRequest) {
  try {
    logger.info('API:CMS:Blog:Public', 'Listing blog posts');

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    let posts = mockPosts;

    if (category) {
      posts = posts.filter(p => p.category.slug === category);
    }

    if (tag) {
      posts = posts.filter(p => p.tags.includes(tag));
    }

    // Sort by published date DESC
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json(posts);
  } catch (err) {
    logApiError('API:CMS:Blog:Public', err);
    return createErrorResponse('Failed to fetch blog posts', 500);
  }
}
