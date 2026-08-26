import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import { clearCartMemory, getCartMemory } from '@/lib/inMemoryCart';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    // Gather cart items: DB for authenticated users, in-memory for guests
    let cartItems: { productId: string; qty: number; price: number; name?: string }[] = [];

    if (userId) {
      const dbItems = await prisma.cartItem.findMany({ where: { userId } });
      cartItems = dbItems.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        price: Number(item.price),
        name: item.name ?? undefined,
      }));
    } else {
      cartItems = getCartMemory().map((item) => ({
        productId: item.productId,
        qty: item.qty,
        price: item.price,
        name: item.name,
      }));
    }

    if (cartItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const orderNumber = `ORD-${Date.now()}`;

    // Resolve a real productId for each item — fall back to a placeholder if the
    // productId doesn't reference an actual product row (e.g. demo/custom items).
    const fallbackProduct = await prisma.product.findFirst({
      where: { active: true },
      select: { id: true },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: body?.customerName ?? session?.user?.name ?? 'Guest',
        customerEmail: body?.customerEmail ?? session?.user?.email ?? 'guest@sanduta.art',
        customerPhone: body?.customerPhone ?? null,
        userId,
        totalPrice,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: body?.paymentMethod ?? 'COD',
        deliveryAddress: body?.deliveryAddress ?? null,
        city: body?.city ?? null,
        orderItems: {
          create: await Promise.all(
            cartItems.map(async (item) => {
              // Try to find a real product; fallback to first active product
              const product = await prisma.product.findFirst({
                where: { id: item.productId, active: true },
                select: { id: true },
              });
              const resolvedProductId = product?.id ?? fallbackProduct?.id;
              if (!resolvedProductId) throw new Error('No product available for order item');
              return {
                productId: resolvedProductId,
                quantity: item.qty,
                unitPrice: item.price,
                lineTotal: item.price * item.qty,
                customDescription: item.name ?? null,
              };
            })
          ),
        },
      },
      select: { id: true, orderNumber: true },
    });

    // Clear cart after successful order
    if (userId) {
      await prisma.cartItem.deleteMany({ where: { userId } });
    } else {
      clearCartMemory();
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    }, { status: 201 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ success: false, error: 'Checkout failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
