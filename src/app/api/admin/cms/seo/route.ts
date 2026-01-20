/**
 * API: CMS SEO Settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data
let mockSeoSettings = {
  id: '1',
  siteName: 'sanduta.art',
  siteDescription: 'Produse personalizate de calitate premium. Tricouri, cupe, hanorace și multe altele cu design-ul tău.',
  siteUrl: 'https://sanduta.art',
  defaultTitle: 'sanduta.art - Produse Personalizate Premium',
  defaultDescription: 'Creează produse unice cu design-ul tău. Tricouri, hanorace, cupe personalizate. Calitate premium, livrare rapidă.',
  defaultKeywords: ['produse personalizate', 'print on demand', 'tricouri personalizate', 'cadouri personalizate'],
  favicon: 'https://sanduta.art/favicon.ico',
  ogDefaultImage: 'https://sanduta.art/og-image.jpg',
  twitterHandle: '@sandutaart',
  googleAnalyticsId: 'G-XXXXXXXXXX',
  googleTagManagerId: 'GTM-XXXXXXX',
  facebookPixelId: '',
  robotsTxt: `User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/

Sitemap: https://sanduta.art/sitemap.xml`,
  enableSitemap: true,
  updatedAt: '2025-01-10T14:30:00Z',
};

// GET /api/admin/cms/seo
export async function GET(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:CMS:SEO', 'Fetching SEO settings', { userId: user.id });

    return NextResponse.json(mockSeoSettings);
  } catch (err) {
    logApiError('API:CMS:SEO', err);
    return createErrorResponse('Failed to fetch SEO settings', 500);
  }
}

// PATCH /api/admin/cms/seo
export async function PATCH(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await req.json();
    logger.info('API:CMS:SEO', 'Updating SEO settings', { userId: user.id });

    mockSeoSettings = {
      ...mockSeoSettings,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockSeoSettings);
  } catch (err) {
    logApiError('API:CMS:SEO', err);
    return createErrorResponse('Failed to update SEO settings', 500);
  }
}
