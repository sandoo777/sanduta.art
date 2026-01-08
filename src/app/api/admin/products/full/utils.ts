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
