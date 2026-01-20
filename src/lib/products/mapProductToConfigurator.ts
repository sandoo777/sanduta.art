import type {
  Product,
  ProductImage,
  ProductMaterial,
  ProductPrintMethod,
  ProductFinishing,
} from '@prisma/client';
import type { ConfiguratorProduct, ConfiguratorOption } from '@/modules/configurator/types';
import type { ProductOption, ProductPricing, ProductProduction, ProductDimensions, ProductSEO } from '@/modules/products/productBuilder.types';
import type { Material } from '@/modules/materials/types';
import type { PrintMethod } from '@/modules/print-methods/types';
import type { FinishingOperation } from '@/modules/finishing/types';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

type PrismaProductWithRelations = Product & {
  images: ProductImage[];
  materials: Array<ProductMaterial & { material?: Material | null }>;
  printMethods: Array<ProductPrintMethod & { printMethod?: PrintMethod | null }>;
  finishing: Array<ProductFinishing & { finishing?: FinishingOperation | null }>;
};

function ensureArray<T>(value: unknown): T[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value as T[];
  }

  return [];
}

function sanitizePricing(product: Product): ProductPricing {
  const basePrice = typeof product.price === 'object' ? Number(product.price) : Number(product.price ?? 0);
  const fallback: ProductPricing = {
    type: 'fixed',
    basePrice,
    priceBreaks: [],
  };

  if (!product.pricing) {
    return fallback;
  }

  try {
    const parsed = typeof product.pricing === 'string'
      ? (JSON.parse(product.pricing) as ProductPricing)
      : (product.pricing as ProductPricing);

    if (!parsed || typeof parsed !== 'object') {
      return fallback;
    }

    return {
      type: parsed.type ?? fallback.type,
      basePrice: Number(parsed.basePrice ?? fallback.basePrice),
      priceBreaks: ensureArray(parsed.priceBreaks).map((pb) => ({
        minQuantity: pb.minQuantity,
        maxQuantity: pb.maxQuantity ?? null,
        pricePerUnit: Number(pb.pricePerUnit ?? fallback.basePrice),
      })),
      formula: parsed.formula,
      discounts: parsed.discounts,
    };
  } catch (_error) {
    console.warn('Failed to parse pricing payload', error);
    return fallback;
  }
}

function parseJsonField<T>(value?: unknown): T | undefined {
  if (!value) {
    return undefined;
  }

  try {
    if (typeof value === 'string') {
      return JSON.parse(value) as T;
    }

    return value as T;
  } catch (_error) {
    console.warn('Failed to parse JSON field', error);
    return undefined;
  }
}

function sanitizeOptions(product: Product): ConfiguratorOption[] {
  const rawOptions = ensureArray<ProductOption>(product.options);

  return rawOptions.map((option, index) => ({
    id: option.id ?? `${product.id}-option-${index}`,
    name: option.name,
    type: option.type,
    required: option.required,
    values: option.values.map((value) => ({ ...value })),
    rules: option.rules,
  }));
}

function parseJsonNotes<T>(payload?: string | null): T | undefined {
  if (!payload) {
    return undefined;
  }

  const trimmed = payload.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return undefined;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (_error) {
    console.warn('Unable to parse notes payload as JSON', error);
    return undefined;
  }
}

function toNumber(value?: number | string | null) {
  if (value == null) {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

export function mapProductToConfigurator(product: PrismaProductWithRelations): ConfiguratorProduct {
  if (!product.active) {
    throw new Error('Product is inactive');
  }

  const pricing = sanitizePricing(product);
  const options = sanitizeOptions(product);

  const materials = product.materials
    .map((entry) => {
      if (!entry.material) {
        return undefined;
      }

      const constraints = parseJsonNotes<{ maxWidth?: number; maxHeight?: number; minWidth?: number; minHeight?: number; unit?: 'mm' | 'cm' | 'm'; }>(entry.material.notes ?? undefined);

      return {
        id: entry.material.id,
        name: entry.material.name,
        unit: entry.material.unit,
        costPerUnit: Number(entry.material.costPerUnit ?? 0),
        priceModifier: toNumber(entry.priceModifier ?? undefined),
        notes: entry.material.notes ?? null,
        constraints: constraints
          ? {
              maxWidth: constraints.maxWidth,
              maxHeight: constraints.maxHeight,
              minWidth: constraints.minWidth,
              minHeight: constraints.minHeight,
              unit: constraints.unit,
            }
          : undefined,
      };
    })
    .filter((material): material is NonNullable<typeof material> => Boolean(material));

  const printMethods = product.printMethods
    .map((entry) => {
      if (!entry.printMethod) {
        return undefined;
      }

      return {
        id: entry.printMethod.id,
        name: entry.printMethod.name,
        type: entry.printMethod.type,
        costPerM2: entry.printMethod.costPerM2 ? Number(entry.printMethod.costPerM2) : null,
        costPerSheet: entry.printMethod.costPerSheet ? Number(entry.printMethod.costPerSheet) : null,
        maxWidth: entry.printMethod.maxWidth,
        maxHeight: entry.printMethod.maxHeight,
        materialIds: entry.printMethod.materialIds ?? [],
      };
    })
    .filter((method): method is NonNullable<typeof method> => Boolean(method));

  const finishing = product.finishing
    .map((entry) => {
      if (!entry.finishing) {
        return undefined;
      }

      return {
        id: entry.finishing.id,
        name: entry.finishing.name,
        costFix: entry.finishing.costFix ? Number(entry.finishing.costFix) : null,
        costPerUnit: entry.finishing.costPerUnit ? Number(entry.finishing.costPerUnit) : null,
        costPerM2: entry.finishing.costPerM2 ? Number(entry.finishing.costPerM2) : null,
        priceModifier: toNumber(entry.priceModifier ?? undefined) ?? 0,
        compatibleMaterialIds: entry.finishing.compatibleMaterialIds ?? [],
        compatiblePrintMethodIds: entry.finishing.compatiblePrintMethodIds ?? [],
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const production = parseJsonField<ProductProduction>(product.production);

  const dimensions = parseJsonField<ProductDimensions>(product.dimensions);

  const seo = product.metaTitle || product.metaDescription || product.ogImage
    ? ({
        metaTitle: product.metaTitle ?? undefined,
        metaDescription: product.metaDescription ?? undefined,
        ogImage: product.ogImage ?? undefined,
      } satisfies ProductSEO)
    : undefined;

  const images = product.images?.map((image) => image.url) ?? [];
  const defaultImage = images[0] ?? PLACEHOLDER_IMAGE;

  const defaults = {
    materialId: materials[0]?.id,
    printMethodId: printMethods[0]?.id,
    finishingIds: finishing.length > 0 ? [finishing[0].id] : [],
    optionValues: options.reduce<Record<string, string | string[]>>((acc, option) => {
      if (option.type === 'checkbox') {
        acc[option.id] = [];
      } else if (option.values.length > 0) {
        acc[option.id] = option.values[0].value;
      }
      return acc;
    }, {}),
    quantity: 1,
  };

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    descriptionShort: product.descriptionShort,
    type: product.type,
    active: product.active,
    options,
    materials,
    printMethods,
    finishing,
    pricing,
    production,
    dimensions,
    seo,
    images,
    defaultImage,
    defaults,
  };
}
