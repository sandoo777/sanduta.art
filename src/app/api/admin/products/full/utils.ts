import type {
  Product,
  ProductImage,
  ProductMaterial,
  ProductPrintMethod,
  ProductFinishing,
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
  options?: ProductOption[] | null;
  pricing?: ProductPricing | null;
  dimensions?: ProductDimensions | null;
  production?: ProductProduction | null;
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

  const pricing: ProductPricing = product.pricing ?? {
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

  const options: ProductOption[] = product.options ?? [];
  const dimensions: ProductDimensions | undefined = product.dimensions ?? undefined;
  const production: ProductProduction | undefined = product.production ?? undefined;

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
