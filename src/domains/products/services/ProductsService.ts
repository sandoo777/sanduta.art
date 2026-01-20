// Products Service - Business Logic

import { prisma } from '@/lib/prisma';
import {
  ProductsQueryParams,
  ProductsListResponse,
  CreateProductDTO,
  UpdateProductDTO,
  ProductServiceResult,
  ProductWithRelations,
} from '../types';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class ProductsService {
  async getProducts(
    params: ProductsQueryParams = {}
  ): Promise<ProductServiceResult<ProductsListResponse>> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        categoryId,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      const skip = (page - 1) * limit;

      const where: Prisma.ProductWhereInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (categoryId) where.categoryId = categoryId;
      if (typeof isActive === 'boolean') where.isActive = isActive;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: true,
            variants: true,
            _count: {
              select: {
                variants: true,
                orderItems: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      return {
        success: true,
        data: {
          products,
          total,
          page,
          limit,
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      logger.error('ProductsService', 'Failed to fetch products', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      };
    }
  }

  async getProductById(
    id: string
  ): Promise<ProductServiceResult<ProductWithRelations>> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          variants: true,
          _count: {
            select: {
              variants: true,
              orderItems: true,
            },
          },
        },
      });

      if (!product) {
        return { success: false, error: 'Product not found' };
      }

      return { success: true, data: product };
    } catch (error) {
      logger.error('ProductsService', 'Failed to fetch product', { error, productId: id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      };
    }
  }

  async createProduct(data: CreateProductDTO): Promise<ProductServiceResult> {
    try {
      const { variants, ...productData } = data;

      const product = await prisma.product.create({
        data: {
          ...productData,
          ...(variants && {
            variants: {
              create: variants,
            },
          }),
        },
        include: {
          variants: true,
        },
      });

      logger.info('ProductsService', 'Product created', { productId: product.id });

      return { success: true, data: product };
    } catch (error) {
      logger.error('ProductsService', 'Failed to create product', { error, data });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      };
    }
  }

  async updateProduct(
    id: string,
    updates: UpdateProductDTO
  ): Promise<ProductServiceResult> {
    try {
      const product = await prisma.product.update({
        where: { id },
        data: updates,
        include: {
          variants: true,
        },
      });

      logger.info('ProductsService', 'Product updated', { productId: id });

      return { success: true, data: product };
    } catch (error) {
      logger.error('ProductsService', 'Failed to update product', {
        error,
        productId: id,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      };
    }
  }

  async deleteProduct(id: string): Promise<ProductServiceResult> {
    try {
      // Check if product is used in orders
      const orderItemsCount = await prisma.orderItem.count({
        where: { productId: id },
      });

      if (orderItemsCount > 0) {
        return {
          success: false,
          error: 'Cannot delete product that has been ordered. Consider deactivating it instead.',
        };
      }

      await prisma.product.delete({
        where: { id },
      });

      logger.info('ProductsService', 'Product deleted', { productId: id });

      return { success: true };
    } catch (error) {
      logger.error('ProductsService', 'Failed to delete product', {
        error,
        productId: id,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      };
    }
  }
}

export const productsService = new ProductsService();
