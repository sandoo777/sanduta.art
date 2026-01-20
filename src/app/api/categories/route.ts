import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

/**
 * GET /api/categories
 * 
 * Returnează toate categoriile active, inclusiv ierarhia (parent/children)
 * Pentru utilizare pe frontend în filtre și navigare
 */
export async function GET() {
  try {
    logger.info('API:Categories', 'Fetching all active categories');

    const categories = await prisma.category.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        parentId: true,
        order: true,
        description: true,
        image: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    logger.info('API:Categories', `Found ${categories.length} active categories`);

    return NextResponse.json(categories);
  } catch (error) {
    logApiError('API:Categories', error);
    return createErrorResponse('Failed to fetch categories', 500);
  }
}
