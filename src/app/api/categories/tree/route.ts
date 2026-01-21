import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { CategoryTreeNode } from '@/types/models';
import { categoryTreeResponseSchema } from '@/lib/validations/category';

/**
 * GET /api/categories/tree
 * 
 * Returns hierarchical category tree with product counts
 * Type-safe with Zod validation
 */
export async function GET() {
  try {
    logger.info('API:Categories', 'Fetching category tree');

    // Fetch all categories with product counts - parentId is part of Category model
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        color: true,
        icon: true,
        order: true,
        active: true,
        featured: true,
        parentId: true, // Explicit select - no cast needed
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    logger.info('API:Categories', `Fetched ${categories.length} categories`);

    // Build tree structure with type safety
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: create typed nodes
    categories.forEach(category => {
      const node: CategoryTreeNode = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        color: category.color,
        icon: category.icon,
        order: category.order,
        active: category.active,
        featured: category.featured,
        productCount: category._count.products,
        parentId: category.parentId,
        children: []
      };
      categoryMap.set(category.id, node);
    });

    // Second pass: build hierarchy - no casts needed
    categories.forEach(category => {
      const node = categoryMap.get(category.id);
      if (!node) return; // Type guard

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Orphaned child (parent doesn't exist) - treat as root
          logger.warn('API:Categories', `Category ${category.id} has non-existent parent ${category.parentId}`);
          rootCategories.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    // Sort children recursively
    const sortChildren = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      nodes.forEach(node => sortChildren(node.children));
    };
    sortChildren(rootCategories);

    const response = {
      categories: rootCategories,
      totalCount: categories.length
    };

    // Validate response structure with Zod
    const validatedResponse = categoryTreeResponseSchema.parse(response);

    logger.info('API:Categories', `Built tree with ${rootCategories.length} root categories`);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    logApiError('API:Categories', error);
    return createErrorResponse('Failed to fetch category tree', 500);
  }
}
