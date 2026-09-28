import { MaterialConsumptionType, MaterialUnit, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { resolveAllowedUnitsByCategory } from './pricing';

export const MATERIAL_API_TAG = 'API:Materials';
const MATERIAL_PRICE_BREAKS_PROPERTY_KEY = '__materialPriceBreaks';
const MATERIAL_MINIMUM_MARGIN_PROPERTY_KEY = 'minimumMarginPercent';

export const MATERIAL_CATEGORIES = ['sheet', 'roll', 'rigid', 'paper', 'vinyl', 'textile', 'other'] as const;
export const MATERIAL_TYPE_VALUES = ['SUPORT_FOI', 'SUPORT_ROLA', 'SUPORT_M2', 'CERNEALA', 'CONSUMABIL'] as const;

export type MaterialCategoryValue = (typeof MATERIAL_CATEGORIES)[number];
export type MaterialTypeValue = (typeof MATERIAL_TYPE_VALUES)[number];

export interface MaterialMutationInput {
  name?: unknown;
  category?: unknown;
  categoryId?: unknown;
  colorName?: unknown;
  color_name?: unknown;
  colorCode?: unknown;
  color_code?: unknown;
  thumbnailUrl?: unknown;
  thumbnailImage?: unknown;
  thumbnail_url?: unknown;
  macroTextureUrl?: unknown;
  macroTextureImage?: unknown;
  macro_texture_url?: unknown;
  consumptionType?: unknown;
  thickness?: unknown;
  density?: unknown;
  purchasePrice?: unknown;
  salePrice?: unknown;
  salePriceMode?: unknown;
  salePricePercent?: unknown;
  minimumMarginPercent?: unknown;
  minimum_margin_percent?: unknown;
  pricePerSqm?: unknown;
  pricePerMeter?: unknown;
  pricePerUnit?: unknown;
  wastePercent?: unknown;
  primarySupplierId?: unknown;
  suppliers?: unknown;
  priceBreaks?: unknown;
  formatId?: unknown;
  formatName?: unknown;
  width_mm?: unknown;
  height_mm?: unknown;
  length_mm?: unknown;
  area_m2?: unknown;
  materialType?: unknown;
  consumptionRate?: unknown;
  isTemplate?: unknown;
  active?: unknown;
  sku?: unknown;
  unit?: unknown;
  stock?: unknown;
  minStock?: unknown;
  notes?: unknown;
  finishType?: unknown;
  properties?: unknown;
  packagingLabel?: unknown;
  packagingQty?: unknown;
  packagingPrice?: unknown;
  quantityPerPack?: unknown;
  printMethodIds?: unknown;
  compatibleMethods?: unknown;
  methods?: unknown;
}

export interface MaterialValidationIssue {
  field: string;
  message: string;
}

export class MaterialApiValidationError extends Error {
  status: number;
  errors: MaterialValidationIssue[];

  constructor(message: string | MaterialValidationIssue[], status = 400) {
    const issues = Array.isArray(message) ? message : [{ field: '_general', message }];
    super(Array.isArray(message) ? message[0]?.message ?? 'Invalid material payload' : message);
    this.name = 'MaterialApiValidationError';
    this.status = status;
    this.errors = issues;
  }
}

const materialListInclude = {
  compatibleMethods: {
    select: {
      id: true,
      name: true,
      type: true,
      active: true,
    },
  },
  category: true,
  primarySupplier: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  materialSuppliers: {
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  priceBreaks: {
    orderBy: {
      qtyMin: 'asc' as const,
    },
  },
  consumption: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
} satisfies Prisma.MaterialInclude;

const materialListIncludeWithoutPriceBreaks = {
  compatibleMethods: materialListInclude.compatibleMethods,
  category: true,
  primarySupplier: materialListInclude.primarySupplier,
  materialSuppliers: materialListInclude.materialSuppliers,
  consumption: materialListInclude.consumption,
} satisfies Prisma.MaterialInclude;

const materialDetailInclude = {
  compatibleMethods: materialListInclude.compatibleMethods,
  category: true,
  primarySupplier: materialListInclude.primarySupplier,
  materialSuppliers: materialListInclude.materialSuppliers,
  priceBreaks: materialListInclude.priceBreaks,
  consumption: {
    include: {
      job: {
        select: {
          id: true,
          name: true,
          status: true,
          orderId: true,
          order: {
            select: {
              id: true,
              customerName: true,
              customerEmail: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
} satisfies Prisma.MaterialInclude;

const materialDetailIncludeWithoutPriceBreaks = {
  compatibleMethods: materialDetailInclude.compatibleMethods,
  category: true,
  primarySupplier: materialDetailInclude.primarySupplier,
  materialSuppliers: materialDetailInclude.materialSuppliers,
  consumption: materialDetailInclude.consumption,
} satisfies Prisma.MaterialInclude;

type MaterialListRecord = Prisma.MaterialGetPayload<{ include: typeof materialListInclude }>;
type MaterialDetailRecord = Prisma.MaterialGetPayload<{ include: typeof materialDetailInclude }>;

function isMissingPriceBreaksTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const maybeCode = (error as { code?: unknown }).code;
  const message = (error as { message?: unknown }).message;
  const text = typeof message === 'string' ? message.toLowerCase() : '';
  const normalizedText = text.replace(/['"`]/g, '');

  const isPrismaMissingRelationCode = typeof maybeCode === 'string' && (maybeCode === 'P2021' || maybeCode === 'P2022');

  if (isPrismaMissingRelationCode) {
    return (
      normalizedText.includes('material_price_breaks') ||
      normalizedText.includes('pricebreak') ||
      normalizedText.includes('(not available)') ||
      normalizedText.includes('columnnotfound') ||
      normalizedText.includes('column') && normalizedText.includes('does not exist in the current database')
    );
  }

  return (
    normalizedText.includes('material_price_breaks') ||
    normalizedText.includes('pricebreak') ||
    normalizedText.includes('(not available)') ||
    normalizedText.includes('columnnotfound')
  );
}

async function hasMaterialPriceBreaksTable(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT to_regclass('public.material_price_breaks') IS NOT NULL AS exists;
    `;

    return Boolean(rows[0]?.exists);
  } catch {
    return false;
  }
}

function stripPriceBreaksRelationFromMutationData<T extends Record<string, unknown>>(data: T): T {
  if (!('priceBreaks' in data)) {
    return data;
  }

  const { priceBreaks: _ignored, ...rest } = data;
  return rest as T;
}

function normalizeStoredPriceBreaks(raw: unknown): Array<{ qtyMin: number; qtyMax: number; price: number; discount: number | null }> {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const row = entry as Record<string, unknown>;
      const qtyMin = Number(row.qtyMin);
      const qtyMax = Number(row.qtyMax);
      const price = Number(row.price);
      const discount = row.discount === undefined || row.discount === null || row.discount === ''
        ? null
        : Number(row.discount);

      if (!Number.isFinite(qtyMin) || !Number.isFinite(qtyMax) || !Number.isFinite(price)) {
        return null;
      }

      return {
        qtyMin,
        qtyMax,
        price,
        discount: discount !== null && Number.isFinite(discount) ? discount : null,
      };
    })
    .filter((entry): entry is { qtyMin: number; qtyMax: number; price: number; discount: number | null } => Boolean(entry));
}

function normalizeMaterialProperties(properties: unknown): Record<string, unknown> | null {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return null;
  }

  const record = { ...(properties as Record<string, unknown>) };
  delete record[MATERIAL_PRICE_BREAKS_PROPERTY_KEY];

  return Object.keys(record).length > 0 ? record : null;
}

function normalizeMinimumMarginFromProperties(properties: unknown): number | null {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return null;
  }

  const raw = (properties as Record<string, unknown>)[MATERIAL_MINIMUM_MARGIN_PROPERTY_KEY];
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (parsed < 0 || parsed > 100) {
    return null;
  }

  return parsed;
}

function toOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return Boolean(value);
}

function normalizeIdArray(value: unknown, fieldName: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new MaterialApiValidationError(`${fieldName} must be an array of IDs`);
  }

  const ids = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (ids.length !== value.length) {
    throw new MaterialApiValidationError(`${fieldName} must contain only string IDs`);
  }

  return [...new Set(ids)];
}

function normalizeNonNegativeNumber(
  value: unknown,
  label: string,
  options: { required?: boolean; defaultValue?: number | null } = {}
): number | null {
  const parsed = toOptionalNumber(value);

  if (parsed === undefined) {
    if (options.required) {
      throw new MaterialApiValidationError(`${label} is required`);
    }

    return options.defaultValue ?? null;
  }

  if (parsed === null) {
    if (options.required) {
      throw new MaterialApiValidationError(`${label} is required`);
    }

    return null;
  }

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new MaterialApiValidationError(`${label} must be a non-negative number`);
  }

  return parsed;
}

function normalizeMaterialUnit(value: unknown, fallback: MaterialUnit): MaterialUnit {
  const candidate = typeof value === 'string' ? value.trim() : '';
  if (!candidate) {
    return fallback;
  }

  const normalized = candidate.toLowerCase();
  const mapping: Record<string, MaterialUnit> = {
    mm: MaterialUnit.sheet,
    m: MaterialUnit.meter,
    m2: MaterialUnit.m2,
    sqm: MaterialUnit.m2,
    ml: MaterialUnit.ml,
    l: MaterialUnit.liter,
    liter: MaterialUnit.liter,
    g: MaterialUnit.gram,
    gram: MaterialUnit.gram,
    kg: MaterialUnit.kg,
    buc: MaterialUnit.pcs,
    piece: MaterialUnit.pcs,
    pieces: MaterialUnit.pcs,
    unit: MaterialUnit.pcs,
    pcs: MaterialUnit.pcs,
    sheet: MaterialUnit.sheet,
  };

  const mapped = mapping[normalized];
  if (mapped) {
    return mapped;
  }

  if ((Object.values(MaterialUnit) as string[]).includes(candidate)) {
    return candidate as MaterialUnit;
  }

  throw new MaterialApiValidationError('Unitatea de măsură este invalidă');
}

function parsePositiveNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function parseWholeNumber(value: unknown): number | null {
  const parsed = parsePositiveNumber(value);
  if (parsed === null) return null;
  return Number.isInteger(parsed) ? parsed : null;
}

function normalizeUnitToken(value: unknown): string | null {
  if (typeof value !== 'string') {
    return value === undefined || value === null ? null : String(value);
  }

  const normalized = value.trim();
  if (!normalized) return null;

  const directMap: Record<string, string> = {
    mm: 'mm',
    m: 'm',
    m2: 'm2',
    sqm: 'm2',
    meter: 'm',
    meters: 'm',
    'mL': 'mL',
    ml: 'mL',
    l: 'L',
    liter: 'L',
    g: 'g',
    gram: 'g',
    grams: 'g',
    kg: 'kg',
    buc: 'buc',
    pcs: 'buc',
    piece: 'buc',
    pieces: 'buc',
    unit: 'buc',
    sheet: 'mm',
  };

  return directMap[normalized.toLowerCase()] ?? normalized;
}

function addFieldError(errors: MaterialValidationIssue[], field: string, message: string) {
  errors.push({ field, message });
}

export function validateMaterialTypePayload(
  payload: MaterialMutationInput,
  options: { existing?: { materialType?: unknown; unit?: unknown; width_mm?: number | null; height_mm?: number | null; consumptionRate?: number | null; isTemplate?: boolean | null } } = {}
): MaterialValidationIssue[] {
  const errors: MaterialValidationIssue[] = [];
  const materialType = payload.materialType ?? options.existing?.materialType ?? null;

  if (materialType !== null && !(MATERIAL_TYPE_VALUES as readonly unknown[]).includes(materialType)) {
    addFieldError(errors, 'materialType', 'Tipul materialului este invalid');
    return errors;
  }

  if (!materialType) {
    return errors;
  }

  const width = parsePositiveNumber(payload.width_mm ?? options.existing?.width_mm ?? null);
  const height = parsePositiveNumber(payload.height_mm ?? options.existing?.height_mm ?? null);
  const length = parsePositiveNumber(payload.length_mm ?? null);
  const area = parsePositiveNumber(payload.area_m2 ?? null);
  const normalizedUnit = normalizeUnitToken(payload.unit ?? options.existing?.unit ?? null);
  const consumptionRate = parsePositiveNumber(payload.consumptionRate ?? options.existing?.consumptionRate ?? null);

  switch (materialType) {
    case 'SUPORT_FOI': {
      if (width === null || width <= 0) addFieldError(errors, 'width_mm', 'Lățimea este obligatorie și trebuie să fie > 0');
      if (height === null || height <= 0) addFieldError(errors, 'height_mm', 'Înălțimea este obligatorie și trebuie să fie > 0');
      if (!normalizedUnit || !['mm', 'm2'].includes(normalizedUnit)) {
        addFieldError(errors, 'unit', 'Unitatea trebuie să fie mm sau m2');
      }
      break;
    }
    case 'SUPORT_ROLA': {
      if (width === null || width <= 0) addFieldError(errors, 'width_mm', 'Lățimea este obligatorie și trebuie să fie > 0');
      if (payload.height_mm !== undefined || options.existing?.height_mm !== null && options.existing?.height_mm !== undefined) {
        const existingHeight = options.existing?.height_mm ?? null;
        const providedHeight = payload.height_mm ?? existingHeight;
        if (providedHeight !== null && providedHeight !== undefined && Number(providedHeight) !== 0) {
          addFieldError(errors, 'height_mm', 'Pentru SUPORT_ROLA, height_mm trebuie să fie null');
        }
      }
      if (!normalizedUnit || !['mm', 'm'].includes(normalizedUnit)) {
        addFieldError(errors, 'unit', 'Unitatea trebuie să fie mm sau m');
      }
      break;
    }
    case 'SUPORT_M2': {
      const hasDimensions = width !== null && height !== null && width > 0 && height > 0;
      const hasArea = area !== null && area > 0;
      if (!hasDimensions && !hasArea) {
        addFieldError(errors, 'area_m2', 'Trebuie să furnizezi width_mm + height_mm sau area_m2 > 0');
      }
      if (normalizedUnit !== 'm2') {
        addFieldError(errors, 'unit', 'Unitatea trebuie să fie m2');
      }
      break;
    }
    case 'CERNEALA': {
      if (consumptionRate === null || consumptionRate < 0) {
        addFieldError(errors, 'consumptionRate', 'consumptionRate este obligatoriu și trebuie să fie >= 0');
      }
      if (!normalizedUnit || !['mL', 'L', 'g', 'kg'].includes(normalizedUnit)) {
        addFieldError(errors, 'unit', 'Unitatea trebuie să fie una dintre mL, L, g, kg');
      }
      break;
    }
    case 'CONSUMABIL': {
      if (!normalizedUnit || normalizedUnit !== 'buc') {
        addFieldError(errors, 'unit', 'Unitatea trebuie să fie buc');
      }
      const quantityPerPack = parseWholeNumber(payload.quantityPerPack ?? null);
      if (payload.quantityPerPack !== undefined && payload.quantityPerPack !== null && (quantityPerPack === null || quantityPerPack < 1)) {
        addFieldError(errors, 'quantityPerPack', 'quantityPerPack trebuie să fie un întreg >= 1');
      }
      break;
    }
  }

  if (materialType === 'SUPORT_ROLA' && length !== null && length <= 0) {
    addFieldError(errors, 'length_mm', 'length_mm trebuie să fie > 0');
  }

  return errors;
}

function normalizeConsumptionUnit(unit: string): { unit: 'mL' | 'L' | 'g' | 'kg'; value: number } {
  const normalized = normalizeUnitToken(unit) ?? 'mL';
  const units = ['mL', 'L', 'g', 'kg'] as const;
  if (!units.includes(normalized as (typeof units)[number])) {
    return { unit: 'mL', value: 1 };
  }
  return { unit: normalized as (typeof units)[number], value: 1 };
}

export function previewMaterial(payload: MaterialMutationInput) {
  const errors = validateMaterialTypePayload(payload);
  if (errors.length > 0) {
    return { ok: false, errors, preview: null };
  }

  const materialType = String(payload.materialType ?? 'SUPORT_FOI');
  const width = parsePositiveNumber(payload.width_mm ?? null) ?? 0;
  const height = parsePositiveNumber(payload.height_mm ?? null) ?? 0;
  const rawArea = parsePositiveNumber(payload.area_m2 ?? null);
  const lengthMm = parsePositiveNumber(payload.length_mm ?? null);
  const areaM2 = rawArea ?? ((width > 0 && height > 0) ? (width * height) / 1_000_000 : 0);
  const lengthM = materialType === 'SUPORT_ROLA' && lengthMm !== null && lengthMm > 0 ? lengthMm / 1000 : null;

  let autoName = 'material';
  if (materialType === 'SUPORT_FOI') {
    autoName = `${Math.round(width)}x${Math.round(height)} mm`;
  } else if (materialType === 'SUPORT_ROLA') {
    autoName = `${Math.round(width)} mm`;
  }

  let estimatedConsumption = { value: 0, unit: 'L' as 'L' | 'mL' | 'g' | 'kg' };
  const consumptionRate = parsePositiveNumber(payload.consumptionRate ?? null) ?? 0;
  const normalizedUnit = normalizeUnitToken(payload.unit ?? null) ?? 'mL';

  if (materialType === 'CERNEALA' && consumptionRate > 0) {
    const baseValue = areaM2 * consumptionRate;
    if (normalizedUnit === 'mL') {
      estimatedConsumption = { value: baseValue / 1000, unit: 'L' };
    } else if (normalizedUnit === 'L') {
      estimatedConsumption = { value: baseValue / 1000, unit: 'L' };
    } else if (normalizedUnit === 'g') {
      estimatedConsumption = { value: baseValue, unit: 'g' };
    } else {
      estimatedConsumption = { value: baseValue / 1000, unit: 'kg' };
    }
  } else if (materialType === 'SUPORT_M2') {
    estimatedConsumption = { value: areaM2 * (consumptionRate || 0), unit: normalizedUnit === 'L' ? 'L' : 'mL' };
  }

  return {
    ok: true,
    preview: {
      area_m2: Number(areaM2.toFixed(5)),
      length_m: lengthM !== null ? Number(lengthM.toFixed(5)) : null,
      estimated_consumption: {
        value: Number(estimatedConsumption.value.toFixed(5)),
        unit: estimatedConsumption.unit,
      },
      autoName,
    },
  };
}

function normalizeSupplierLinks(material: MaterialListRecord | MaterialDetailRecord) {
  const list = material.materialSuppliers ?? [];
  return list.map((link) => ({
    id: link.id,
    supplierId: link.supplierId,
    name: link.supplier?.name ?? null,
    email: link.supplier?.email ?? null,
    contactEmail: link.supplier?.email ?? null,
    leadTimeDays: link.leadTimeDays,
    unitCost: link.unitCost ? Number(link.unitCost) : null,
    isPrimary: link.isPrimary,
  }));
}

function normalizePriceBreaks(raw: unknown): Array<{ qtyMin: number; qtyMax: number; price: number; discount: number | null }> {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const row = entry as Record<string, unknown>;
      const qtyMin = Number(row.qtyMin);
      const qtyMax = Number(row.qtyMax);
      const price = Number(row.price);

      if (!Number.isInteger(qtyMin) || qtyMin < 0) {
        throw new MaterialApiValidationError('qtyMin trebuie să fie număr întreg >= 0');
      }

      if (!Number.isInteger(qtyMax) || qtyMax < qtyMin) {
        throw new MaterialApiValidationError('qtyMax trebuie să fie număr întreg >= qtyMin');
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new MaterialApiValidationError('price trebuie să fie număr >= 0');
      }

      const discountRaw = row.discount;
      const discount = discountRaw === undefined || discountRaw === null || discountRaw === ''
        ? null
        : Number(discountRaw);

      if (discount !== null && (!Number.isFinite(discount) || discount < 0 || discount > 100)) {
        throw new MaterialApiValidationError('discount trebuie să fie între 0 și 100');
      }

      return {
        qtyMin,
        qtyMax,
        price,
        discount,
      };
    })
    .filter((entry): entry is { qtyMin: number; qtyMax: number; price: number; discount: number | null } => Boolean(entry));
}

export function normalizeMaterialResponse(material: MaterialListRecord | MaterialDetailRecord) {
  const rawProperties = (material.properties as Record<string, unknown> | null) ?? null;
  const storedPriceBreaks = normalizeStoredPriceBreaks(rawProperties?.[MATERIAL_PRICE_BREAKS_PROPERTY_KEY]);
  const publicProperties = normalizeMaterialProperties(rawProperties);
  const minimumMarginPercent = normalizeMinimumMarginFromProperties(rawProperties) ?? 15;
  const totalConsumption = material.consumption.reduce((sum, usage) => sum + usage.quantity, 0);
  
  // Try to derive category type from category name or default to 'other'
  let categoryType: MaterialCategoryValue = 'other';
  if (material.category?.name) {
    const nameLower = material.category.name.toLowerCase();
    // Try to match known categories
    if (MATERIAL_CATEGORIES.includes(nameLower as MaterialCategoryValue)) {
      categoryType = nameLower as MaterialCategoryValue;
    }
  }

  return {
    id: material.id,
    name: material.name,
    categoryId: material.categoryId,
    category: categoryType,
    categoryInfo: material.category
      ? {
          id: material.category.id,
          name: material.category.name,
          description: material.category.description,
          requiresThickness: material.category.requiresThickness,
          requiresDensity: material.category.requiresDensity,
          requiresPricePerSqm: material.category.requiresPricePerSqm,
          requiresPricePerMeter: material.category.requiresPricePerMeter,
          requiresPricePerUnit: material.category.requiresPricePerUnit,
          requiresWastePercent: material.category.requiresWastePercent,
          active: material.category.active,
        }
      : null,
    consumptionType: material.consumptionType,
    thickness: material.thickness,
    density: material.density,
    purchasePrice: material.purchasePrice ? Number(material.purchasePrice) : null,
    salePrice: material.salePrice ? Number(material.salePrice) : null,
    salePriceMode: material.salePriceMode === 'percent' ? 'percent' : 'amount',
    salePricePercent: material.salePricePercent,
    minimumMarginPercent,
    // Legacy aliases kept for old list/detail consumers.
    pricePerSqm: material.unit === MaterialUnit.m2 ? (material.salePrice ? Number(material.salePrice) : null) : null,
    pricePerMeter: material.unit === MaterialUnit.meter ? (material.salePrice ? Number(material.salePrice) : null) : null,
    pricePerUnit: (
      [
        MaterialUnit.unit,
        MaterialUnit.pcs,
        MaterialUnit.sheet,
        MaterialUnit.ml,
        MaterialUnit.liter,
        MaterialUnit.gram,
        MaterialUnit.kg,
      ] as string[]
    ).includes(material.unit as string)
      ? (material.salePrice ? Number(material.salePrice) : null)
      : null,
    wastePercent: material.wastePercent,
    formatId: (material as { formatId?: string | null }).formatId ?? null,
    formatName: (material as { formatName?: string | null }).formatName ?? null,
    width_mm: (material as { width_mm?: number | null }).width_mm ?? null,
    height_mm: (material as { height_mm?: number | null }).height_mm ?? null,
    colorName: (material as { colorName?: string | null }).colorName ?? null,
    colorCode: (material as { colorCode?: string | null }).colorCode ?? null,
    thumbnailUrl: (material as { thumbnailUrl?: string | null }).thumbnailUrl ?? null,
    thumbnailImage: (material as { thumbnailUrl?: string | null }).thumbnailUrl ?? null,
    macroTextureUrl: (material as { macroTextureUrl?: string | null }).macroTextureUrl ?? null,
    macroTextureImage: (material as { macroTextureUrl?: string | null }).macroTextureUrl ?? null,
    materialType: (material as { materialType?: MaterialTypeValue | null }).materialType ?? null,
    consumptionRate: (material as { consumptionRate?: number | null }).consumptionRate ?? null,
    isTemplate: (material as { isTemplate?: boolean }).isTemplate ?? false,
    primarySupplierId: (material as { primarySupplierId?: string | null }).primarySupplierId ?? null,
    primarySupplier: material.primarySupplier
      ? {
          id: material.primarySupplier.id,
          name: material.primarySupplier.name,
          email: material.primarySupplier.email,
          contactEmail: material.primarySupplier.email,
        }
      : null,
    suppliers: normalizeSupplierLinks(material),
    priceBreaks: (((material as unknown as { priceBreaks?: Array<{ id: string; qtyMin: number; qtyMax: number; price: number; discount: number | null }> }).priceBreaks) ?? []).length > 0
      ? (((material as unknown as { priceBreaks?: Array<{ id: string; qtyMin: number; qtyMax: number; price: number; discount: number | null }> }).priceBreaks) ?? []).map((row) => ({
          id: row.id,
          qtyMin: row.qtyMin,
          qtyMax: row.qtyMax,
          price: row.price,
          discount: row.discount,
        }))
      : storedPriceBreaks.map((row) => ({
          id: undefined,
          qtyMin: row.qtyMin,
          qtyMax: row.qtyMax,
          price: row.price,
          discount: row.discount,
        })),
    active: material.active,
    printMethods: material.compatibleMethods.map((method) => ({
      id: method.id,
      name: method.name,
      type: method.type,
      active: method.active,
    })),
    printMethodIds: material.compatibleMethods.map((method) => method.id),
    compatibleMethods: material.compatibleMethods.map((method) => method.id),
    sku: material.sku,
    unit: material.unit,
    stock: material.stock,
    minStock: material.minStock,
    notes: material.notes,
    finishType: material.finishType ?? null,
    texture: typeof publicProperties?.texture === 'string' ? publicProperties.texture : null,
    packagingLabel: material.packagingLabel ?? null,
    packagingQty: material.packagingQty ?? null,
    packagingPrice: material.packagingPrice ? Number(material.packagingPrice) : null,
    properties: (publicProperties as Record<string, string | number | boolean> | null) ?? null,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
    lowStock: material.stock < material.minStock,
    totalConsumption,
    consumption: material.consumption,
  };
}

export async function listMaterials() {
  const supportsPriceBreakRelation = await hasMaterialPriceBreaksTable();
  let materials: MaterialListRecord[];

  try {
    materials = await prisma.material.findMany({
      include: supportsPriceBreakRelation ? materialListInclude : materialListIncludeWithoutPriceBreaks,
      orderBy: {
        name: 'asc',
      },
    }) as MaterialListRecord[];
  } catch (error) {
    if (!isMissingPriceBreaksTableError(error)) {
      throw error;
    }

    materials = await prisma.material.findMany({
      include: materialListIncludeWithoutPriceBreaks,
      orderBy: {
        name: 'asc',
      },
    }) as unknown as MaterialListRecord[];
  }

  return materials.map(normalizeMaterialResponse);
}

export async function getCompatibleMaterials(filters: {
  printMethodId?: string;
  equipmentId?: string;
}) {
  const { printMethodId } = filters;

  const where: Prisma.MaterialWhereInput = {
    active: true,
    ...(printMethodId
      ? {
          compatibleMethods: { some: { id: printMethodId } },
        }
      : {}),
  };

  let materials: MaterialListRecord[];
  try {
    materials = await prisma.material.findMany({
      where,
      include: materialListInclude,
      orderBy: {
        name: 'asc',
      },
    }) as MaterialListRecord[];
  } catch (error) {
    if (!isMissingPriceBreaksTableError(error)) {
      throw error;
    }

    materials = await prisma.material.findMany({
      where,
      include: materialListIncludeWithoutPriceBreaks,
      orderBy: {
        name: 'asc',
      },
    }) as unknown as MaterialListRecord[];
  }

  return materials.map(normalizeMaterialResponse);
}

export async function getMaterialById(id: string) {
  const supportsPriceBreakRelation = await hasMaterialPriceBreaksTable();
  let material: MaterialDetailRecord | null;

  try {
    material = await prisma.material.findUnique({
      where: { id },
      include: supportsPriceBreakRelation ? materialDetailInclude : materialDetailIncludeWithoutPriceBreaks,
    }) as MaterialDetailRecord | null;
  } catch (error) {
    if (!isMissingPriceBreaksTableError(error)) {
      throw error;
    }

    material = await prisma.material.findUnique({
      where: { id },
      include: materialDetailIncludeWithoutPriceBreaks,
    }) as unknown as MaterialDetailRecord | null;
  }

  return material ? normalizeMaterialResponse(material) : null;
}

export async function getNextMaterialSku(categoryId: string) {
  const normalizedCategoryId = categoryId.trim();
  if (!normalizedCategoryId) {
    throw new MaterialApiValidationError('Categoria materialului este obligatorie');
  }

  const category = await prisma.materialCategory.findUnique({
    where: { id: normalizedCategoryId },
    select: { name: true },
  });

  if (!category) {
    throw new MaterialApiValidationError('Categoria selectată nu există', 404);
  }

  const cleaned = category.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const prefix = (cleaned.slice(0, 3) || 'MAT').padEnd(3, 'X');

  const lastMaterial = await prisma.material.findFirst({
    where: {
      categoryId: normalizedCategoryId,
      sku: {
        startsWith: `${prefix}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: { sku: true },
  });

  const lastNumber = lastMaterial?.sku
    ? Number.parseInt(lastMaterial.sku.split('-').at(-1) ?? '0', 10)
    : 0;
  const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;

  return {
    sku: `${prefix}-${String(nextNumber).padStart(4, '0')}`,
  };
}

async function validatePrintMethods(printMethodIds: string[]) {
  if (printMethodIds.length > 0) {
    const existingMethods = await prisma.printMethod.findMany({
      where: { id: { in: printMethodIds } },
      select: { id: true },
    });

    if (existingMethods.length !== printMethodIds.length) {
      throw new MaterialApiValidationError('One or more print method IDs are invalid');
    }
  }
}

async function ensureSkuAvailable(sku: string | null, excludeId?: string) {
  if (!sku) {
    return;
  }

  const existingMaterial = await prisma.material.findUnique({
    where: { sku },
    select: { id: true },
  });

  if (existingMaterial && existingMaterial.id !== excludeId) {
    throw new MaterialApiValidationError('SKU-ul specificat este deja utilizat');
  }
}

async function resolveCategoryId(payload: MaterialMutationInput, existingCategoryId?: string) {
  const explicitCategoryId = typeof payload.categoryId === 'string' ? payload.categoryId.trim() : '';
  if (explicitCategoryId) {
    return explicitCategoryId;
  }

  if (existingCategoryId) {
    return existingCategoryId;
  }

  const fallback = await prisma.materialCategory.findFirst({
    where: {
      active: true,
    },
    select: { id: true },
    orderBy: { name: 'asc' },
  });

  if (!fallback) {
    throw new MaterialApiValidationError('Nu există categorii de materiale configurate', 500);
  }

  return fallback.id;
}

async function buildMaterialMutationData(
  payload: MaterialMutationInput,
  options: {
    existing?: Prisma.MaterialGetPayload<{
      select: {
        id: true;
        name: true;
        sku: true;
        categoryId: true;
        thickness: true;
        density: true;
        purchasePrice: true;
        salePrice: true;
        salePriceMode: true;
        salePricePercent: true;
        wastePercent: true;
        formatId: true;
        formatName: true;
        width_mm: true;
        height_mm: true;
        colorName: true;
        colorCode: true;
        thumbnailUrl: true;
        macroTextureUrl: true;
        materialType: true;
        consumptionRate: true;
        isTemplate: true;
        primarySupplierId: true;
        active: true;
        unit: true;
        consumptionType: true;
        stock: true;
        minStock: true;
        notes: true;
        finishType: true;
        packagingLabel: true;
        packagingQty: true;
        packagingPrice: true;
        properties: true;
        compatibleMethods: { select: { id: true } };
      };
    }>;
    replaceRelations?: boolean;
  } = {}
) {
  const existing = options.existing;

  const nameValue = payload.name ?? existing?.name;
  if (typeof nameValue !== 'string' || nameValue.trim() === '') {
    throw new MaterialApiValidationError('Numele materialului este obligatoriu');
  }

  const categoryIdValue = await resolveCategoryId(payload, existing?.categoryId);
  const category = await prisma.materialCategory.findUnique({
    where: { id: categoryIdValue },
    select: {
      id: true,
      requiresPricePerSqm: true,
      requiresPricePerMeter: true,
      requiresPricePerUnit: true,
    },
  });
  if (!category) {
    throw new MaterialApiValidationError('Categoria selectată nu există');
  }

  const colorNameInput = payload.colorName ?? payload.color_name;
  const colorNameValue = typeof colorNameInput === 'string'
    ? colorNameInput.trim() || null
    : colorNameInput === null
      ? null
      : (existing?.colorName ?? null);

  const colorCodeInput = payload.colorCode ?? payload.color_code;
  const colorCodeValue = typeof colorCodeInput === 'string'
    ? colorCodeInput.trim() || null
    : colorCodeInput === null
      ? null
      : (existing?.colorCode ?? null);

  const thumbnailUrlInput = payload.thumbnailUrl ?? payload.thumbnailImage ?? payload.thumbnail_url;
  const thumbnailUrlValue = typeof thumbnailUrlInput === 'string'
    ? thumbnailUrlInput.trim() || null
    : thumbnailUrlInput === null
      ? null
      : (existing?.thumbnailUrl ?? null);

  const macroTextureUrlInput = payload.macroTextureUrl ?? payload.macroTextureImage ?? payload.macro_texture_url;
  const macroTextureUrlValue = typeof macroTextureUrlInput === 'string'
    ? macroTextureUrlInput.trim() || null
    : macroTextureUrlInput === null
      ? null
      : (existing?.macroTextureUrl ?? null);

  const consumptionTypeValue = payload.consumptionType ?? existing?.consumptionType ?? MaterialConsumptionType.AREA_BASED;
  if (consumptionTypeValue !== MaterialConsumptionType.AREA_BASED && consumptionTypeValue !== MaterialConsumptionType.DIRECT) {
    throw new MaterialApiValidationError('Tipul de consum este invalid');
  }

  const unitValue = normalizeMaterialUnit(payload.unit, existing?.unit ?? MaterialUnit.pcs);
  const allowedUnits = resolveAllowedUnitsByCategory(
    {
      requiresPricePerSqm: category.requiresPricePerSqm,
      requiresPricePerMeter: category.requiresPricePerMeter,
      requiresPricePerUnit: category.requiresPricePerUnit,
    },
    consumptionTypeValue
  );

  if (!allowedUnits.includes(unitValue)) {
    throw new MaterialApiValidationError(`Unitatea ${unitValue} nu este permisă pentru categoria selectată`);
  }

  const stockValue = normalizeNonNegativeNumber(payload.stock, 'Stock', {
    defaultValue: existing?.stock ?? 0,
  }) ?? 0;
  const minStockValue = normalizeNonNegativeNumber(payload.minStock, 'Min stock', {
    defaultValue: existing?.minStock ?? 0,
  }) ?? 0;
  const thicknessValue = normalizeNonNegativeNumber(payload.thickness, 'Thickness', {
    defaultValue: existing?.thickness ?? null,
  });
  const densityValue = normalizeNonNegativeNumber(payload.density, 'Density', {
    defaultValue: existing?.density ?? null,
  });

  const purchasePriceValue = normalizeNonNegativeNumber(payload.purchasePrice, 'Purchase price', {
    defaultValue: existing?.purchasePrice ? Number(existing.purchasePrice) : null,
  });

  const legacySalePriceInput = payload.pricePerUnit ?? payload.pricePerMeter ?? payload.pricePerSqm;
  const salePriceValue = normalizeNonNegativeNumber(
    payload.salePrice !== undefined ? payload.salePrice : legacySalePriceInput,
    'Sale price',
    {
      defaultValue: existing?.salePrice ? Number(existing.salePrice) : null,
    }
  );

  const salePriceModeValue = payload.salePriceMode ?? existing?.salePriceMode ?? 'amount';
  if (salePriceModeValue !== 'amount' && salePriceModeValue !== 'percent') {
    throw new MaterialApiValidationError('Modul de preț vânzare este invalid');
  }

  const salePricePercentValue = normalizeNonNegativeNumber(payload.salePricePercent, 'Sale price percent', {
    defaultValue: existing?.salePricePercent ?? null,
  });

  let resolvedSalePrice = salePriceValue;
  let resolvedSalePricePercent = salePricePercentValue;

  if (salePriceModeValue === 'percent') {
    if (purchasePriceValue === null) {
      throw new MaterialApiValidationError('Prețul de cumpărare este obligatoriu pentru modul procent');
    }

    if (salePricePercentValue === null) {
      throw new MaterialApiValidationError('Procentul de vânzare este obligatoriu pentru modul procent');
    }

    resolvedSalePrice = Number((purchasePriceValue * (1 + salePricePercentValue / 100)).toFixed(2));
  } else {
    resolvedSalePricePercent = null;
  }

  const wastePercentValue = normalizeNonNegativeNumber(payload.wastePercent, 'Waste percent', {
    defaultValue: existing?.wastePercent ?? 0,
  }) ?? 0;

  const formatIdValue = typeof payload.formatId === 'string'
    ? payload.formatId.trim() || null
    : payload.formatId === null
      ? null
      : existing?.formatId ?? null;

  let formatNameValue = typeof payload.formatName === 'string'
    ? payload.formatName.trim() || null
    : payload.formatName === null
      ? null
      : existing?.formatName ?? null;

  let widthMmValue = payload.width_mm === undefined
    ? existing?.width_mm ?? null
    : toOptionalNumber(payload.width_mm) ?? null;

  let heightMmValue = payload.height_mm === undefined
    ? existing?.height_mm ?? null
    : toOptionalNumber(payload.height_mm) ?? null;

  const materialTypeValue = (payload.materialType ?? existing?.materialType ?? null) as MaterialTypeValue | null;
  const materialTypeErrors = validateMaterialTypePayload(payload, { existing: { materialType: existing?.materialType, unit: existing?.unit, width_mm: existing?.width_mm ?? null, height_mm: existing?.height_mm ?? null, consumptionRate: existing?.consumptionRate ?? null, isTemplate: existing?.isTemplate ?? null } });
  if (materialTypeErrors.length > 0) {
    throw new MaterialApiValidationError(materialTypeErrors, 400);
  }

  const consumptionRateValue = normalizeNonNegativeNumber(payload.consumptionRate, 'Consumption rate', {
    defaultValue: existing?.consumptionRate ?? null,
  });

  const isTemplateValue = toBoolean(payload.isTemplate, existing?.isTemplate ?? false);

  if (formatIdValue) {
    const format = await (prisma as any).format.findUnique({ where: { id: formatIdValue } });
    if (!format) {
      throw new MaterialApiValidationError('Formatul selectat nu există', 400);
    }

    widthMmValue ??= format.width_mm;
    heightMmValue ??= format.height_mm ?? null;
    formatNameValue ??= format.name.trim() || null;
  }

  if (wastePercentValue < 0 || wastePercentValue > 100) {
    throw new MaterialApiValidationError('Waste percent trebuie să fie între 0 și 100');
  }

  if (!existing && purchasePriceValue == null && resolvedSalePrice == null) {
    throw new MaterialApiValidationError('Cel puțin un preț (achiziție sau vânzare) trebuie să fie setat');
  }

  const incomingMethodIds = payload.printMethodIds ?? payload.compatibleMethods ?? payload.methods;
  const printMethodIds = incomingMethodIds === undefined
    ? existing?.compatibleMethods.map((method) => method.id) ?? []
    : normalizeIdArray(incomingMethodIds, 'printMethodIds');

  await validatePrintMethods(printMethodIds);

  const sku = typeof payload.sku === 'string'
    ? payload.sku.trim() || null
    : payload.sku === null
      ? null
      : existing?.sku ?? null;
  await ensureSkuAvailable(sku, existing?.id);

  const notes = typeof payload.notes === 'string'
    ? payload.notes.trim() || null
    : payload.notes === null
      ? null
      : existing?.notes ?? null;
  const active = toBoolean(payload.active, existing?.active ?? true);

  const rawSuppliers = Array.isArray(payload.suppliers) ? payload.suppliers : [];
  const normalizedSuppliers = rawSuppliers
    .map((entry) => {
      if (typeof entry === 'string') {
        return { supplierId: entry.trim(), leadTimeDays: null, unitCost: null, isPrimary: false, notes: null };
      }

      if (entry && typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        const supplierId = typeof record.supplierId === 'string' ? record.supplierId.trim() : typeof record.id === 'string' ? record.id.trim() : '';
        if (!supplierId) {
          return null;
        }

        const leadTimeDays = record.leadTimeDays === undefined || record.leadTimeDays === null || record.leadTimeDays === ''
          ? null
          : Number(record.leadTimeDays);
        const unitCost = record.unitCost === undefined || record.unitCost === null || record.unitCost === ''
          ? null
          : Number(record.unitCost);

        return {
          supplierId,
          leadTimeDays: Number.isFinite(leadTimeDays) ? leadTimeDays : null,
          unitCost: Number.isFinite(unitCost) ? unitCost : null,
          isPrimary: Boolean(record.isPrimary),
          notes: typeof record.notes === 'string' ? record.notes.trim() || null : null,
        };
      }

      return null;
    })
    .filter((entry): entry is { supplierId: string; leadTimeDays: number | null; unitCost: number | null; isPrimary: boolean; notes: string | null } => Boolean(entry));

  const hasPriceBreaksInput = payload.priceBreaks !== undefined;
  const normalizedPriceBreaks = hasPriceBreaksInput ? normalizePriceBreaks(payload.priceBreaks) : undefined;
  const incomingMinimumMargin = payload.minimumMarginPercent ?? payload.minimum_margin_percent;
  const existingMinimumMargin = normalizeMinimumMarginFromProperties(existing?.properties) ?? 15;
  const minimumMarginPercentValue = normalizeNonNegativeNumber(incomingMinimumMargin, 'Minimum margin percent', {
    defaultValue: existingMinimumMargin,
  }) ?? existingMinimumMargin;

  if (purchasePriceValue !== null && normalizedPriceBreaks !== undefined) {
    const minimumAllowedPrice = purchasePriceValue * (1 + minimumMarginPercentValue / 100);
    for (const row of normalizedPriceBreaks) {
      if (row.price < minimumAllowedPrice) {
        throw new MaterialApiValidationError(`Prețul rândului trebuie să fie cel puțin ${minimumAllowedPrice.toFixed(2)} MDL (margine minimă ${minimumMarginPercentValue}%)`);
      }
    }
  }

  const primarySupplierIdValue = typeof payload.primarySupplierId === 'string'
    ? payload.primarySupplierId.trim() || null
    : payload.primarySupplierId === null
      ? null
      : ((existing as { primarySupplierId?: string | null } | undefined)?.primarySupplierId ?? null);

  const supplierIds = Array.from(new Set(normalizedSuppliers.map((item) => item.supplierId).concat(primarySupplierIdValue ? [primarySupplierIdValue] : [])));
  if (supplierIds.length > 0) {
    const foundSuppliers = await prisma.supplier.findMany({
      where: { id: { in: supplierIds } },
      select: { id: true },
    });
    const foundIds = new Set(foundSuppliers.map((supplier) => supplier.id));
    const missingId = supplierIds.find((id) => !foundIds.has(id));
    if (missingId) {
      throw new MaterialApiValidationError('Furnizorul selectat nu există', 400);
    }
  }

  const dedupedSupplierLinks = (() => {
    const map = new Map<string, { supplierId: string; leadTimeDays: number | null; unitCost: number | null; isPrimary: boolean; notes: string | null }>();
    for (const item of normalizedSuppliers) {
      const id = item.supplierId;
      const current = map.get(id);
      map.set(id, current ? {
        ...current,
        isPrimary: current.isPrimary || item.isPrimary,
        leadTimeDays: current.leadTimeDays ?? item.leadTimeDays,
        unitCost: current.unitCost ?? item.unitCost,
        notes: current.notes ?? item.notes,
      } : item);
    }

    if (primarySupplierIdValue) {
      const primary = map.get(primarySupplierIdValue);
      if (primary) {
        primary.isPrimary = true;
      } else {
        map.set(primarySupplierIdValue, {
          supplierId: primarySupplierIdValue,
          leadTimeDays: null,
          unitCost: null,
          isPrimary: true,
          notes: null,
        });
      }
    }

    return Array.from(map.values());
  })();

  // Packaging fields
  const packagingLabel = typeof payload.packagingLabel === 'string'
    ? payload.packagingLabel.trim() || null
    : existing?.packagingLabel ?? null;
  const finishType = typeof payload.finishType === 'string'
    ? payload.finishType.trim() || null
    : payload.finishType === null
      ? null
      : (existing?.finishType ?? null);

  // properties JSON — merge with existing if partial update
  let properties: Record<string, string | number | boolean> | null = null;
  if (payload.properties !== undefined) {
    if (payload.properties === null) {
      properties = null;
    } else if (typeof payload.properties === 'object' && !Array.isArray(payload.properties)) {
      properties = { ...(payload.properties as Record<string, string | number | boolean>) };
    }
  } else {
    properties = (existing?.properties as Record<string, string | number | boolean> | null) ?? null;
  }
  const packagingQty = toOptionalNumber(payload.packagingQty) ?? (existing?.packagingQty ?? null);
  const rawPackagingPrice = payload.packagingPrice !== undefined
    ? toOptionalNumber(payload.packagingPrice)
    : existing?.packagingPrice ? Number(existing.packagingPrice) : null;
  const packagingPrice = (rawPackagingPrice !== undefined ? rawPackagingPrice : null) as number | null;

  const relationEnvelope = options.replaceRelations
    ? {
        compatibleMethods: {
          set: [],
          connect: printMethodIds.map((id) => ({ id })),
        },
      }
    : {
        compatibleMethods: {
          connect: printMethodIds.map((id) => ({ id })),
        },
      };

  const formatRelation = formatIdValue
    ? { connect: { id: formatIdValue } }
    : existing?.formatId
      ? { disconnect: true }
      : undefined;

  const primarySupplierRelation = primarySupplierIdValue
    ? { connect: { id: primarySupplierIdValue } }
    : (existing as { primarySupplierId?: string | null } | undefined)?.primarySupplierId
      ? { disconnect: true }
      : undefined;

  const materialSupplierRelation = dedupedSupplierLinks.length > 0
    ? {
        materialSuppliers: options.replaceRelations
          ? { deleteMany: {}, create: dedupedSupplierLinks.map((item) => ({
              supplier: { connect: { id: item.supplierId } },
              isPrimary: item.isPrimary,
              leadTimeDays: item.leadTimeDays,
              unitCost: item.unitCost !== null ? new Prisma.Decimal(item.unitCost) : null,
              notes: item.notes,
            })) }
          : { create: dedupedSupplierLinks.map((item) => ({
              supplier: { connect: { id: item.supplierId } },
              isPrimary: item.isPrimary,
              leadTimeDays: item.leadTimeDays,
              unitCost: item.unitCost !== null ? new Prisma.Decimal(item.unitCost) : null,
              notes: item.notes,
            })) },
      }
    : options.replaceRelations && existing?.id
      ? { materialSuppliers: { deleteMany: {} } }
      : {};

  const supportsPriceBreakRelation = await hasMaterialPriceBreaksTable();
  const materialPriceBreakRelation = supportsPriceBreakRelation && normalizedPriceBreaks !== undefined
    ? normalizedPriceBreaks.length > 0
      ? {
          priceBreaks: existing?.id
            ? {
                deleteMany: {},
                create: normalizedPriceBreaks,
              }
            : {
                create: normalizedPriceBreaks,
              },
        }
      : existing?.id
        ? { priceBreaks: { deleteMany: {} } }
        : {}
    : {};

  const propertiesWithPriceBreaks = (() => {
    const baseProperties = properties ?? null;
    if (normalizedPriceBreaks === undefined) {
      return baseProperties;
    }

    const baseRecord = baseProperties && typeof baseProperties === 'object' && !Array.isArray(baseProperties)
      ? { ...(baseProperties as Record<string, unknown>) }
      : {};

    baseRecord[MATERIAL_MINIMUM_MARGIN_PROPERTY_KEY] = minimumMarginPercentValue;

    if (normalizedPriceBreaks.length > 0) {
      baseRecord[MATERIAL_PRICE_BREAKS_PROPERTY_KEY] = normalizedPriceBreaks;
      return baseRecord;
    }

    delete baseRecord[MATERIAL_PRICE_BREAKS_PROPERTY_KEY];
    return Object.keys(baseRecord).length > 0 ? baseRecord : null;
  })();

  return {
    name: nameValue.trim(),
    category: {
      connect: { id: categoryIdValue },
    },
    consumptionType: consumptionTypeValue,
    thickness: thicknessValue,
    density: densityValue,
    purchasePrice: purchasePriceValue !== null ? new Prisma.Decimal(purchasePriceValue) : null,
    salePriceMode: salePriceModeValue,
    salePricePercent: resolvedSalePricePercent,
    salePrice: resolvedSalePrice !== null ? new Prisma.Decimal(resolvedSalePrice) : null,
    wastePercent: wastePercentValue,
    active,
    formatId: undefined,
    formatName: formatNameValue ?? undefined,
    width_mm: widthMmValue,
    height_mm: heightMmValue,
    colorName: colorNameValue,
    colorCode: colorCodeValue,
    thumbnailUrl: thumbnailUrlValue,
    macroTextureUrl: macroTextureUrlValue,
    materialType: materialTypeValue ?? undefined,
    consumptionRate: consumptionRateValue,
    isTemplate: isTemplateValue,
    sku,
    unit: unitValue,
    stock: stockValue,
    minStock: minStockValue,
    notes,
    finishType,
    packagingLabel,
    packagingQty: packagingQty !== null && packagingQty !== undefined ? packagingQty : null,
    packagingPrice: packagingPrice !== null ? new Prisma.Decimal(packagingPrice) : null,
    properties: propertiesWithPriceBreaks ?? undefined,
    ...(formatRelation ? { format: formatRelation } : {}),
    ...(primarySupplierRelation ? { primarySupplier: primarySupplierRelation } : {}),
    ...materialSupplierRelation,
    ...materialPriceBreakRelation,
    ...relationEnvelope,
  };
}

export async function createMaterial(payload: MaterialMutationInput) {
  const data = await buildMaterialMutationData(payload) as Prisma.MaterialCreateInput;

  const supportsPriceBreakRelation = await hasMaterialPriceBreaksTable();
  let material: MaterialDetailRecord;

  try {
    material = await prisma.material.create({
      data: data as any,
      include: supportsPriceBreakRelation ? materialDetailInclude : materialDetailIncludeWithoutPriceBreaks,
    }) as unknown as MaterialDetailRecord;
  } catch (error) {
    if (!isMissingPriceBreaksTableError(error)) {
      throw error;
    }

    const fallbackData = stripPriceBreaksRelationFromMutationData(data as unknown as Record<string, unknown>);

    material = await prisma.material.create({
      data: fallbackData as any,
      include: materialDetailIncludeWithoutPriceBreaks,
    }) as unknown as MaterialDetailRecord;
  }

  return normalizeMaterialResponse(material);
}

export async function updateMaterial(id: string, payload: MaterialMutationInput) {
  const existing = await prisma.material.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sku: true,
      categoryId: true,
      thickness: true,
      density: true,
      purchasePrice: true,
      salePrice: true,
      salePriceMode: true,
      salePricePercent: true,
      wastePercent: true,
      formatId: true,
      formatName: true,
      width_mm: true,
      height_mm: true,
      colorName: true,
      colorCode: true,
      thumbnailUrl: true,
      macroTextureUrl: true,
      materialType: true,
      consumptionRate: true,
      isTemplate: true,
      primarySupplierId: true,
      active: true,
      unit: true,
      consumptionType: true,
      stock: true,
      minStock: true,
      notes: true,
      finishType: true,
      packagingLabel: true,
      packagingQty: true,
      packagingPrice: true,
      properties: true,
      compatibleMethods: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!existing) {
    throw new MaterialApiValidationError('Materialul nu a fost găsit', 404);
  }

  const data = await buildMaterialMutationData(payload, {
    existing,
    replaceRelations: true,
  }) as Prisma.MaterialUpdateInput;

  const supportsPriceBreakRelation = await hasMaterialPriceBreaksTable();
  let material: MaterialDetailRecord;

  try {
    material = await prisma.material.update({
      where: { id },
      data: data as any,
      include: supportsPriceBreakRelation ? materialDetailInclude : materialDetailIncludeWithoutPriceBreaks,
    }) as unknown as MaterialDetailRecord;
  } catch (error) {
    if (!isMissingPriceBreaksTableError(error)) {
      throw error;
    }

    const fallbackData = stripPriceBreaksRelationFromMutationData(data as unknown as Record<string, unknown>);

    material = await prisma.material.update({
      where: { id },
      data: fallbackData as any,
      include: materialDetailIncludeWithoutPriceBreaks,
    }) as unknown as MaterialDetailRecord;
  }

  return normalizeMaterialResponse(material);
}

export async function deleteMaterial(id: string) {
  const material = await prisma.material.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!material) {
    throw new MaterialApiValidationError('Materialul nu a fost găsit', 404);
  }

  const consumptionCount = await prisma.materialUsage.count({
    where: { materialId: id },
  });

  if (consumptionCount > 0) {
    throw new MaterialApiValidationError('Nu se poate șterge materialul deoarece are consum asociat', 400);
  }

  await prisma.material.delete({
    where: { id },
  });

  return {
    success: true,
    message: 'Materialul a fost șters cu succes',
  };
}
