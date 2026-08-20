import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { serializeFullProduct } from './utils';
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

function normalizeImages(images?: string[] | null) {
  if (!images) {
    return [];
  }
  return images
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url && url.length > 0));
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

function validatePayload(data: Partial<CreateFullProductInput>) {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Numele produsului este obligatoriu');
  }

  if (!data.slug?.trim()) {
    errors.push('Slug-ul produsului este obligatoriu');
  }

  if (!data.categoryId) {
    errors.push('Selectează o categorie pentru produs');
  }

  if (!data.pricing) {
    errors.push('Setările de pricing sunt obligatorii');
  }

  if (!data.printMethodId) {
    errors.push('Metoda de print implicită este obligatorie');
  }

  if (!data.saleUnit || !['M2', 'UNIT'].includes(data.saleUnit)) {
    errors.push('Unitatea de vânzare este obligatorie');
  }

  if (!data.minOrderQty || data.minOrderQty < 1) {
    errors.push('Cantitatea minimă trebuie să fie cel puțin 1');
  }

  const pricePerM2 = parseNonNegative(data.pricePerM2);
  const pricePerUnit = parseNonNegative(data.pricePerUnit);
  if (data.pricePerM2 !== undefined && pricePerM2 === null) {
    errors.push('pricePerM2 trebuie să fie >= 0');
  }
  if (data.pricePerUnit !== undefined && pricePerUnit === null) {
    errors.push('pricePerUnit trebuie să fie >= 0');
  }

  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !ALLOWED_ROLES.has(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = sanitizeProductPayload((await req.json()) as CreateFullProductInput);

    if (!body.printMethodId) {
      body.printMethodId = body.compatiblePrintMethods?.[0] || 'default-print';
    }
    if (!body.saleUnit) {
      body.saleUnit = 'UNIT';
    }
    if (!body.minOrderQty || Number(body.minOrderQty) < 1) {
      body.minOrderQty = 1;
    }
    if (body.pricing && (body.price == null || Number(body.price) === 0)) {
      body.price = Number(body.pricing.basePrice) || body.price || 0;
    }
    if (body.saleUnit === 'UNIT' && body.pricePerUnit === undefined) {
      body.pricePerUnit = body.price;
    }
    const rawBody = body as unknown as Record<string, unknown>;
    const validationErrors = validatePayload(body);

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: 'Invalid payload', details: validationErrors }, { status: 400 });
    }

    const existingSlug = await prisma.product.findUnique({
      where: { slug: body.slug },
      select: { id: true },
    });

    if (existingSlug) {
      return NextResponse.json({ error: 'Slug-ul există deja pentru un alt produs' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ error: 'Categoria selectată nu există' }, { status: 400 });
    }

    let selectedPrintMethod: {
      id: string;
      isOutsourced: boolean;
      materialIds: string[];
      costFurnizorPerM2: number | null;
      costFurnizorPerUnit: number | null;
      markup: number | null;
    } | null = null;
    if (body.printMethodId && prisma.printMethod?.findUnique) {
      const method = await prisma.printMethod.findUnique({
        where: { id: body.printMethodId },
        select: {
          id: true,
          isOutsourced: true,
          materialIds: true,
          active: true,
          costFurnizorPerM2: true,
          costFurnizorPerUnit: true,
          markup: true,
        },
      });

      if (!method || !method.active) {
        return NextResponse.json({ error: 'Metoda de print selectată nu există sau este inactivă' }, { status: 400 });
      }

      selectedPrintMethod = {
        id: method.id,
        isOutsourced: method.isOutsourced,
        materialIds: ((method as { materialIds?: string[] | null }).materialIds ?? []) as string[],
        costFurnizorPerM2: method.costFurnizorPerM2 ? Number(method.costFurnizorPerM2) : null,
        costFurnizorPerUnit: method.costFurnizorPerUnit ? Number(method.costFurnizorPerUnit) : null,
        markup: method.markup ? Number(method.markup) : null,
      };
    }

    if (selectedPrintMethod && !selectedPrintMethod.isOutsourced && !body.materialId) {
      return NextResponse.json({ error: 'Pentru metode interne, materialul implicit este obligatoriu' }, { status: 400 });
    }

    const pricePerM2 = parseNonNegative(body.pricePerM2);
    const pricePerUnit = parseNonNegative(body.pricePerUnit);
    const isOutsourced = selectedPrintMethod?.isOutsourced ?? body.isOutsourced;

    if (!isOutsourced) {
      if (body.saleUnit === 'M2' && pricePerM2 === null) {
        return NextResponse.json({ error: 'Pentru produse la m², pricePerM2 este obligatoriu' }, { status: 400 });
      }

      if (body.saleUnit === 'UNIT' && pricePerUnit === null) {
        return NextResponse.json({ error: 'Pentru produse la bucată, pricePerUnit este obligatoriu' }, { status: 400 });
      }

      if (hasOwnField(rawBody, 'supplierCost') || hasOwnField(rawBody, 'markup')) {
        return NextResponse.json({ error: 'Campurile supplierCost/markup sunt permise doar pentru outsource' }, { status: 400 });
      }
    }

    let finalPrice = 0;
    let supplierCost: number | null = null;
    let markupPercent: number | null = null;
    if (isOutsourced) {
      supplierCost = parseNonNegative(rawBody.supplierCost);
      markupPercent = parseNonNegative(rawBody.markup);

      if (supplierCost === null) {
        return NextResponse.json(
          { error: 'supplierCost este obligatoriu și trebuie să fie >= 0 pentru outsource' },
          { status: 400 }
        );
      }

      if (markupPercent === null) {
        return NextResponse.json(
          { error: 'markup este obligatoriu și trebuie să fie >= 0 pentru outsource' },
          { status: 400 }
        );
      }

      finalPrice = supplierCost + (supplierCost * markupPercent) / 100;
    } else {
      finalPrice = body.saleUnit === 'M2' ? Number(pricePerM2) : Number(pricePerUnit);
    }

    if (body.materialId) {
      const material = await prisma.material.findUnique({
        where: { id: body.materialId },
        select: { id: true, active: true },
      });

      if (!material || !material.active) {
        return NextResponse.json(
          { error: 'Materialul implicit selectat nu există sau este inactiv' },
          { status: 400 }
        );
      }

      if (
        selectedPrintMethod &&
        !selectedPrintMethod.isOutsourced &&
        selectedPrintMethod.materialIds.length > 0 &&
        !selectedPrintMethod.materialIds.includes(body.materialId)
      ) {
        return NextResponse.json(
          { error: 'Materialul implicit nu este compatibil cu metoda de print selectată' },
          { status: 400 }
        );
      }
    }

    const prismaData: Record<string, unknown> = {
      name: body.name,
      slug: body.slug,
      sku: body.sku || null,
      description: body.description || null,
      descriptionShort: body.descriptionShort || null,
      active: Boolean(body.active),
      categoryId: body.categoryId || null,
      type: body.type || null,
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
            basePrice: Number(body.pricing.basePrice) || Number(body.price) || 0,
            type: body.pricing.type || 'fixed',
            priceBreaks: body.pricing.priceBreaks || [],
            supplierCost: body.pricing.supplierCost ?? null,
            markup: body.pricing.markup ?? null,
          }
        : undefined,
      price: Number(body.price) || (body.pricing ? Number(body.pricing.basePrice) || 0 : 0),
      saleUnit: body.saleUnit || (body as CreateFullProductInput & { salesUnit?: string }).salesUnit || 'UNIT',
      minOrderQty: Number(body.minOrderQty || (body as CreateFullProductInput & { minQuantity?: number }).minQuantity) || 1,
      pricePerUnit: Number(body.pricePerUnit) || Number(body.price) || null,
      pricePerM2: body.pricePerM2 ?? null,
      metaTitle: body.seo?.metaTitle ?? body.metaTitle ?? null,
      metaDescription: body.seo?.metaDescription ?? body.metaDescription ?? null,
      ogImage: body.seo?.ogImage ?? body.ogImage ?? null,
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
      options: Array.isArray(body.options) && body.options.length > 0
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
      compatibleMaterials: Array.isArray(body.compatibleMaterials) && body.compatibleMaterials.length > 0
        ? {
            connect: body.compatibleMaterials.map((id) => ({ id })),
          }
        : undefined,
      compatiblePrintMethods: Array.isArray(body.compatiblePrintMethods) && body.compatiblePrintMethods.length > 0
        ? {
            connect: body.compatiblePrintMethods.map((id) => ({ id })),
          }
        : undefined,
      compatibleFinishing: Array.isArray(body.compatibleFinishing) && body.compatibleFinishing.length > 0
        ? {
            connect: body.compatibleFinishing.map((id) => ({ id })),
          }
        : undefined,
      images: Array.isArray(body.images) ? body.images.filter(Boolean) : undefined,
      printMethodId: body.printMethodId ?? body.defaultPrintMethod ?? undefined,
      materialId: body.materialId ?? null,
    };

    prismaData.pricing = normalizePricing(prismaData.pricing, prismaData.price);
    const cleanedPrismaData = removeUndefined(prismaData) as Prisma.ProductUncheckedCreateInput;

    const product = await prisma.product.create({
      data: cleanedPrismaData,
    });

    const images = normalizeImages(body.images);

    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url) => ({ productId: product.id, url })),
      });
    }

    if (body.compatibleMaterials?.length) {
      await prisma.productMaterial.createMany({
        data: body.compatibleMaterials.map((materialId) => ({
          productId: product.id,
          materialId,
        })),
        skipDuplicates: true,
      });
    }

    if (body.compatiblePrintMethods?.length) {
      await prisma.productPrintMethod.createMany({
        data: body.compatiblePrintMethods.map((printMethodId) => ({
          productId: product.id,
          printMethodId,
        })),
        skipDuplicates: true,
      });
    }

    if (body.compatibleFinishing?.length) {
      await prisma.productFinishing.createMany({
        data: body.compatibleFinishing.map((finishingId) => ({
          productId: product.id,
          finishingId,
        })),
        skipDuplicates: true,
      });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true,
        materials: true,
        printMethods: true,
        finishing: true,
      },
    });

    return NextResponse.json(serializeFullProduct(fullProduct), { status: 201 });
  } catch (error) {
    console.error('Error creating full product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
