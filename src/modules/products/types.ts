/**
 * Product Types Module
 * Re-exports core types from @/types/models + domain-specific extensions
 */

// Re-export core types
export type { 
  Product, 
  ProductVariant,
  ProductImage as ProductImageBase, 
  Category,
  ProductType 
} from '@/types/models';

// Legacy/extended ProductImage (keep if needed locally)
export interface ProductImage {
  id: string;
  url: string;
  productId: string;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  type: 'STANDARD' | 'CONFIGURABLE' | 'CUSTOM';
  price: number;
  categoryId: string;
  active?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  type?: 'STANDARD' | 'CONFIGURABLE' | 'CUSTOM';
  price?: number;
  categoryId?: string;
  active?: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  type?: 'STANDARD' | 'CONFIGURABLE' | 'CUSTOM' | 'all';
  activeOnly?: boolean;
}

export const PRODUCT_TYPES = [
  { value: 'STANDARD', label: 'Standard', color: 'blue' },
  { value: 'CONFIGURABLE', label: 'Configurabil', color: 'purple' },
  { value: 'CUSTOM', label: 'Custom', color: 'gray' },
] as const;
