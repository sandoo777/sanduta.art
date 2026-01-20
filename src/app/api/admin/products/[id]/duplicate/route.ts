import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/products/[id]/duplicate
 * Duplicate a product with all its relations
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get original product with relations
    const originalProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
      },
    });

    if (!originalProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create duplicate
    const duplicate = await prisma.product.create({
      data: {
        name: `${originalProduct.name} (Copy)`,
        slug: `${originalProduct.slug}-copy-${Date.now()}`,
        sku: originalProduct.sku ? `${originalProduct.sku}-COPY` : null,
        description: originalProduct.description,
        type: originalProduct.type,
        price: originalProduct.price,
        categoryId: originalProduct.categoryId,
        active: false, // Start as inactive
        images: {
          create: originalProduct.images.map((img) => ({
            url: img.url,
          })),
        },
        variants: {
          create: originalProduct.variants.map((variant) => ({
            name: variant.name,
            price: variant.price,
            stock: 0, // Start with 0 stock
          })),
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(duplicate);
  } catch (_error) {
    console.error('Error duplicating product:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate product' },
      { status: 500 }
    );
  }
}
