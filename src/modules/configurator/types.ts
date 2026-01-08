import type { ProductType } from '@/modules/products/types';
import type {
  ProductOption,
  ProductPricing,
  ProductProduction,
  ProductDimensions,
  ProductSEO,
} from '@/modules/products/productBuilder.types';

export type DimensionUnit = 'mm' | 'cm' | 'm';

export interface ConfiguratorOptionValue {
  id: string;
  label: string;
  value: string;
  priceModifier?: number;
  disabled?: boolean;
  hidden?: boolean;
}

export interface ConfiguratorOption {
  id: string;
  name: string;
  type: ProductOption['type'];
  required: boolean;
  values: ConfiguratorOptionValue[];
  rules?: ProductOption['rules'];
}

export interface MaterialConstraints {
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  unit?: DimensionUnit;
}

export interface ConfiguratorMaterial {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  priceModifier?: number;
  constraints?: MaterialConstraints;
  notes?: string | null;
}

export interface ConfiguratorPrintMethod {
  id: string;
  name: string;
  type: string;
  costPerM2?: number | null;
  costPerSheet?: number | null;
  maxWidth?: number | null;
  maxHeight?: number | null;
  materialIds: string[];
}

export interface ConfiguratorFinishing {
  id: string;
  name: string;
  costFix?: number | null;
  costPerUnit?: number | null;
  costPerM2?: number | null;
  priceModifier?: number | null;
  compatibleMaterialIds: string[];
  compatiblePrintMethodIds: string[];
}

export interface ConfiguratorProduct {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  descriptionShort?: string | null;
  type: ProductType;
  active: boolean;
  options: ConfiguratorOption[];
  materials: ConfiguratorMaterial[];
  printMethods: ConfiguratorPrintMethod[];
  finishing: ConfiguratorFinishing[];
  pricing: ProductPricing;
  production?: ProductProduction;
  dimensions?: ProductDimensions;
  seo?: ProductSEO;
  images: string[];
  defaultImage: string;
  defaults: {
    materialId?: string;
    printMethodId?: string;
    finishingIds: string[];
    optionValues: Record<string, string | string[]>;
    quantity: number;
  };
}

export interface ConfiguratorSelections {
  materialId?: string;
  printMethodId?: string;
  finishingIds: string[];
  options: Record<string, string | string[]>;
  quantity: number;
  dimension?: {
    width?: number;
    height?: number;
    unit?: DimensionUnit;
  };
}

export interface ConfiguratorPriceBreak {
  minQuantity: number;
  maxQuantity?: number | null;
  price?: number;
  discount?: number;
}

export interface ConfiguratorPriceSummary {
  base: number;
  basePrice: number;
  materialCost: number;
  printCost: number;
  finishingCost: number;
  optionCost: number;
  discounts: number;
  subtotal: number;
  total: number;
  pricePerUnit?: number;
  quantity: number;
  area?: number;
  pricingType: ProductPricing['type'];
  appliedPriceBreak?: {
    minQuantity: number;
    maxQuantity: number | null;
    pricePerUnit: number;
  };
}
