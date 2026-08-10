import type {
  Product,
  ProductImage,
  ProductMaterial,
  ProductPrintMethod,
  ProductFinishing,
  Prisma,
} from '@prisma/client';
import type {
  ProductOption,
  ProductPricing,
  ProductProduction,
  ProductDimensions,
  ProductSEO,
} from '@/modules/products/productBuilder.types';

interface PrismaFullProduct extends Product {
  images?: ProductImage[];
  materials?: Array<ProductMaterial & { material?: unknown }>;
  printMethods?: Array<ProductPrintMethod & { printMethod?: unknown }>;
  finishing?: Array<ProductFinishing & { finishing?: unknown }>;
  options?: Prisma.JsonValue | null;
  pricing?: Prisma.JsonValue | null;
  dimensions?: Prisma.JsonValue | null;
  production?: Prisma.JsonValue | null;
}

export function serializeFullProduct(product: PrismaFullProduct | null) {
  if (!product) {
    return null;
  }

  const {
    materials = [],
    printMethods = [],
    finishing = [],
    ...rest
  } = product;

  const pricing = (product.pricing as ProductPricing | null) ?? {
    type: 'fixed',
    basePrice: Number(product.price ?? 0),
    priceBreaks: [],
  };
  const pricingObj = (product.pricing ?? null) as Record<string, unknown> | null;
  const supplierCost = pricingObj && typeof pricingObj.supplierCost === 'number'
    ? Number(pricingObj.supplierCost)
    : null;
  const markup = pricingObj && typeof pricingObj.markup === 'number'
    ? Number(pricingObj.markup)
    : null;

  const options = Array.isArray(product.options)
    ? (product.options as ProductOption[])
    : [];
  const dimensions = product.dimensions && typeof product.dimensions === 'object'
    ? (product.dimensions as ProductDimensions)
    : undefined;
  const production = product.production && typeof product.production === 'object'
    ? (product.production as ProductProduction)
    : undefined;

  const seo: ProductSEO | undefined =
    product.metaTitle || product.metaDescription || product.ogImage
      ? {
          metaTitle: product.metaTitle ?? undefined,
          metaDescription: product.metaDescription ?? undefined,
          ogImage: product.ogImage ?? undefined,
        }
      : undefined;

  return {
    ...rest,
    saleUnit: product.saleUnit,
    printMethodId: product.printMethodId ?? null,
    materialId: product.materialId ?? null,
    isOutsourced: Boolean(product.isOutsourced),
    pricePerM2: product.pricePerM2 !== null && product.pricePerM2 !== undefined ? Number(product.pricePerM2) : null,
    pricePerUnit: product.pricePerUnit !== null && product.pricePerUnit !== undefined ? Number(product.pricePerUnit) : null,
    minOrderQty: product.minOrderQty ?? 1,
    supplierCost,
    markup,
    options,
    dimensions,
    pricing,
    production,
    seo,
    compatibleMaterials: materials.map((item) => item.materialId),
    compatiblePrintMethods: printMethods.map((item) => item.printMethodId),
    compatibleFinishing: finishing.map((item) => item.finishingId),
  };
}
