export type MaterialCategory = 'sheet' | 'roll' | 'rigid' | 'paper' | 'vinyl' | 'textile' | 'other';
export type MaterialSelectionGroup = 'finishType' | 'colorName' | 'texture' | 'material' | string;

export interface MaterialSelectionMeta {
  selectionGroup: string;
  selectionLabel: string;
  selectionValue: string;
  isSelectable: boolean;
}

export function getMaterialSelectionMeta(
  material: Partial<Material> | Record<string, unknown>
): MaterialSelectionMeta | null {
  const source = material as Record<string, unknown>;
  const propSource = (source.properties as Record<string, unknown> | undefined) ?? {};

  const readString = (...paths: Array<string | undefined>) => {
    for (const path of paths) {
      if (typeof path === 'string' && path.trim()) return path.trim();
    }
    return null;
  };

  const explicitGroup = readString(
    typeof source.selectionGroup === 'string' ? source.selectionGroup : undefined,
    typeof propSource.selectionGroup === 'string' ? propSource.selectionGroup : undefined,
    typeof source.selection_group === 'string' ? source.selection_group : undefined,
    typeof propSource.selection_group === 'string' ? propSource.selection_group : undefined,
  );
  const explicitLabel = readString(
    typeof source.selectionLabel === 'string' ? source.selectionLabel : undefined,
    typeof propSource.selectionLabel === 'string' ? propSource.selectionLabel : undefined,
    typeof source.selection_label === 'string' ? source.selection_label : undefined,
    typeof propSource.selection_label === 'string' ? propSource.selection_label : undefined,
  );
  const explicitValue = readString(
    typeof source.selectionValue === 'string' ? source.selectionValue : undefined,
    typeof propSource.selectionValue === 'string' ? propSource.selectionValue : undefined,
    typeof source.selection_value === 'string' ? source.selection_value : undefined,
    typeof propSource.selection_value === 'string' ? propSource.selection_value : undefined,
  );
  const explicitSelectable = source.isSelectable ?? propSource.isSelectable ?? source.is_selectable ?? propSource.is_selectable;

  if (explicitGroup && explicitLabel && explicitValue) {
    return {
      selectionGroup: explicitGroup,
      selectionLabel: explicitLabel,
      selectionValue: explicitValue,
      isSelectable: explicitSelectable === undefined ? true : Boolean(explicitSelectable),
    };
  }

  const groups: Array<{ key: string; label: string; value: string | null | undefined }> = [
    { key: 'finishType', label: 'finishType', value: readString(typeof source.finishType === 'string' ? source.finishType : undefined, typeof propSource.finishType === 'string' ? propSource.finishType : undefined) },
    { key: 'colorName', label: 'colorName', value: readString(typeof source.colorName === 'string' ? source.colorName : undefined, typeof propSource.colorName === 'string' ? propSource.colorName : undefined) },
    { key: 'texture', label: 'texture', value: readString(typeof source.texture === 'string' ? source.texture : undefined, typeof propSource.texture === 'string' ? propSource.texture : undefined) },
  ];

  for (const group of groups) {
    if (group.value) {
      return {
        selectionGroup: group.key,
        selectionLabel: group.label,
        selectionValue: group.value,
        isSelectable: true,
      };
    }
  }

  return null;
}

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
  selectionGroup?: MaterialSelectionGroup | null;
  selectionLabel?: string | null;
  selectionValue?: string | null;
  isSelectable?: boolean;
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
