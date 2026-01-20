import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { serializeFullProduct } from '../../full/utils';
import type { CreateFullProductInput } from '@/modules/products/productBuilder.types';

const ALLOWED_ROLES = new Set(['ADMIN', 'MANAGER']);

function normalizeImages(images?: string[]) {
  if (!images) {
    return null;
  }

  const filtered = images
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url && url.length > 0));

  return filtered;
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

    return NextResponse.json(serializeFullProduct(product));
  } catch (_error) {
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
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true },
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

    const updateData: Prisma.ProductUpdateInput = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.slug !== undefined) updateData.slug = body.slug.trim();
    if (body.sku !== undefined) updateData.sku = body.sku?.trim() || null;
    if (body.description !== undefined)
      updateData.description = body.description?.trim() || null;
    if (body.descriptionShort !== undefined)
      updateData.descriptionShort = body.descriptionShort?.trim() || null;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.pricing !== undefined) {
      updateData.pricing = body.pricing;
      updateData.price = body.pricing?.basePrice ?? 0;
    }
    if (body.options !== undefined) updateData.options = body.options ?? [];
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions ?? null;
    if (body.production !== undefined) updateData.production = body.production ?? null;
    if (body.seo !== undefined) {
      updateData.metaTitle = body.seo?.metaTitle?.trim() || null;
      updateData.metaDescription = body.seo?.metaDescription?.trim() || null;
      updateData.ogImage = body.seo?.ogImage?.trim() || null;
    }

    await prisma.product.update({
      where: { id },
      data: updateData,
    });

    const relationOperations: Promise<unknown>[] = [];

    if (body.compatibleMaterials) {
      relationOperations.push(prisma.productMaterial.deleteMany({ where: { productId: id } }));
      if (body.compatibleMaterials.length > 0) {
        relationOperations.push(
          prisma.productMaterial.createMany({
            data: body.compatibleMaterials.map((materialId) => ({ productId: id, materialId })),
            skipDuplicates: true,
          })
        );
      }
    }

    if (body.compatiblePrintMethods) {
      relationOperations.push(prisma.productPrintMethod.deleteMany({ where: { productId: id } }));
      if (body.compatiblePrintMethods.length > 0) {
        relationOperations.push(
          prisma.productPrintMethod.createMany({
            data: body.compatiblePrintMethods.map((printMethodId) => ({ productId: id, printMethodId })),
            skipDuplicates: true,
          })
        );
      }
    }

    if (body.compatibleFinishing) {
      relationOperations.push(prisma.productFinishing.deleteMany({ where: { productId: id } }));
      if (body.compatibleFinishing.length > 0) {
        relationOperations.push(
          prisma.productFinishing.createMany({
            data: body.compatibleFinishing.map((finishingId) => ({ productId: id, finishingId })),
            skipDuplicates: true,
          })
        );
      }
    }

    if (body.images) {
      const sanitizedImages = normalizeImages(body.images) ?? [];
      relationOperations.push(prisma.productImage.deleteMany({ where: { productId: id } }));
      if (sanitizedImages.length > 0) {
        relationOperations.push(
          prisma.productImage.createMany({
            data: sanitizedImages.map((url) => ({ productId: id, url })),
          })
        );
      }
    }

    if (relationOperations.length > 0) {
      await prisma.$transaction(relationOperations);
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

    return NextResponse.json(serializeFullProduct(updatedProduct));
  } catch (_error) {
    console.error('Error updating full product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
