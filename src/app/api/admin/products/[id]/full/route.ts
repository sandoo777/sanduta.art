import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { serializeFullProduct } from '../../full/utils';
import type { CreateFullProductInput } from '@/modules/products/productBuilder.types';

const ALLOWED_ROLES = new Set(['ADMIN', 'MANAGER']);

function parseNonNegative(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function hasOwnField(obj: Record<string, unknown>, field: string) {
  return Object.prototype.hasOwnProperty.call(obj, field);
}

function normalizeImages(images?: string[]) {
  if (!images) {
    return null;
  }

  const filtered = images
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url && url.length > 0));

  return filtered;
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function sanitizeProductPayload<T>(body: T): T & { price: number } {
  const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : value);
  const sanitized = JSON.parse(JSON.stringify(body ?? {})) as Record<string, unknown>;

  ['name', 'slug', 'sku', 'description', 'descriptionShort'].forEach((key) => {
    if (sanitized[key]) {
      sanitized[key] = trimString(sanitized[key]);
    }
  });

  if (Array.isArray(sanitized.images)) {
    sanitized.images = sanitized.images
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter(Boolean);
  }

  if (Array.isArray(sanitized.options)) {
    sanitized.options = sanitized.options.map((option) => {
      if (Array.isArray((option as { values?: unknown[] }).values)) {
        return {
          ...option,
          values: (option as { values: Array<{ label?: unknown; value?: unknown }> }).values.map((value) => ({
            ...value,
            label: trimString(value.label),
            value: trimString(value.value),
          })),
        };
      }

      return option;
    });
  }

  if (sanitized.pricing && typeof sanitized.pricing === 'object') {
    const pricing = sanitized.pricing as Record<string, unknown>;
    if (pricing.basePrice == null) {
      pricing.basePrice = 0;
    }
    pricing.basePrice = Number(pricing.basePrice) || 0;

    if (pricing.type === 'fixed' || pricing.type === 'per_unit') {
      sanitized.price = pricing.basePrice;
    } else {
      sanitized.price = Number(sanitized.price) || 0;
    }
  } else {
    sanitized.price = Number(sanitized.price) || 0;
  }

  return sanitized as T & { price: number };
}

function removeUndefined(obj: unknown): unknown {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter((value) => value !== undefined);
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }

    const cleaned = removeUndefined(value);
    if (cleaned === undefined) {
      continue;
    }
    if (typeof cleaned === 'object' && cleaned !== null && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0) {
      continue;
    }
    if (Array.isArray(cleaned) && cleaned.length === 0) {
      continue;
    }

    out[key] = cleaned;
  }

  return out;
}

