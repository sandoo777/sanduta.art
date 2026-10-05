import { MaterialConsumptionType, MaterialUnit, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getMaterialSelectionMeta } from './types';
import { resolveAllowedUnitsByCategory } from './pricing';

export const MATERIAL_API_TAG = 'API:Materials';

export const MATERIAL_CATEGORIES = ['sheet', 'roll', 'rigid', 'paper', 'vinyl', 'textile', 'other'] as const;

export type MaterialCategoryValue = (typeof MATERIAL_CATEGORIES)[number];

export interface MaterialMutationInput {
  name?: unknown;
  category?: unknown;
  categoryId?: unknown;
  colorName?: unknown;
  colorCode?: unknown;
  thumbnailUrl?: unknown;
  macroTextureUrl?: unknown;
  texture?: unknown;
  consumptionType?: unknown;
  thickness?: unknown;
  density?: unknown;
  purchasePrice?: unknown;
  salePrice?: unknown;
  salePriceMode?: unknown;
  salePricePercent?: unknown;
  pricePerSqm?: unknown;
  pricePerMeter?: unknown;
  pricePerUnit?: unknown;
  wastePercent?: unknown;
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
  printMethodIds?: unknown;
  compatibleMethods?: unknown;
}

interface MaterialValidationFieldError {
  field: string;
  message: string;
}

export class MaterialApiValidationError extends Error {
  status: number;
  errors: MaterialValidationFieldError[];
  details?: unknown;

