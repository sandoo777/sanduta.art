import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    logger.info('API:Products', 'Fetching all products');
    
    const products = await prisma.product.findMany();
    
    logger.info('API:Products', `Successfully fetched ${products.length} products`);
    
    const response = NextResponse.json(products);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return response;
  } catch (_error) {
    logApiError('API:Products', error, { action: 'fetch_products' });
    return createErrorResponse('Failed to fetch products. Please try again later.', 500);
  }
}