// Products Domain - Types

import { Product, Category, ProductVariant } from '@prisma/client';

export type { Product, Category, ProductVariant };

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN ENTITIES
// ═══════════════════════════════════════════════════════════════════════════

export interface ProductWithRelations extends Product {
  category?: Category | null;
  variants?: ProductVariant[];
  _count?: {
    variants: number;
    orderItems: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateProductDTO {
  name: string;
  description?: string;
  sku?: string;
  price: string;
  categoryId?: string;
  images?: string[];
  stock?: number;
  isActive?: boolean;
  productionTime?: number;
  variants?: CreateVariantDTO[];
}

export interface CreateVariantDTO {
  name: string;
  sku?: string;
  price: string;
  stock?: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  sku?: string;
  price?: string;
  categoryId?: string;
  images?: string[];
  stock?: number;
  isActive?: boolean;
  productionTime?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUERY PARAMS
// ═══════════════════════════════════════════════════════════════════════════

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE RESPONSES
// ═══════════════════════════════════════════════════════════════════════════

export interface ProductsListResponse {
  products: ProductWithRelations[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
