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

    const body = (await req.json()) as Partial<CreateFullProductInput>;
  console.log('---ADMIN PRODUCTS REQUEST START---');
  console.log('URL:', req.url ?? '/api/admin/products/[id]/full');
  console.log('METHOD:', req.method ?? 'PATCH');
  console.log('HEADERS:', JSON.stringify(req.headers ?? {}, null, 2));
  console.log('BODY:', JSON.stringify(body, null, 2));
  console.log('---ADMIN PRODUCTS REQUEST END---');
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
      nextFinalPrice = effectiveSaleUnit === 'M2' ? Number(nextPricePerM2) : Number(nextPricePerUnit);
      nextSupplierCost = null;
      nextMarkup = null;
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.slug !== undefined) updateData.slug = body.slug.trim();
    if (body.sku !== undefined) updateData.sku = body.sku?.trim() || null;
    if (body.description !== undefined)
      updateData.description = body.description?.trim() || null;
    if (body.descriptionShort !== undefined)
      updateData.descriptionShort = body.descriptionShort?.trim() || null;
    if (body.type !== undefined) updateData.type = body.type;
    if (nextSaleUnit !== undefined) updateData.saleUnit = nextSaleUnit;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.active !== undefined) updateData.active = body.active;
    if (nextIsOutsourced) {
      updateData.pricePerM2 = null;
      updateData.pricePerUnit = null;
      updateData.materialId = null;
    } else {
      if (body.pricePerM2 !== undefined) updateData.pricePerM2 = body.pricePerM2;
      if (body.pricePerUnit !== undefined) updateData.pricePerUnit = body.pricePerUnit;
    }
    if (body.minOrderQty !== undefined) updateData.minOrderQty = body.minOrderQty;
    if (body.printMethodId !== undefined) updateData.printMethodId = nextPrintMethodId;
    if (body.materialId !== undefined) {
      updateData.materialId = nextIsOutsourced ? null : nextMaterialId;
    }
    if (body.printMethodId !== undefined && nextIsOutsourced) {
      updateData.materialId = null;
    }
    if (nextIsOutsourced !== undefined) updateData.isOutsourced = nextIsOutsourced;
    if (body.pricing !== undefined) {
      updateData.price = nextFinalPrice ?? body.pricing?.basePrice ?? 0;
    } else if (nextFinalPrice !== undefined) {
      updateData.price = nextFinalPrice;
    }

    if (body.pricing !== undefined) {
      updateData.pricing = toInputJsonValue({
        ...body.pricing,
        basePrice: nextFinalPrice ?? body.pricing?.basePrice ?? 0,
        supplierCost: nextSupplierCost,
        markup: nextMarkup,
      });
    } else if (nextFinalPrice !== undefined || hasOwnField(rawBody, 'supplierCost') || hasOwnField(rawBody, 'markup')) {
      updateData.pricing = toInputJsonValue({
        ...(existingPricing ?? {}),
        basePrice: nextFinalPrice ?? Number(existingPricing?.basePrice ?? product.pricePerUnit ?? product.pricePerM2 ?? 0),
        supplierCost: nextSupplierCost,
        markup: nextMarkup,
      });
    }
    if (body.options !== undefined) updateData.options = toInputJsonValue(body.options ?? []);
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions ? toInputJsonValue(body.dimensions) : Prisma.JsonNull;
    if (body.production !== undefined) updateData.production = body.production ? toInputJsonValue(body.production) : Prisma.JsonNull;
    if (body.seo !== undefined) {
      updateData.metaTitle = body.seo?.metaTitle?.trim() || null;
      updateData.metaDescription = body.seo?.metaDescription?.trim() || null;
      updateData.ogImage = body.seo?.ogImage?.trim() || null;
    }

    console.log('---ADMIN PRODUCTS UPDATE DATA START---');
    console.log('UPDATE_DATA:', JSON.stringify(updateData, null, 2));
    console.log('---ADMIN PRODUCTS UPDATE DATA END---');

    await prisma.product.update({
      where: { id },
      data: updateData as Prisma.ProductUncheckedUpdateInput,
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
