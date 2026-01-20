// Catalog Service - Public Product Catalog Logic

import { prisma } from '@/lib/prisma';
import { CatalogQueryParams, CatalogResponse, CategoryWithProducts } from '../types';
import { Prisma } from '@prisma/client';

export class CatalogService {
  /**
   * Obține produse pentru catalog public
   */
  async getProducts(params: CatalogQueryParams = {}): Promise<CatalogResponse> {
    const {
      page = 1,
      limit = 24,
      search,
      categoryId,
      categorySlug,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true, // Only active products in catalog
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice) where.price.gte = String(minPrice);
      if (maxPrice) where.price.lte = String(maxPrice);
    }

    // Determine sort
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy = { price: sortOrder };
    } else if (sortBy === 'name') {
      orderBy = { name: sortOrder };
    } else if (sortBy === 'popular') {
      // TODO: Implement popularity sorting based on order count
      orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  /**
   * Obține categorii pentru meniu
   */
  async getCategories(): Promise<CategoryWithProducts[]> {
    return prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        children: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Obține o categorie cu produsele sale
   */
  async getCategoryBySlug(slug: string): Promise<CategoryWithProducts | null> {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: {
            isActive: true,
          },
          take: 50,
        },
        children: {
          where: {
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }
}

export const catalogService = new CatalogService();
