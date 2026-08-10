import type { Material, MaterialCategory } from '@/modules/materials/types';

type CategoryCarrier = {
  category?: unknown;
  categoryInfo?: {
    name?: string | null;
  } | null;
};

type NamedCategory = {
  name: string;
};

const currencyFormatter = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'MDL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const categoryLabels: Record<MaterialCategory, string> = {
  sheet: 'Sheet',
  roll: 'Roll',
  rigid: 'Rigid',
  paper: 'Paper',
  vinyl: 'Vinyl',
  textile: 'Textile',
  other: 'Other',
};

/** Emoji icon per material category */
const categoryIcons: Record<MaterialCategory, string> = {
  sheet: '📄',
  roll: '🎞️',
  rigid: '🪵',
  paper: '🗒️',
  vinyl: '🏷️',
  textile: '🧵',
  other: '📦',
};

/** Tailwind background class for the category icon container */
const categoryIconBg: Record<MaterialCategory, string> = {
  sheet: 'bg-sky-100',
  roll: 'bg-indigo-100',
  rigid: 'bg-amber-100',
  paper: 'bg-green-100',
  vinyl: 'bg-purple-100',
  textile: 'bg-pink-100',
  other: 'bg-gray-100',
};

export function getMaterialCategoryIcon(categoryOrMaterial: MaterialCategory | Material | unknown): string {
  return categoryIcons[getCategoryEnum(categoryOrMaterial)] ?? '📦';
}

function isCategoryCarrier(value: unknown): value is CategoryCarrier {
  return typeof value === 'object' && value !== null && 'category' in value;
}

function isNamedCategory(value: unknown): value is NamedCategory {
  return typeof value === 'object' && value !== null && 'name' in value && typeof (value as NamedCategory).name === 'string';
}

function getCategoryEnum(categoryOrMaterial: MaterialCategory | Material | unknown): MaterialCategory {
  // Get the enum value from various input types
  let categoryEnum: MaterialCategory = 'other';
  
  if (isCategoryCarrier(categoryOrMaterial)) {
    // It's a Material object
    const material = categoryOrMaterial as Material;
    if (typeof material.category === 'string') {
      categoryEnum = material.category;
    } else if (material.categoryInfo?.name) {
      const lowerName = material.categoryInfo.name.toLowerCase();
      categoryEnum = (Object.keys(categoryIcons) as MaterialCategory[]).find(k => k === lowerName) ?? 'other';
    }
  } else if (typeof categoryOrMaterial === 'string') {
    categoryEnum = categoryOrMaterial as MaterialCategory;
  }

  return categoryEnum;
}

export function getCategoryIconBg(categoryOrMaterial: MaterialCategory | Material | unknown): string {
  return categoryIconBg[getCategoryEnum(categoryOrMaterial)] ?? 'bg-gray-100';
}

export function normalizeMaterialForList(material: Material): Material {
  const normalizedCategory = getCategoryEnum(material);
  const compatibleMethods = Array.isArray(material.compatibleMethods)
    ? material.compatibleMethods.filter((method): method is NonNullable<typeof method> => Boolean(method))
    : [];
  const compatibleMethodIds = Array.isArray(material.compatibleMethodIds)
    ? material.compatibleMethodIds.filter((methodId): methodId is string => Boolean(methodId))
    : [];
  const compatibleEquipment = Array.isArray(material.compatibleEquipment)
    ? material.compatibleEquipment.filter((equipment): equipment is NonNullable<typeof equipment> => Boolean(equipment?.id && equipment?.name))
    : [];
  const compatibleEquipmentIds = Array.isArray(material.compatibleEquipmentIds)
    ? material.compatibleEquipmentIds.filter((equipmentId): equipmentId is string => Boolean(equipmentId))
    : [];

  return {
    ...material,
    category: normalizedCategory,
    pricePerSqm: material.pricePerSqm ?? null,
    pricePerMeter: material.pricePerMeter ?? null,
    pricePerUnit: material.pricePerUnit ?? null,
    wastePercent: typeof material.wastePercent === 'number' ? material.wastePercent : 0,
    active: Boolean(material.active),
    compatibleMethods,
    compatibleMethodIds,
    compatibleEquipment,
    compatibleEquipmentIds,
  };
}

