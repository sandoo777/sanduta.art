import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');

    const page = Math.max(Number.parseInt(searchParams.get('page') ?? '1', 10) || 1, 1);
    const limitRaw = Number.parseInt(searchParams.get('limit') ?? '20', 10) || 20;
    const limit = Math.min(Math.max(limitRaw, 1), 100);
    const skip = (page - 1) * limit;

    const where: {
      active?: boolean;
      categoryId?: string;
    } = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status === 'ACTIVE') {
      where.active = true;
    } else if (status === 'INACTIVE') {
      where.active = false;
    } else if (!includeInactive) {
      where.active = true;
    }

    logger.info('API:Products', 'Fetching products', { includeInactive, categoryId, status, page, limit });
    
    const products = await prisma.product.findMany({
      where,
      orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    });

    const serializedProducts = products.map((product) => ({
      ...product,
      status: product.active ? 'ACTIVE' : 'INACTIVE',
    }));
    
    logger.info('API:Products', `Successfully fetched ${products.length} products`);
    
    const response = NextResponse.json(serializedProducts);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return response;
  } catch (error) {
    logApiError('API:Products', error, { action: 'fetch_products' });
    return createErrorResponse('Failed to fetch products. Please try again later.', 500);
  }
}