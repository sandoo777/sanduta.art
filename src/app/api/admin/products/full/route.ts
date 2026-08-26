import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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

    const body = (await req.json()) as CreateFullProductInput;
    const rawBody = body as unknown as Record<string, unknown>;
    const validationErrors = validatePayload(body);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validationErrors },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.product.findUnique({
      where: { slug: body.slug },
      select: { id: true },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug-ul există deja pentru un alt produs' },
        { status: 400 }
      );
    }

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

    let selectedPrintMethod: {
      id: string;
      isOutsourced: boolean;
      materialIds: string[];
      costFurnizorPerM2: number | null;
      costFurnizorPerUnit: number | null;
      markup: number | null;
    } | null = null;
    if (body.printMethodId) {
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
        return NextResponse.json(
          { error: 'Metoda de print selectată nu există sau este inactivă' },
          { status: 400 }
        );
      }

      selectedPrintMethod = {
        id: method.id,
        isOutsourced: method.isOutsourced,
        materialIds: method.materialIds,
        costFurnizorPerM2: method.costFurnizorPerM2 ? Number(method.costFurnizorPerM2) : null,
        costFurnizorPerUnit: method.costFurnizorPerUnit ? Number(method.costFurnizorPerUnit) : null,
        markup: method.markup ? Number(method.markup) : null,
      };
    }

    if (selectedPrintMethod && !selectedPrintMethod.isOutsourced && !body.materialId) {
      return NextResponse.json(
        { error: 'Pentru metode interne, materialul implicit este obligatoriu' },
        { status: 400 }
      );
    }

    const pricePerM2 = parseNonNegative(body.pricePerM2);
    const pricePerUnit = parseNonNegative(body.pricePerUnit);
    const isOutsourced = selectedPrintMethod?.isOutsourced ?? body.isOutsourced;

    if (!isOutsourced) {
      if (body.saleUnit === 'M2' && pricePerM2 === null) {
        return NextResponse.json(
          { error: 'Pentru produse la m², pricePerM2 este obligatoriu' },
          { status: 400 }
        );
      }

      if (body.saleUnit === 'UNIT' && pricePerUnit === null) {
        return NextResponse.json(
          { error: 'Pentru produse la bucată, pricePerUnit este obligatoriu' },
          { status: 400 }
        );
      }

      if (hasOwnField(rawBody, 'supplierCost') || hasOwnField(rawBody, 'markup')) {
        return NextResponse.json(
          { error: 'Campurile supplierCost/markup sunt permise doar pentru outsource' },
          { status: 400 }
        );
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

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        slug: body.slug.trim(),
        sku: body.sku?.trim() || null,
        description: body.description?.trim() || null,
        descriptionShort: body.descriptionShort?.trim() || null,
        type: body.type,
        saleUnit: body.saleUnit,
        price: finalPrice,
        pricePerM2: isOutsourced ? null : (pricePerM2 ?? null),
        pricePerUnit: isOutsourced ? null : (pricePerUnit ?? null),
        minOrderQty: body.minOrderQty,
        isOutsourced,
        categoryId: body.categoryId,
        printMethodId: body.printMethodId || null,
        materialId: isOutsourced ? null : (body.materialId || null),
        active: body.active,
        options: body.options && body.options.length > 0 ? body.options : [],
        dimensions: body.dimensions ?? null,
        pricing: {
          ...body.pricing,
          basePrice: finalPrice,
          ...(isOutsourced
            ? {
                supplierCost,
                markup: markupPercent,
              }
            : {
                supplierCost: null,
                markup: null,
              }),
        },
        production: body.production ?? null,
        metaTitle: body.seo?.metaTitle?.trim() || null,
        metaDescription: body.seo?.metaDescription?.trim() || null,
        ogImage: body.seo?.ogImage?.trim() || null,
      },
    });

    const images = normalizeImages(body.images);
    const relationOperations: Promise<unknown>[] = [];

    if (images.length > 0) {
      relationOperations.push(
        prisma.productImage.createMany({
          data: images.map((url) => ({ productId: product.id, url })),
        })
      );
    }

    if (body.compatibleMaterials?.length) {
      relationOperations.push(
        prisma.productMaterial.createMany({
          data: body.compatibleMaterials.map((materialId) => ({
            productId: product.id,
            materialId,
          })),
          skipDuplicates: true,
        })
      );
    }

    if (body.compatiblePrintMethods?.length) {
      relationOperations.push(
        prisma.productPrintMethod.createMany({
          data: body.compatiblePrintMethods.map((printMethodId) => ({
            productId: product.id,
            printMethodId,
          })),
          skipDuplicates: true,
        })
      );
    }

    if (body.compatibleFinishing?.length) {
      relationOperations.push(
        prisma.productFinishing.createMany({
          data: body.compatibleFinishing.map((finishingId) => ({
            productId: product.id,
            finishingId,
          })),
          skipDuplicates: true,
        })
      );
    }

    if (relationOperations.length > 0) {
      await prisma.$transaction(relationOperations);
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