  constructor(
    message: string,
    status = 400,
    options?: { errors?: MaterialValidationFieldError[]; details?: unknown }
  ) {
    super(message);
    this.name = 'MaterialApiValidationError';
    this.status = status;
    this.errors = options?.errors ?? [];
    this.details = options?.details;
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
  consumption: {
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
} satisfies Prisma.MaterialInclude;

const materialDetailInclude = {
  compatibleMethods: materialListInclude.compatibleMethods,
  category: true,
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

type MaterialListRecord = Prisma.MaterialGetPayload<{ include: typeof materialListInclude }>;
type MaterialDetailRecord = Prisma.MaterialGetPayload<{ include: typeof materialDetailInclude }>;

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

function normalizeUnit(value: unknown, fallback: MaterialUnit): MaterialUnit {
  const candidate = typeof value === 'string' ? value.trim() : '';
  if (!candidate) {
    return fallback;
  }

  if ((Object.values(MaterialUnit) as string[]).includes(candidate)) {
    return candidate as MaterialUnit;
  }

  throw new MaterialApiValidationError('Unitatea de măsură este invalidă');
}

export function normalizeMaterialResponse(material: MaterialListRecord | MaterialDetailRecord) {
  const totalConsumption = material.consumption.reduce((sum, usage) => sum + usage.quantity, 0);
  const materialProperties =
    (material.properties as Record<string, string | number | boolean> | null | undefined) ??
    {};
  const runtimeProperties = { ...materialProperties } as Record<string, string | number | boolean | null>;

  const rootAliases = material as Record<string, unknown>;
  if (typeof rootAliases.colorName === 'string') runtimeProperties.colorName = rootAliases.colorName;
  if (typeof rootAliases.colorCode === 'string') runtimeProperties.colorCode = rootAliases.colorCode;
  if (typeof rootAliases.thumbnailUrl === 'string') runtimeProperties.thumbnailUrl = rootAliases.thumbnailUrl;
  if (typeof rootAliases.macroTextureUrl === 'string') runtimeProperties.macroTextureUrl = rootAliases.macroTextureUrl;
  if (typeof rootAliases.texture === 'string') runtimeProperties.texture = rootAliases.texture;

  const colorName = typeof runtimeProperties.colorName === 'string' ? runtimeProperties.colorName : null;
  const colorCode = typeof runtimeProperties.colorCode === 'string' ? runtimeProperties.colorCode : null;
  const thumbnailUrl = typeof runtimeProperties.thumbnailUrl === 'string' ? runtimeProperties.thumbnailUrl : null;
  const macroTextureUrl = typeof runtimeProperties.macroTextureUrl === 'string' ? runtimeProperties.macroTextureUrl : null;
  const texture = typeof runtimeProperties.texture === 'string' ? runtimeProperties.texture : null;
  const selectionMeta = getMaterialSelectionMeta({
    ...rootAliases,
    properties: runtimeProperties,
  } as Record<string, unknown>);

  if (selectionMeta) {
    runtimeProperties.selectionGroup = selectionMeta.selectionGroup;
    runtimeProperties.selectionLabel = selectionMeta.selectionLabel;
    runtimeProperties.selectionValue = selectionMeta.selectionValue;
    runtimeProperties.isSelectable = selectionMeta.isSelectable;
  }
  
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
    // Legacy aliases kept for old list/detail consumers.
    pricePerSqm: material.unit === MaterialUnit.m2 ? (material.salePrice ? Number(material.salePrice) : null) : null,
    pricePerMeter: material.unit === MaterialUnit.meter ? (material.salePrice ? Number(material.salePrice) : null) : null,
    pricePerUnit: [MaterialUnit.unit, MaterialUnit.pcs, MaterialUnit.ml, MaterialUnit.liter, MaterialUnit.gram, MaterialUnit.kg]
      .includes(material.unit)
      ? (material.salePrice ? Number(material.salePrice) : null)
      : null,
    wastePercent: material.wastePercent,
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
    finishType: (material.finishType as 'mat' | 'lucios' | 'satin' | 'soft-touch' | null) ?? null,
    colorName,
    colorCode,
    thumbnailUrl,
    macroTextureUrl,
    texture,
    selectionGroup: selectionMeta?.selectionGroup ?? null,
    selectionLabel: selectionMeta?.selectionLabel ?? null,
    selectionValue: selectionMeta?.selectionValue ?? null,
    isSelectable: selectionMeta ? selectionMeta.isSelectable : false,
    packagingLabel: material.packagingLabel ?? null,
    packagingQty: material.packagingQty ?? null,
    packagingPrice: material.packagingPrice ? Number(material.packagingPrice) : null,
    properties: Object.keys(runtimeProperties).length > 0 ? runtimeProperties : null,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
    lowStock: material.stock < material.minStock,
    totalConsumption,
    consumption: material.consumption,
  };
}

export async function listMaterials() {
  const materials = await prisma.material.findMany({
    include: materialListInclude,
    orderBy: {
      name: 'asc',
    },
  });

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

  const materials = await prisma.material.findMany({
    where,
    include: materialListInclude,
    orderBy: {
      name: 'asc',
    },
  });

  return materials.map(normalizeMaterialResponse);
}

export async function getMaterialById(id: string) {
  const material = await prisma.material.findUnique({
    where: { id },
    include: materialDetailInclude,
  });

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

  const existingSkus = await prisma.material.findMany({
    where: {
      categoryId: normalizedCategoryId,
      sku: {
        startsWith: `${prefix}-`,
      },
    },
    select: { sku: true },
  });

  let maxSuffix = 0;
  const suffixPattern = new RegExp(`^${prefix}-(\\d+)$`);

  for (const row of existingSkus) {
    const value = row.sku?.trim();
    if (!value) continue;

    const match = value.match(suffixPattern);
    if (!match) continue;

    const parsed = Number.parseInt(match[1] ?? '0', 10);
    if (Number.isFinite(parsed) && parsed > maxSuffix) {
      maxSuffix = parsed;
    }
  }

  const nextNumber = maxSuffix + 1;

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
        active: true;
        unit: true;
        consumptionType: true;
        stock: true;
        minStock: true;
        notes: true;
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

  const consumptionTypeValue = payload.consumptionType ?? existing?.consumptionType ?? MaterialConsumptionType.AREA_BASED;
  if (consumptionTypeValue !== MaterialConsumptionType.AREA_BASED && consumptionTypeValue !== MaterialConsumptionType.DIRECT) {
    throw new MaterialApiValidationError('Tipul de consum este invalid');
  }

  const unitValue = normalizeUnit(payload.unit, existing?.unit ?? MaterialUnit.pcs);
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

  if (wastePercentValue < 0 || wastePercentValue > 100) {
    throw new MaterialApiValidationError('Waste percent trebuie să fie între 0 și 100');
  }

  if (!existing && purchasePriceValue == null && resolvedSalePrice == null) {
    throw new MaterialApiValidationError('Cel puțin un preț (achiziție sau vânzare) trebuie să fie setat');
  }

  const incomingMethodIds = payload.printMethodIds ?? payload.compatibleMethods;
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

  // Packaging fields
  const packagingLabel = typeof payload.packagingLabel === 'string'
    ? payload.packagingLabel.trim() || null
    : existing?.packagingLabel ?? null;
  const finishType = typeof payload.finishType === 'string'
    ? payload.finishType.trim() || null
    : payload.finishType === null
      ? null
      : (existing?.finishType ?? null);
  const selectionGroup = typeof payload.selectionGroup === 'string' ? payload.selectionGroup.trim() || null : null;
  const selectionLabel = typeof payload.selectionLabel === 'string' ? payload.selectionLabel.trim() || null : null;
  const selectionValue = typeof payload.selectionValue === 'string' ? payload.selectionValue.trim() || null : null;
  const existingSelectableValue =
    typeof (existing?.properties as Record<string, unknown> | null)?.isSelectable === 'boolean'
      ? Boolean((existing?.properties as Record<string, unknown>).isSelectable)
      : true;
  const isSelectable = payload.isSelectable === undefined ? existingSelectableValue : Boolean(payload.isSelectable);

  const existingProperties = (existing?.properties as Record<string, string | number | boolean | null> | null) ?? {};
  const nextProperties = { ...existingProperties };

  if (payload.properties !== undefined && payload.properties !== null && typeof payload.properties === 'object' && !Array.isArray(payload.properties)) {
    Object.assign(nextProperties, payload.properties as Record<string, string | number | boolean | null>);
  }

  const assignProperty = (key: string, value: unknown) => {
    if (value === undefined) return;
    nextProperties[key] = value === null || value === '' ? null : String(value);
  };

  assignProperty('colorName', payload.colorName);
  assignProperty('colorCode', payload.colorCode);
  assignProperty('thumbnailUrl', payload.thumbnailUrl);
  assignProperty('macroTextureUrl', payload.macroTextureUrl);
  assignProperty('texture', payload.texture);
  assignProperty('selectionGroup', selectionGroup);
  assignProperty('selectionLabel', selectionLabel);
  assignProperty('selectionValue', selectionValue);
  assignProperty('isSelectable', isSelectable);

  let properties: Record<string, string | number | boolean> | null = Object.keys(nextProperties).length > 0 ? (nextProperties as Record<string, string | number | boolean>) : null;
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
    sku,
    unit: unitValue,
    stock: stockValue,
    minStock: minStockValue,
    notes,
    finishType,
    packagingLabel,
    packagingQty: packagingQty !== null && packagingQty !== undefined ? packagingQty : null,
    packagingPrice: packagingPrice !== null ? new Prisma.Decimal(packagingPrice) : null,
    properties: properties ?? undefined,
    ...relationEnvelope,
  };
}

export async function createMaterial(payload: MaterialMutationInput) {
  const data = await buildMaterialMutationData(payload);

  const material = await prisma.material.create({
    data,
    include: materialDetailInclude,
  });

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
      active: true,
      unit: true,
      consumptionType: true,
      stock: true,
      minStock: true,
      notes: true,
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
  });

  const material = await prisma.material.update({
    where: { id },
    data,
    include: materialDetailInclude,
  });

  return normalizeMaterialResponse(material);
}

