export type MaterialCategory = 'sheet' | 'roll' | 'rigid' | 'paper' | 'vinyl' | 'textile' | 'other';
export type MaterialType = 'SUPORT_FOI' | 'SUPORT_ROLA' | 'SUPORT_M2' | 'CERNEALA' | 'CONSUMABIL';

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

export interface MaterialSupplierLink {
  id?: string;
  supplierId: string;
  name?: string | null;
  email?: string | null;
  contactEmail?: string | null;
  leadTimeDays?: number | null;
  unitCost?: number | null;
  isPrimary?: boolean;
}

export interface MaterialPriceBreak {
  id?: string;
  qtyMin: number;
  // null means the tier is open-ended (unlimited / "5000+"). Only the highest tier may be null.
  qtyMax: number | null;
  price: number;
  discount?: number | null;
}

/**
 * Canonical display label for a price-break tier's quantity range.
 * Open-ended tiers (qtyMax === null/undefined) render as "5000+"; bounded
 * tiers render as "2500–4999". Use this everywhere material pricing tiers
 * are shown (Material Editor, Material Details, cards, summaries) so the
 * open-ended-tier UI stays consistent.
 */
export function formatPriceBreakQuantityRange(qtyMin: number | string, qtyMax: number | string | null | undefined): string {
  if (qtyMax === null || qtyMax === undefined || qtyMax === '') {
    return `${qtyMin}+`;
  }
  return `${qtyMin}–${qtyMax}`;
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
  minimumMarginPercent?: number;
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
  formatId?: string | null;
  formatName?: string | null;
  width_mm?: number | null;
  height_mm?: number | null;
  colorName?: string | null;
  colorCode?: string | null;
  thumbnailUrl?: string | null;
  thumbnailImage?: string | null;
  macroTextureUrl?: string | null;
  macroTextureImage?: string | null;
  materialType?: MaterialType | null;
  consumptionRate?: number | null;
  isTemplate?: boolean;
  primarySupplierId?: string | null;
  primarySupplier?: { id: string; name: string; email?: string | null; contactEmail?: string | null } | null;
  suppliers?: MaterialSupplierLink[];
  priceBreaks?: MaterialPriceBreak[];
  sku: string | null;
  unit: 'liter' | 'ml' | 'gram' | 'kg' | 'unit' | 'm2' | 'meter' | 'pcs' | 'sheet';
  stock: number;
  minStock: number;
  costPerUnit?: number;
  notes: string | null;
  finishType: string | null;
  texture?: string | null;
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
    assignedTo?: {
      name?: string | null;
    } | null;
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
  minimumMarginPercent?: number;
  pricePerSqm?: number | null;
  pricePerMeter?: number | null;
  pricePerUnit?: number | null;
  wastePercent?: number;
  active?: boolean;
  printMethodIds?: string[];
  compatibleMethods?: string[];
  compatibleEquipment?: string[];
  primarySupplierId?: string | null;
  suppliers?: MaterialSupplierLink[];
  priceBreaks?: MaterialPriceBreak[];
  formatId?: string | null;
  formatName?: string | null;
  width_mm?: number | null;
  height_mm?: number | null;
  colorName?: string | null;
  colorCode?: string | null;
  thumbnailUrl?: string | null;
  thumbnailImage?: string | null;
  macroTextureUrl?: string | null;
  macroTextureImage?: string | null;
  materialType?: MaterialType | null;
  consumptionRate?: number | null;
  isTemplate?: boolean;
  sku?: string;
  unit: string;
  stock?: number;
  minStock?: number;
  costPerUnit?: number;
  notes?: string;
  finishType?: string | null;
  texture?: string | null;
  packagingLabel?: string | null;
  packagingQty?: number | null;
  packagingPrice?: number | null;
  properties?: Record<string, unknown> | null;
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
  minimumMarginPercent?: number;
  pricePerSqm?: number | null;
  pricePerMeter?: number | null;
  pricePerUnit?: number | null;
  wastePercent?: number;
  active?: boolean;
  printMethodIds?: string[];
  compatibleMethods?: string[];
  compatibleEquipment?: string[];
  primarySupplierId?: string | null;
  suppliers?: MaterialSupplierLink[];
  priceBreaks?: MaterialPriceBreak[];
  formatId?: string | null;
  formatName?: string | null;
  width_mm?: number | null;
  height_mm?: number | null;
  colorName?: string | null;
  colorCode?: string | null;
  thumbnailUrl?: string | null;
  thumbnailImage?: string | null;
  macroTextureUrl?: string | null;
  macroTextureImage?: string | null;
  materialType?: MaterialType | null;
  consumptionRate?: number | null;
  isTemplate?: boolean;
  sku?: string;
  unit?: string;
  stock?: number;
  minStock?: number;
  costPerUnit?: number;
  notes?: string;
  finishType?: string | null;
  texture?: string | null;
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
