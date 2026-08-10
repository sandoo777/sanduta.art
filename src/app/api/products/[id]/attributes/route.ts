import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** GET /api/products/[id]/attributes — public, no auth required */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify product is active
  const product = await prisma.product.findFirst({
    where: { id, active: true },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: 'Produs negăsit' }, { status: 404 });
  }

  const attributes = await prisma.productAttribute.findMany({
    where: { productId: id },
    include: {
      options: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          label: true,
          value: true,
          description: true,
          priceModifier: true,
          priceModifierType: true,
          isDefault: true,
          sortOrder: true,
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json(attributes, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}
