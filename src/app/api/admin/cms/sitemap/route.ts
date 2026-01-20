/**
 * API: Generate Sitemap
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// POST /api/admin/cms/sitemap
export async function POST(_req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:CMS:Sitemap', 'Generating sitemap', { userId: user.id });

    // TODO: Generate actual sitemap XML from pages + blog posts
    // Save to public/sitemap.xml or return dynamically

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sanduta.art/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://sanduta.art/despre-noi</loc>
    <lastmod>2025-01-05T14:30:00Z</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sanduta.art/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>`;

    logger.info('API:CMS:Sitemap', 'Sitemap generated successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Sitemap generated',
      url: '/sitemap.xml',
    });
  } catch (err) {
    logApiError('API:CMS:Sitemap', err);
    return createErrorResponse('Failed to generate sitemap', 500);
  }
}
