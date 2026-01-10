/**
 * Public API: Get blog post by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data
const mockPosts = [
  {
    id: '1',
    title: 'Ghid Complet Produse Personalizate 2025',
    slug: 'ghid-produse-personalizate-2025',
    content: `<div class="prose max-w-none">
      <p>În 2025, produsele personalizate sunt mai populare ca niciodată. Iată tot ce trebuie să știi...</p>
      <h2>De ce produse personalizate?</h2>
      <p>Produsele personalizate oferă unicitate și exprimă personalitatea ta...</p>
      <h2>Tipuri de produse</h2>
      <ul>
        <li>Tricouri și hanorace personalizate</li>
        <li>Cupe și căni cu design custom</li>
        <li>Accesorii personalizate</li>
      </ul>
      <h2>Procesul de personalizare</h2>
      <p>1. Alege produsul<br>2. Încarcă design-ul<br>3. Plasează comanda<br>4. Primește produsul în 5-7 zile</p>
    </div>`,
    excerpt: 'Află tot ce trebuie să știi despre produsele personalizate în 2025',
    featuredImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
    category: { id: '3', name: 'Ghiduri', slug: 'ghiduri' },
    tags: ['personalizare', 'ghid', 'tendințe'],
    authorName: 'Admin',
    status: 'PUBLISHED',
    publishedAt: '2025-01-10T10:00:00Z',
    views: 245,
    seoTitle: 'Ghid Complet Produse Personalizate 2025',
    seoDescription: 'Află tot ce trebuie să știi despre produsele personalizate în 2025',
  },
  {
    id: '2',
    title: 'Cum Să Alegi Materialul Potrivit',
    slug: 'cum-sa-alegi-materialul',
    content: `<div class="prose max-w-none">
      <p>Alegerea materialului potrivit este esențială pentru calitatea produsului final...</p>
      <h2>Materiale pentru tricouri</h2>
      <p>Bumbac 100% - cel mai popular și confortabil...</p>
    </div>`,
    excerpt: 'Alege materialul perfect pentru proiectul tău',
    featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: { id: '1', name: 'Tutoriale', slug: 'tutoriale' },
    tags: ['materiale', 'tutorial'],
    authorName: 'Admin',
    status: 'PUBLISHED',
    publishedAt: '2025-01-08T12:00:00Z',
    views: 189,
  },
];

// GET /api/cms/blog/[slug]
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    logger.info('API:CMS:Blog:Public', 'Fetching post by slug', { slug });

    const post = mockPosts.find(p => p.slug === slug && p.status === 'PUBLISHED');

    if (!post) {
      return createErrorResponse('Blog post not found', 404);
    }

    // Increment views (TODO: in database)
    // post.views++;

    return NextResponse.json(post);
  } catch (err) {
    logApiError('API:CMS:Blog:Public', err);
    return createErrorResponse('Failed to fetch blog post', 500);
  }
}
