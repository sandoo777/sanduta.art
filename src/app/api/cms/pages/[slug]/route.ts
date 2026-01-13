/**
 * Public API: Get page by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data (same as admin)
const mockPages = [
  {
    id: '1',
    title: 'Despre Noi',
    slug: 'despre-noi',
    content: `<div class="prose max-w-none">
      <h1>Despre sanduta.art</h1>
      <p>Suntem o echipă pasionată de produse personalizate de calitate premium. Din 2020, creăm produse unice care aduc zâmbete și exprimă personalitatea fiecărui client.</p>
      <h2>Misiunea Noastră</h2>
      <p>Transformăm ideile tale în produse fizice de excepție, folosind tehnologie de ultimă generație și materiale de calitate.</p>
      <h2>Valorile Noastre</h2>
      <ul>
        <li><strong>Calitate</strong> - Fiecare produs este realizat cu atenție la detalii</li>
        <li><strong>Creativitate</strong> - Încurajăm exprimarea unică prin design</li>
        <li><strong>Sustenabilitate</strong> - Materiale eco-friendly și producție responsabilă</li>
      </ul>
    </div>`,
    status: 'PUBLISHED',
    publishedAt: '2025-01-01T10:00:00Z',
    seoTitle: 'Despre Noi - sanduta.art',
    seoDescription: 'Află mai multe despre echipa și misiunea sanduta.art',
    ogImage: 'https://sanduta.art/og-about.jpg',
  },
  {
    id: '2',
    title: 'Contact',
    slug: 'contact',
    content: `<div class="prose max-w-none">
      <h1>Contact</h1>
      <p>Avem nevoie de ajutor sau vrei să colaborăm? Suntem aici pentru tine!</p>
      <h2>Email</h2>
      <p><a href="mailto:contact@sanduta.art">contact@sanduta.art</a></p>
      <h2>Telefon</h2>
      <p>+40 123 456 789 (Luni-Vineri, 9:00-18:00)</p>
      <h2>Adresă</h2>
      <p>Strada Exemplu Nr. 123<br>București, România</p>
    </div>`,
    status: 'PUBLISHED',
    publishedAt: '2025-01-02T11:00:00Z',
  },
];

// GET /api/cms/pages/[slug]
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    logger.info('API:CMS:Pages:Public', 'Fetching page by slug', { slug });

    const page = mockPages.find(p => p.slug === slug && p.status === 'PUBLISHED');

    if (!page) {
      return createErrorResponse('Page not found', 404);
    }

    return NextResponse.json(page);
  } catch (err) {
    logApiError('API:CMS:Pages:Public', err);
    return createErrorResponse('Failed to fetch page', 500);
  }
}