function normalizePricing(pricing: unknown, topLevelPrice: unknown) {
  if (!pricing || typeof pricing !== 'object') {
    if (topLevelPrice != null) {
      return { basePrice: Number(topLevelPrice) || 0, type: 'fixed', priceBreaks: [] };
    }

    return undefined;
  }

  const pricingRecord = pricing as Record<string, unknown>;
  return {
    basePrice: Number(pricingRecord.basePrice ?? topLevelPrice ?? 0) || 0,
    type: pricingRecord.type || 'fixed',
    priceBreaks: Array.isArray(pricingRecord.priceBreaks) ? pricingRecord.priceBreaks : [],
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !ALLOWED_ROLES.has(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        materials: true,
        printMethods: true,
        finishing: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(
      serializeFullProduct(product as Parameters<typeof serializeFullProduct>[0])
    );
  } catch (error) {
    console.error('Error fetching full product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !ALLOWED_ROLES.has(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = sanitizeProductPayload((await req.json()) as Partial<CreateFullProductInput>);
    if (!body.pricing) {
      body.pricing = { basePrice: Number(body.price) || 0, priceBreaks: [] } as CreateFullProductInput['pricing'];
    }
    body.pricing.basePrice = Number(body.pricing.basePrice) || Number(body.price) || 0;
    body.price = Number(body.price) || body.pricing.basePrice;

    const rawBody = body as Record<string, unknown>;
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        saleUnit: true,
        pricePerM2: true,
        pricePerUnit: true,
        materialId: true,
        isOutsourced: true,
        printMethodId: true,
        pricing: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (body.slug && body.slug !== product.slug) {
      const duplicateSlug = await prisma.product.findUnique({
        where: { slug: body.slug },
        select: { id: true },
      });

      if (duplicateSlug) {
        return NextResponse.json(
          { error: 'Slug-ul specificat este deja folosit' },
          { status: 400 }
        );
      }
    }

    if (body.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId },
        select: { id: true },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Categoria selectată nu există' },
          { status: 400 }
        );
      }
    }

    const nextPrintMethodId = body.printMethodId !== undefined ? (body.printMethodId || null) : product.printMethodId;
    const nextMaterialId = body.materialId !== undefined ? (body.materialId || null) : product.materialId;
    let nextIsOutsourced = body.isOutsourced ?? product.isOutsourced;
    const nextSaleUnit = body.saleUnit ?? product.saleUnit;

    if (nextPrintMethodId) {
      const method = await prisma.printMethod.findUnique({
        where: { id: nextPrintMethodId },
        select: {
          id: true,
          active: true,
          isOutsourced: true,
          materialIds: true,
        },
      });

      if (!method || !method.active) {
        return NextResponse.json(
          { error: 'Metoda de print selectată nu există sau este inactivă' },
          { status: 400 }
        );
      }

      nextIsOutsourced = method.isOutsourced;

      const compatibleMaterialIds = ((method as { materialIds?: string[] | null }).materialIds ?? []) as string[];

      if (nextMaterialId && !method.isOutsourced && compatibleMaterialIds.length > 0 && !compatibleMaterialIds.includes(nextMaterialId)) {
        return NextResponse.json(
          { error: 'Materialul implicit nu este compatibil cu metoda de print selectată' },
          { status: 400 }
        );
      }
    }

    if (nextMaterialId) {
      const material = await prisma.material.findUnique({
        where: { id: nextMaterialId },
        select: { id: true, active: true },
      });

      if (!material || !material.active) {
        return NextResponse.json(
          { error: 'Materialul implicit selectat nu există sau este inactiv' },
          { status: 400 }
        );
      }
    }

    if (nextSaleUnit !== undefined && !['M2', 'UNIT'].includes(nextSaleUnit)) {
      return NextResponse.json(
        { error: 'Unitatea de vânzare trebuie să fie M2 sau UNIT' },
        { status: 400 }
      );
    }

    const pricePerM2 = parseNonNegative(body.pricePerM2);
    if (body.pricePerM2 !== undefined && pricePerM2 === null) {
      return NextResponse.json(
        { error: 'pricePerM2 trebuie să fie >= 0' },
        { status: 400 }
      );
    }

    const pricePerUnit = parseNonNegative(body.pricePerUnit);
    if (body.pricePerUnit !== undefined && pricePerUnit === null) {
      return NextResponse.json(
        { error: 'pricePerUnit trebuie să fie >= 0' },
        { status: 400 }
      );
    }

    const effectiveSaleUnit = nextSaleUnit;
    const nextPricePerM2 = body.pricePerM2 !== undefined
      ? pricePerM2
      : parseNonNegative(product.pricePerM2);
    const nextPricePerUnit = body.pricePerUnit !== undefined
      ? pricePerUnit
      : parseNonNegative(product.pricePerUnit);

    if (!nextIsOutsourced && effectiveSaleUnit === 'M2' && nextPricePerM2 === null) {
      return NextResponse.json(
        { error: 'Pentru produse la m², pricePerM2 este obligatoriu' },
        { status: 400 }
      );
    }

    if (!nextIsOutsourced && effectiveSaleUnit === 'UNIT' && nextPricePerUnit === null) {
      return NextResponse.json(
        { error: 'Pentru produse la bucată, pricePerUnit este obligatoriu' },
        { status: 400 }
      );
    }

    if (!nextIsOutsourced && (hasOwnField(rawBody, 'supplierCost') || hasOwnField(rawBody, 'markup'))) {
      return NextResponse.json(
        { error: 'Campurile supplierCost/markup sunt permise doar pentru outsource' },
        { status: 400 }
      );
    }

    if (nextIsOutsourced === false && nextMaterialId === null) {
      return NextResponse.json(
        { error: 'Pentru metode interne, materialul implicit este obligatoriu' },
        { status: 400 }
      );
    }

    const existingPricing = (product.pricing ?? null) as Record<string, unknown> | null;
    const existingSupplierCost = typeof existingPricing?.supplierCost === 'number'
      ? Number(existingPricing.supplierCost)
      : null;
    const existingMarkup = typeof existingPricing?.markup === 'number'
      ? Number(existingPricing.markup)
      : null;
    const incomingBasePrice = body.pricing && Number(body.pricing.basePrice)
      ? Number(body.pricing.basePrice)
      : undefined;
    const incomingPrice = Number(body.price)
      ? Number(body.price)
      : incomingBasePrice;

    let nextFinalPrice: number | undefined;
    let nextSupplierCost: number | null = existingSupplierCost;
    let nextMarkup: number | null = existingMarkup;
    if (nextIsOutsourced) {
      if (hasOwnField(rawBody, 'supplierCost')) {
        nextSupplierCost = parseNonNegative(rawBody.supplierCost);
      }

      if (hasOwnField(rawBody, 'markup')) {
        nextMarkup = parseNonNegative(rawBody.markup);
      }

      if (nextSupplierCost === null) {
        return NextResponse.json(
          { error: 'supplierCost este obligatoriu și trebuie să fie >= 0 pentru outsource' },
          { status: 400 }
        );
      }

      if (nextMarkup === null) {
        return NextResponse.json(
          { error: 'markup este obligatoriu și trebuie să fie >= 0 pentru outsource' },
          { status: 400 }
        );
      }

      nextFinalPrice = nextSupplierCost + (nextSupplierCost * nextMarkup) / 100;
    } else {
      nextFinalPrice = incomingPrice ?? (effectiveSaleUnit === 'M2' ? Number(nextPricePerM2) : Number(nextPricePerUnit));
      nextSupplierCost = null;
      nextMarkup = null;
    }

    const updateData: Record<string, unknown> = {
      name: body.name,
      slug: body.slug,
      sku: body.sku || undefined,
      description: body.description || undefined,
      descriptionShort: body.descriptionShort || undefined,
      active: body.active,
      categoryId: body.categoryId || undefined,
      type: body.type || undefined,
      dimensions: body.dimensions
        ? {
            widthMin: Number(body.dimensions.widthMin) || null,
            widthMax: Number(body.dimensions.widthMax) || null,
            heightMin: Number(body.dimensions.heightMin) || null,
            heightMax: Number(body.dimensions.heightMax) || null,
            unit: body.dimensions.unit || null,
          }
        : undefined,
      pricing: body.pricing
        ? {
            basePrice: incomingBasePrice ?? incomingPrice ?? nextFinalPrice ?? 0,
            type: body.pricing.type || 'fixed',
            priceBreaks: body.pricing.priceBreaks || [],
            supplierCost: nextSupplierCost,
            markup: nextMarkup,
          }
        : undefined,
      price: incomingPrice ?? nextFinalPrice,
      saleUnit: nextSaleUnit || undefined,
      minOrderQty: Number(body.minOrderQty || (body as Partial<CreateFullProductInput> & { minQuantity?: number }).minQuantity) || undefined,
      pricePerUnit: body.pricePerUnit !== undefined ? Number(body.pricePerUnit) || null : undefined,
      pricePerM2: body.pricePerM2 !== undefined ? body.pricePerM2 : undefined,
      metaTitle: body.seo?.metaTitle ?? undefined,
      metaDescription: body.seo?.metaDescription ?? undefined,
      ogImage: body.seo?.ogImage ?? undefined,
      production: body.production
        ? {
            estimatedTime: Number(body.production.estimatedTime) || null,
            operations: body.production.operations?.map((operation) => ({
              name: operation.name,
              order: Number(operation.order) || 0,
              timeMinutes: Number(operation.timeMinutes) || 0,
            })) || [],
          }
        : undefined,
      options: Array.isArray(body.options)
        ? {
            create: body.options.map((option) => ({
              name: option.name,
              type: option.type,
              required: Boolean(option.required),
              values: {
                create: (option.values || []).map((value) => ({
                  label: value.label?.trim?.() ?? value.label,
                  value: value.value?.trim?.() ?? value.value,
                  priceModifier: value.priceModifier ?? null,
                })),
              },
            })),
          }
        : undefined,
      compatibleMaterials: Array.isArray(body.compatibleMaterials)
        ? {
            connect: body.compatibleMaterials.map((relationId) => ({ id: relationId })),
          }
        : undefined,
      compatiblePrintMethods: Array.isArray(body.compatiblePrintMethods)
        ? {
            connect: body.compatiblePrintMethods.map((relationId) => ({ id: relationId })),
          }
        : undefined,
      compatibleFinishing: Array.isArray(body.compatibleFinishing)
        ? {
            connect: body.compatibleFinishing.map((relationId) => ({ id: relationId })),
          }
        : undefined,
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : undefined,
      printMethodId: body.printMethodId !== undefined ? nextPrintMethodId : undefined,
      materialId: body.materialId !== undefined ? (nextIsOutsourced ? null : nextMaterialId) : undefined,
      isOutsourced: nextIsOutsourced,
    };

    updateData.pricing = normalizePricing(updateData.pricing, updateData.price);
    const cleanedUpdateData = removeUndefined(updateData) as Prisma.ProductUncheckedUpdateInput;

    await prisma.product.update({
      where: { id },
      data: cleanedUpdateData,
    });

    if (body.compatibleMaterials) {
      await prisma.productMaterial.deleteMany({ where: { productId: id } });
      if (body.compatibleMaterials.length > 0) {
        await prisma.productMaterial.createMany({
          data: body.compatibleMaterials.map((materialId) => ({ productId: id, materialId })),
          skipDuplicates: true,
        });
      }
    }

    if (body.compatiblePrintMethods) {
      await prisma.productPrintMethod.deleteMany({ where: { productId: id } });
      if (body.compatiblePrintMethods.length > 0) {
        await prisma.productPrintMethod.createMany({
          data: body.compatiblePrintMethods.map((printMethodId) => ({ productId: id, printMethodId })),
          skipDuplicates: true,
        });
      }
    }

    if (body.compatibleFinishing) {
      await prisma.productFinishing.deleteMany({ where: { productId: id } });
      if (body.compatibleFinishing.length > 0) {
        await prisma.productFinishing.createMany({
          data: body.compatibleFinishing.map((finishingId) => ({ productId: id, finishingId })),
          skipDuplicates: true,
        });
      }
    }

    if (body.images) {
      const sanitizedImages = normalizeImages(body.images) ?? [];
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (sanitizedImages.length > 0) {
        await prisma.productImage.createMany({
          data: sanitizedImages.map((url) => ({ productId: id, url })),
        });
      }
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        materials: true,
        printMethods: true,
        finishing: true,
      },
    });

    return NextResponse.json(
      serializeFullProduct(updatedProduct as Parameters<typeof serializeFullProduct>[0])
    );
  } catch (error) {
    console.error('Error updating full product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}
