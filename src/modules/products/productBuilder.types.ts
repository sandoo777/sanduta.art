import type { Product, ProductType } from './types';

export interface ProductOption {
  id?: string;
  name: string;
  type: 'dropdown' | 'radio' | 'checkbox' | 'numeric' | 'color';
  required: boolean;
  values: Array<{
    label: string;
    value: string;
    priceModifier?: number;
  }>;
  rules?: Array<{
    condition: string;
    action: string;
  }>;
}

export interface PriceBreak {
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number;
}

export interface ProductPricing {
  type: 'fixed' | 'per_unit' | 'per_sqm' | 'per_weight' | 'formula';
  basePrice: number;
  priceBreaks: PriceBreak[];
  formula?: string;
  discounts?: Array<{
    type: 'percentage' | 'fixed';
    value: number;
    minQuantity?: number;
  }>;
}

export interface ProductProduction {
  operations: Array<{
    name: string;
    machineId?: string;
    timeMinutes: number;
    order: number;
  }>;
  estimatedTime: number;
  notes?: string;
}

export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface ProductDimensions {
  widthMin?: number;
  widthMax?: number;
  heightMin?: number;
  heightMax?: number;
  unit: 'mm' | 'cm' | 'm';
}

export interface FullProduct extends Product {
  descriptionShort?: string | null;
  options: ProductOption[];
  dimensions?: ProductDimensions;
  compatibleMaterials: string[];
  compatiblePrintMethods: string[];
  compatibleFinishing: string[];
  pricing: ProductPricing;
  production?: ProductProduction;
  seo?: ProductSEO;
}

export interface CreateFullProductInput {
  // Basic info
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  descriptionShort?: string;
  type: ProductType;
  categoryId: string;
  active: boolean;

  // Options & Configuration
  options?: ProductOption[];
  dimensions?: ProductDimensions;
  compatibleMaterials?: string[];
  compatiblePrintMethods?: string[];
  compatibleFinishing?: string[];

  // Pricing
  pricing: ProductPricing;

  // Production
  production?: ProductProduction;

  // SEO
  seo?: ProductSEO;

  // Images
  images?: string[];
}