export function getMaterialCategoryLabel(categoryOrMaterial: MaterialCategory | Material | unknown): string {
  // Handle new category object structure
  if (isCategoryCarrier(categoryOrMaterial)) {
    const material = categoryOrMaterial as Material;
    // Prefer the real DB category name over the hardcoded enum label
    if (material.categoryInfo?.name) {
      return material.categoryInfo.name;
    }
    if (typeof material.category === 'string') {
      return categoryLabels[material.category] ?? 'Other';
    }
  }
  
  // Handle category object directly
  if (isNamedCategory(categoryOrMaterial)) {
    return categoryOrMaterial.name;
  }
  
  // Handle old enum string (backward compatibility)
  if (typeof categoryOrMaterial === 'string') {
    return categoryLabels[categoryOrMaterial as MaterialCategory] ?? 'Other';
  }
  
  return 'Other';
}

/**
 * Get category breadcrumb display for Material
 * Returns a path like "Plăci / PVC / 3mm" if category has parent hierarchy
 */
export async function getMaterialCategoryBreadcrumb(material: Material): Promise<string> {
  if (!material.categoryId) return 'Other';
  
  try {
    const response = await fetch(`/api/admin/material-categories/${material.categoryId}/breadcrumb`);
    if (!response.ok) {
      return getMaterialCategoryLabel(material);
    }
    
    const breadcrumb: string[] = await response.json();
    return breadcrumb.join(' / ');
  } catch (_error) {
    return getMaterialCategoryLabel(material);
  }
}

/**
 * Get category icon based on depth level
 * Returns 📁 for root, 📂 for nested categories
 */
export function getCategoryLevelIcon(level: number): string {
  return level === 0 ? '📁' : '📂';
}

/**
 * Synchronous breadcrumb display for Material list (uses category name only)
 * For full breadcrumb, use getMaterialCategoryBreadcrumb (async)
 */
export function getMaterialCategoryBreadcrumbSync(material: Material): string {
  // For now, just show the category name
  // In a full implementation, you'd need to load the full tree
  // and build the breadcrumb from the local state
  return getMaterialCategoryLabel(material);
}

export function getMaterialPriceMeta(material: Material) {
  const normalized = normalizeMaterialForList(material);

  const format = (value: number, suffix: string) => ({
    value,
    label: `${currencyFormatter.format(value)} / ${suffix}`,
  });

  switch (normalized.category) {
    case 'sheet':
    case 'rigid':
      return normalized.pricePerSqm != null ? format(normalized.pricePerSqm, 'm²') : null;
    case 'roll':
    case 'vinyl':
    case 'textile':
      return normalized.pricePerMeter != null ? format(normalized.pricePerMeter, 'metru') : null;
    case 'paper':
      if (normalized.pricePerUnit != null) return format(normalized.pricePerUnit, 'unitate');
      if (normalized.pricePerSqm != null) return format(normalized.pricePerSqm, 'm²');
      return null;
    default:
      if (normalized.pricePerUnit != null) return format(normalized.pricePerUnit, 'unitate');
      if (normalized.pricePerMeter != null) return format(normalized.pricePerMeter, 'metru');
      if (normalized.pricePerSqm != null) return format(normalized.pricePerSqm, 'm²');
      return null;
  }
}

export function getMaterialPriceDisplay(material: Material) {
  return getMaterialPriceMeta(material)?.label ?? 'N/A';
}

export function getMaterialPriceSortValue(material: Material) {
  return getMaterialPriceMeta(material)?.value ?? -1;
}

export function getMaterialWasteDisplay(material: Material) {
  return typeof material.wastePercent === 'number' ? `${material.wastePercent}%` : 'N/A';
}