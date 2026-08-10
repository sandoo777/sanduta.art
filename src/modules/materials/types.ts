export type MaterialCategory = 'sheet' | 'roll' | 'rigid' | 'paper' | 'vinyl' | 'textile' | 'other';

export interface MaterialCategoryInfo {
  id: string;
  name: string;
  description?: string | null;
  requiresThickness: boolean;
  requiresDensity: boolean;
  requiresPricePerSqm: boolean;
  requiresPricePerMeter: boolean;
  requiresPricePerUnit: boolean;
  requiresWastePercent: boolean;
  active: boolean;
}

export interface MaterialCompatibleMethod {
  id: string;
  name: string;
  type: string;
  active: boolean;
}

export interface MaterialCompatibleEquipment {
  id: string;
  name: string;
  type: string;
  equipmentType: string;
  status: string;
  active: boolean;
}

export interface Material {
  id: string;
  name: string;
  categoryId: string;
  category: MaterialCategory;
  categoryInfo?: MaterialCategoryInfo | null;
  consumptionType?: 'AREA_BASED' | 'DIRECT';
  thickness: number | null;
  density: number | null;
  purchasePrice: number | null;
  salePrice: number | null;
  salePriceMode: 'amount' | 'percent';
  salePricePercent: number | null;
  // Backward-compatible aliases used in legacy forms/components.
  pricePerSqm?: number | null;
  pricePerMeter?: number | null;
  pricePerUnit?: number | null;
  wastePercent: number;
  active: boolean;
  printMethods?: MaterialCompatibleMethod[];
  printMethodIds?: string[];
  compatibleMethods?: string[];
  compatibleMethodIds?: string[];
  compatibleEquipment?: MaterialCompatibleEquipment[];
  compatibleEquipmentIds?: string[];
  sku: string | null;
  unit: 'liter' | 'ml' | 'gram' | 'kg' | 'unit' | 'm2' | 'meter' | 'pcs' | 'sheet';
  stock: number;
  minStock: number;
  costPerUnit?: number;
  notes: string | null;
  finishType: 'mat' | 'lucios' | 'satin' | 'soft-touch' | null;
  packagingLabel: string | null;
  packagingQty: number | null;
  packagingPrice: number | null;
  properties: Record<string, string | number | boolean> | null;
  createdAt: string;
  updatedAt: string;
  lowStock?: boolean;
  totalConsumption?: number;
}

export type UsageUnitValue = "sqm" | "meter" | "unit";

export interface MaterialUsage {
  id: string;
  materialId: string;
  jobId: string;
  quantity: number;
  unit: 'liter' | 'ml' | 'gram' | 'kg' | 'unit' | 'm2' | 'meter' | 'pcs';
  wastePercent: number;
  totalUsed: number;
  cost: number;
  createdAt: string;
  job?: {
    id: string;
    name: string;
    status: string;
    priority: string;
    order: {
      id: string;
      customerName: string;
      customerEmail: string;
    };
  };
}

export interface MaterialWithDetails extends Material {
  consumption: MaterialUsage[];
}

export interface CreateMaterialInput {
  name: string;
  category?: MaterialCategory;
  categoryId?: string;
  thickness?: number | null;
  density?: number | null;
  purchasePrice?: number | null;
  salePrice?: number | null;
  salePriceMode?: 'amount' | 'percent';
  salePricePercent?: number | null;
  pricePerSqm?: number | null;
  pricePerMeter?: number | null;
  pricePerUnit?: number | null;
  wastePercent?: number;
  active?: boolean;
  printMethodIds?: string[];
  compatibleMethods?: string[];
  compatibleEquipment?: string[];
  sku?: string;
  unit: string;
  stock?: number;
  minStock?: number;
  costPerUnit?: number;
  notes?: string;
}

export interface UpdateMaterialInput {
  name?: string;
  category?: MaterialCategory;
  categoryId?: string;
  thickness?: number | null;
  density?: number | null;
  purchasePrice?: number | null;
  salePrice?: number | null;
  salePriceMode?: 'amount' | 'percent';
  salePricePercent?: number | null;
  pricePerSqm?: number | null;
  pricePerMeter?: number | null;
  pricePerUnit?: number | null;
  wastePercent?: number;
  active?: boolean;
  printMethodIds?: string[];
  compatibleMethods?: string[];
  compatibleEquipment?: string[];
  sku?: string;
  unit?: string;
  stock?: number;
  minStock?: number;
  costPerUnit?: number;
  notes?: string;
}

export interface ConsumeMaterialInput {
  jobId: string;
  quantity: number;
  unit?: 'liter' | 'ml' | 'gram' | 'kg' | 'unit' | 'm2' | 'meter' | 'pcs';
  rollWidthMeters?: number;
}

export interface MaterialFilters {
  search?: string;
  lowStock?: boolean;
  unit?: string;
}
