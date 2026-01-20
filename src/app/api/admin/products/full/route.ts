import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { serializeFullProduct } from './utils';
import type { CreateFullProductInput } from '@/modules/products/productBuilder.types';

const ALLOWED_ROLES = new Set(['ADMIN', 'MANAGER']);

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

  return errors;
}

export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !ALLOWED_ROLES.has(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as CreateFullProductInput;
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

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        slug: body.slug.trim(),
        sku: body.sku?.trim() || null,
        description: body.description?.trim() || null,
        descriptionShort: body.descriptionShort?.trim() || null,
        type: body.type,
        price: body.pricing.basePrice ?? 0,
        categoryId: body.categoryId,
        active: body.active,
        options: body.options && body.options.length > 0 ? body.options : [],
        dimensions: body.dimensions ?? null,
        pricing: body.pricing,
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
