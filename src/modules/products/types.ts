export type ProductType = 'STANDARD' | 'CONFIGURABLE' | 'CUSTOM';

export interface ProductImage {
  id: string;
  url: string;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  type: ProductType;
  price: number;
  categoryId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images?: ProductImage[];
}

export interface CreateProductInput {
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  type: ProductType;
  price: number;
  categoryId: string;
  active?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  type?: ProductType;
  price?: number;
  categoryId?: string;
  active?: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  type?: ProductType | 'all';
  activeOnly?: boolean;
}

export const PRODUCT_TYPES = [
  { value: 'STANDARD', label: 'Standard', color: 'blue' },
  { value: 'CONFIGURABLE', label: 'Configurabil', color: 'purple' },
  { value: 'CUSTOM', label: 'Custom', color: 'gray' },
] as const;
