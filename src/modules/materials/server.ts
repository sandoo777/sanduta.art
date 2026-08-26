import { MaterialUnit, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const MATERIAL_API_TAG = 'API:Materials';

export const MATERIAL_CATEGORIES = ['sheet', 'roll', 'rigid', 'paper', 'vinyl', 'textile', 'other'] as const;

export type MaterialCategoryValue = (typeof MATERIAL_CATEGORIES)[number];

export interface MaterialMutationInput {
  name?: unknown;
  category?: unknown;
  categoryId?: unknown;
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
  printMethodIds?: unknown;
  compatibleMethods?: unknown;
}

export class MaterialApiValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'MaterialApiValidationError';
    this.status = status;
  }
}

const materialListInclude = {
  print_methods: {
    select: {
      id: true,
      name: true,
      type: true,
      active: true,
    },
    orderBy: {
      name: 'asc' as const,
    },
  },
  material_categories: true,
  consumption: true,
} satisfies Prisma.MaterialInclude;

const materialDetailInclude = {
  print_methods: materialListInclude.print_methods,
  material_categories: true,
  consumption: {
    include: {
      job: {
        include: {
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

function isMaterialCategory(value: unknown): value is MaterialCategoryValue {
  return typeof value === 'string' && MATERIAL_CATEGORIES.includes(value as MaterialCategoryValue);
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
  const categoryType = (material.material_categories?.type ?? 'other') as MaterialCategoryValue;

  return {
    id: material.id,
    name: material.name,
    categoryId: material.categoryId,
    category: categoryType,
    categoryInfo: material.material_categories
      ? {
          id: material.material_categories.id,
          name: material.material_categories.name,
          description: material.material_categories.description,
          requiresThickness: material.material_categories.requiresThickness,
          requiresDensity: material.material_categories.requiresDensity,
          requiresPricePerSqm: material.material_categories.requiresPricePerSqm,
          requiresPricePerMeter: material.material_categories.requiresPricePerMeter,
          requiresPricePerUnit: material.material_categories.requiresPricePerUnit,
          requiresWastePercent: material.material_categories.requiresWastePercent,
          active: material.material_categories.active,
        }
      : null,
    thickness: material.thickness,
    density: material.density,
    purchasePrice: material.purchasePrice ? Number(material.purchasePrice) : null,
    salePrice: material.salePrice ? Number(material.salePrice) : null,
    salePriceMode: material.salePriceMode === 'percent' ? 'percent' : 'amount',
    salePricePercent: material.salePricePercent,
    // Legacy aliases kept for backward compatibility with old forms/components.
    pricePerSqm: material.salePrice ? Number(material.salePrice) : null,
    pricePerMeter: material.salePrice ? Number(material.salePrice) : null,
    pricePerUnit: material.salePrice ? Number(material.salePrice) : null,
    costPerUnit: material.salePrice ? Number(material.salePrice) : 0,
    wastePercent: material.wastePercent,
    active: material.active,
    printMethods: material.print_methods.map((method) => ({
      id: method.id,
      name: method.name,
      type: method.type,
      active: method.active,
    })),
    printMethodIds: material.print_methods.map((method) => method.id),
    compatibleMethods: material.print_methods.map((method) => method.id),
    sku: material.sku,
    unit: material.unit,
    stock: material.stock,
    minStock: material.minStock,
    notes: material.notes,
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
          print_methods: { some: { id: printMethodId } },
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

  if (isMaterialCategory(payload.category)) {
    const byType = await prisma.material_categories.findFirst({
      where: {
        type: payload.category,
        active: true,
      },
      select: { id: true },
      orderBy: { name: 'asc' },
    });

    if (byType) {
      return byType.id;
    }
  }

  if (existingCategoryId) {
    return existingCategoryId;
  }

  const fallback = await prisma.material_categories.findFirst({
    where: {
      OR: [{ type: 'other' }, { active: true }],
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
        stock: true;
        minStock: true;
        notes: true;
        print_methods: { select: { id: true } };
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
  const categoryExists = await prisma.material_categories.findUnique({ where: { id: categoryIdValue }, select: { id: true } });
  if (!categoryExists) {
    throw new MaterialApiValidationError('Categoria selectată nu există');
  }

  const unitValue = normalizeUnit(payload.unit, existing?.unit ?? MaterialUnit.pcs);

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
    ? existing?.print_methods.map((method) => method.id) ?? []
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

  const relationEnvelope = options.replaceRelations
    ? {
        print_methods: {
          set: [],
          connect: printMethodIds.map((id) => ({ id })),
        },
      }
    : {
        print_methods: {
          connect: printMethodIds.map((id) => ({ id })),
        },
      };

  return {
    name: nameValue.trim(),
    material_categories: {
      connect: { id: categoryIdValue },
    },
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
      stock: true,
      minStock: true,
      notes: true,
      print_methods: {
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
