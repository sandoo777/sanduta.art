import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('API:Categories', 'Fetching category tree');

    // Fetch all categories with product counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Build tree structure (assuming parentId field exists)
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map
    categories.forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        productCount: category._count.products,
        children: []
      });
    });

    // Second pass: build tree
    categories.forEach(category => {
      const node = categoryMap.get(category.id);
      if ((category as any).parentId) {
        const parent = categoryMap.get((category as any).parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootCategories.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return NextResponse.json({
      categories: rootCategories,
      totalCount: categories.length
    });
  } catch (error) {
    logApiError('API:Categories', error);
    return createErrorResponse('Failed to fetch category tree', 500);
  }
}
