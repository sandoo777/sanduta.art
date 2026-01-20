// Catalog Domain - Types (Public Product Catalog)

import { Product, Category } from '@prisma/client';

export type { Product, Category };

export interface CatalogProduct extends Product {
  category?: Category | null;
}

export interface CatalogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

export interface CatalogResponse {
  products: CatalogProduct[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  categories?: Category[];
}

export interface CategoryWithProducts extends Category {
  products?: CatalogProduct[];
  children?: Category[];
  _count?: {
    products: number;
  };
}
