/**
 * API: Campaigns Management
 * GET /api/admin/marketing/campaigns - Lista campanii
 * POST /api/admin/marketing/campaigns - Creare campanie
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data pentru demo
const mockCampaigns = [
  {
    id: '1',
    name: 'Flash Sale Weekend',
    type: 'FLASH_SALE',
    status: 'ACTIVE',
    discount: 20,
    discountType: 'PERCENTAGE',
    description: 'Reducere 20% la toate produsele - doar 3 zile!',
    startDate: '2026-01-10',
    endDate: '2026-01-12',
    priority: 5,
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z',
    views: 1250,
    clicks: 320,
    conversions: 89,
    revenue: 15670,
  },
  {
    id: '2',
    name: 'Campanie Sf. Valentin',
    type: 'SEASONAL',
    status: 'DRAFT',
    discount: 15,
    discountType: 'PERCENTAGE',
    description: 'Reducere 15% la produse personalizate pentru Sf. Valentin',
    startDate: '2026-02-10',
    endDate: '2026-02-14',
    priority: 3,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
    views: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
  },
  {
    id: '3',
    name: 'Bundle 3 Produse',
    type: 'BUNDLE',
    status: 'ACTIVE',
    discount: 25,
    discountType: 'PERCENTAGE',
    description: 'Cumpără 3 produse și primești 25% reducere',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    priority: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    views: 890,
    clicks: 156,
    conversions: 34,
    revenue: 8940,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    logger.info('API:Campaigns', 'Fetching campaigns', { userId: user.id });

    // TODO: Replace with Prisma query
    // const campaigns = await prisma.campaign.findMany({
    //   orderBy: { createdAt: 'desc' },
    //   include: {
    //     products: true,
    //     categories: true,
    //   },
    // });

    return NextResponse.json(mockCampaigns);
  } catch (err) {
    logApiError('API:Campaigns', err);
    return createErrorResponse('Failed to fetch campaigns', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await req.json();
    logger.info('API:Campaigns', 'Creating campaign', { userId: user.id, name: body.name });

    // Validare
    if (!body.name || !body.type || !body.startDate || !body.endDate) {
      return createErrorResponse('Missing required fields', 400);
    }

    // TODO: Replace with Prisma create
    // const campaign = await prisma.campaign.create({
    //   data: {
    //     name: body.name,
    //     type: body.type,
    //     status: 'DRAFT',
    //     discount: body.discount,
    //     discountType: body.discountType,
    //     description: body.description,
    //     startDate: body.startDate,
    //     endDate: body.endDate,
    //     priority: body.priority || 1,
    //     productIds: body.productIds,
    //     categoryIds: body.categoryIds,
    //     bundleProducts: body.bundleProducts,
    //   },
    // });

    const newCampaign = {
      id: String(mockCampaigns.length + 1),
      name: body.name,
      type: body.type,
      status: 'DRAFT' as const,
      discount: body.discount,
      discountType: body.discountType,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      priority: body.priority || 1,
      productIds: body.productIds,
      categoryIds: body.categoryIds,
      bundleProducts: body.bundleProducts,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };

    mockCampaigns.push(newCampaign);

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (err) {
    logApiError('API:Campaigns', err);
    return createErrorResponse('Failed to create campaign', 500);
  }
}