export async function deleteMaterial(id: string) {
  const material = await prisma.material.findUnique({
    where: { id },
    select: { id: true, name: true },
  });

  if (!material) {
    throw new MaterialApiValidationError('Materialul nu a fost găsit', 404);
  }

  const [
    consumptionCount,
    productionJobsCount,
    equipmentConsumablesCount,
    machineCompatibilityCount,
    productMaterialsCount,
    defaultProductsCount,
    printMethodConsumablesCount,
    printMethodLegacyCount,
    finishingCompatibilityCount,
    attributeOptionsCount,
    compatibleMethodsCount,
    usedInJobs,
    usedInMachines,
    usedInMachineCompatibilities,
    usedInProducts,
    usedInDefaultProducts,
    usedInPrintMethodConsumables,
    usedInLegacyPrintMethods,
    usedInFinishingOperations,
    usedInCompatibleMethods,
  ] = await prisma.$transaction([
    prisma.materialUsage.count({ where: { materialId: id } }),
    prisma.productionJob.count({ where: { materialId: id } }),
    prisma.equipmentConsumable.count({ where: { materialId: id } }),
    prisma.machine.count({ where: { compatibleMaterialIds: { has: id } } }),
    prisma.productMaterial.count({ where: { materialId: id } }),
    prisma.product.count({ where: { materialId: id } }),
    prisma.printMethodConsumable.count({ where: { materialId: id } }),
    prisma.printMethod.count({ where: { materialIds: { has: id } } }),
    prisma.finishingOperation.count({ where: { compatibleMaterialIds: { has: id } } }),
    prisma.productAttributeOption.count({ where: { materialId: id } }),
    prisma.printMethod.count({ where: { compatibleMaterials: { some: { id } } } }),
    prisma.materialUsage.findMany({
      where: { materialId: id },
      select: { job: { select: { name: true } } },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.equipmentConsumable.findMany({
      where: { materialId: id },
      select: { machine: { select: { name: true } } },
      take: 3,
    }),
    prisma.machine.findMany({
      where: { compatibleMaterialIds: { has: id } },
      select: { name: true },
      take: 3,
    }),
    prisma.productMaterial.findMany({
      where: { materialId: id },
      select: { product: { select: { name: true } } },
      take: 3,
    }),
    prisma.product.findMany({
      where: { materialId: id },
      select: { name: true },
      take: 3,
    }),
    prisma.printMethodConsumable.findMany({
      where: { materialId: id },
      select: { printMethod: { select: { name: true } } },
      take: 3,
    }),
    prisma.printMethod.findMany({
      where: { materialIds: { has: id } },
      select: { name: true },
      take: 3,
    }),
    prisma.finishingOperation.findMany({
      where: { compatibleMaterialIds: { has: id } },
      select: { name: true },
      take: 3,
    }),
    prisma.printMethod.findMany({
      where: { compatibleMaterials: { some: { id } } },
      select: { name: true },
      take: 3,
    }),
  ]);

  // Some environments still store digital toner bindings in machines.tonerConsumables (JSON).
  // We check this explicitly so a material cannot be deleted while used as toner.
  const tonerColumnExistsRows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'machines'
        AND column_name = 'tonerConsumables'
    ) AS "exists"
  `;

  let machineTonerJsonCount = 0;
  let usedInMachineTonerJson: string[] = [];

  if (tonerColumnExistsRows[0]?.exists) {
    const tonerCountRows = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*)::int AS count
      FROM public.machines m
      WHERE m."tonerConsumables" IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(m."tonerConsumables"::jsonb, '[]'::jsonb)) elem
          WHERE elem->>'materialId' = ${id}
             OR lower(COALESCE(elem->>'materialName', '')) = lower(${material.name})
             OR lower(COALESCE(elem->>'type', '')) = lower(${material.name})
        )
    `;

    machineTonerJsonCount = Number(tonerCountRows[0]?.count ?? 0);

    if (machineTonerJsonCount > 0) {
      const tonerExampleRows = await prisma.$queryRaw<Array<{ name: string }>>`
        SELECT m.name
        FROM public.machines m
        WHERE m."tonerConsumables" IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(COALESCE(m."tonerConsumables"::jsonb, '[]'::jsonb)) elem
            WHERE elem->>'materialId' = ${id}
               OR lower(COALESCE(elem->>'materialName', '')) = lower(${material.name})
               OR lower(COALESCE(elem->>'type', '')) = lower(${material.name})
          )
        ORDER BY m.name ASC
        LIMIT 3
      `;

      usedInMachineTonerJson = tonerExampleRows.map((row) => row.name).filter(Boolean);
    }
  }

  const usageEntries = [
    {
      key: 'materialUsage',
      label: 'istoric de consum',
      count: consumptionCount,
      examples: usedInJobs.map((row) => row.job?.name).filter((name): name is string => Boolean(name)),
    },
    {
      key: 'productionJobs',
      label: 'joburi de producție',
      count: productionJobsCount,
      examples: usedInJobs.map((row) => row.job?.name).filter((name): name is string => Boolean(name)),
    },
    {
      key: 'equipmentConsumables',
      label: 'consumabile de echipamente',
      count: equipmentConsumablesCount,
      examples: usedInMachines.map((row) => row.machine?.name).filter((name): name is string => Boolean(name)),
    },
    {
      key: 'machineCompatibility',
      label: 'materiale compatibile pe echipamente',
      count: machineCompatibilityCount,
      examples: usedInMachineCompatibilities.map((row) => row.name).filter((name): name is string => Boolean(name)),
    },
    {
      key: 'machineTonerJson',
      label: 'toner setat pe echipamente',
      count: machineTonerJsonCount,
      examples: usedInMachineTonerJson,
    },
    {
      key: 'productMaterials',
      label: 'materiale mapate la produse',
      count: productMaterialsCount,
      examples: usedInProducts.map((row) => row.product?.name).filter((name): name is string => Boolean(name)),
    },
    {
      key: 'defaultProducts',
      label: 'produse cu material implicit',
      count: defaultProductsCount,
      examples: usedInDefaultProducts.map((row) => row.name).filter((name): name is string => Boolean(name)),
    },
    {
      key: 'printMethodConsumables',
      label: 'consumabile pe metode de tipărire',
      count: printMethodConsumablesCount,
      examples: usedInPrintMethodConsumables
        .map((row) => row.printMethod?.name)
        .filter((name): name is string => Boolean(name)),
    },
    {
      key: 'printMethodLegacy',
      label: 'metode de tipărire (legacy materialIds)',
      count: printMethodLegacyCount,
      examples: usedInLegacyPrintMethods.map((row) => row.name).filter((name): name is string => Boolean(name)),
    },
    {
      key: 'finishingCompatibility',
      label: 'operațiuni de finisare compatibile',
      count: finishingCompatibilityCount,
      examples: usedInFinishingOperations.map((row) => row.name).filter((name): name is string => Boolean(name)),
    },
    {
      key: 'compatibleMethods',
      label: 'metode de tipărire compatibile',
      count: compatibleMethodsCount,
      examples: usedInCompatibleMethods.map((row) => row.name).filter((name): name is string => Boolean(name)),
    },
    {
      key: 'attributeOptions',
      label: 'opțiuni de configurator',
      count: attributeOptionsCount,
      examples: [],
    },
  ].filter((entry) => entry.count > 0);

  if (usageEntries.length > 0) {
    const usageSummary = usageEntries
      .map((entry) => {
        const examples = entry.examples.slice(0, 2);
        const suffix = examples.length > 0 ? ` (${examples.join(', ')})` : '';
        return `- ${entry.label}: ${entry.count}${suffix}`;
      })
      .join('\n');

    throw new MaterialApiValidationError(
      `Materialul "${material.name}" nu poate fi șters deoarece este folosit în alte module.\n${usageSummary}`,
      409,
      {
        details: {
          materialId: material.id,
          materialName: material.name,
          usages: usageEntries,
        },
      }
    );
  }

  await prisma.material.delete({
    where: { id },
  });

  return {
    success: true,
    message: 'Materialul a fost șters cu succes',
  };
}
