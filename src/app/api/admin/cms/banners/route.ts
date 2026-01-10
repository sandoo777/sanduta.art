/**
 * API: CMS Banners - CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data
let mockBanners = [
  {
    id: '1',
    title: 'Reduceri de Iarnă',
    subtitle: 'Până la 50% reducere la produse selectate',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
    buttonText: 'Vezi Oferte',
    buttonLink: '/promotii',
    position: 'HOMEPAGE_HERO',
    order: 0,
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    active: true,
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
    impressions: 15420,
    clicks: 892,
    ctr: 5.78,
  },
  {
    id: '2',
    title: 'Produse Noi',
    subtitle: 'Descoperă colecția 2025',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600',
    buttonText: 'Explorează',
    buttonLink: '/produse',
    position: 'HOMEPAGE_GRID',
    order: 1,
    active: true,
    createdAt: '2025-01-05T11:00:00Z',
    updatedAt: '2025-01-05T11:00:00Z',
    impressions: 8234,
    clicks: 445,
    ctr: 5.40,
  },
  {
    id: '3',
    title: 'Banner Sidebar Inactive',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    position: 'SIDEBAR',
    order: 0,
    active: false,
    createdAt: '2025-01-08T14:00:00Z',
    updatedAt: '2025-01-08T14:00:00Z',
  },
];

// GET /api/admin/cms/banners
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const position = searchParams.get('position');

    logger.info('API:CMS:Banners', 'Fetching banners', { userId: user.id, position });

    let banners = mockBanners;
    if (position) {
      banners = banners.filter(b => b.position === position);
    }

    return NextResponse.json(banners);
  } catch (err) {
    logApiError('API:CMS:Banners', err);
    return createErrorResponse('Failed to fetch banners', 500);
  }
}

// POST /api/admin/cms/banners
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await req.json();
    logger.info('API:CMS:Banners', 'Creating banner', { userId: user.id, title: body.title });

    const newBanner = {
      id: String(mockBanners.length + 1),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      impressions: 0,
      clicks: 0,
      ctr: 0,
    };

    mockBanners.push(newBanner);

    return NextResponse.json(newBanner, { status: 201 });
  } catch (err) {
    logApiError('API:CMS:Banners', err);
    return createErrorResponse('Failed to create banner', 500);
  }
}
