import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';
import {
  addCartMemoryItem,
  clearCartMemory,
  getCartMemory,
  removeCartMemoryItem,
} from '@/lib/inMemoryCart';

export const dynamic = 'force-dynamic';

// ── helpers ──────────────────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

async function getDbCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    qty: item.qty,
    price: Number(item.price),
    name: item.name ?? undefined,
  }));
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET() {
  const userId = await getUserId();
  if (userId) {
    const cart = await getDbCart(userId);
    return NextResponse.json({ cart });
  }
  return NextResponse.json({ cart: getCartMemory() });
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productId = String(body?.productId ?? 'product-unknown');
    const qty = Math.max(1, Number(body?.qty ?? 1) || 1);
    const price = Number.isFinite(Number(body?.price)) ? Number(body.price) : 0;
    const name = typeof body?.name === 'string' ? body.name : undefined;

    const userId = await getUserId();

    if (userId) {
      // Upsert: increment qty if product already in cart, otherwise create
      const existing = await prisma.cartItem.findUnique({
        where: { userId_productId: { userId, productId } },
      });

      let item;
      if (existing) {
        item = await prisma.cartItem.update({
          where: { userId_productId: { userId, productId } },
          data: { qty: existing.qty + qty, price, name },
        });
      } else {
        item = await prisma.cartItem.create({
          data: { userId, productId, qty, price, name },
        });
      }

      const cart = await getDbCart(userId);
      const cartLine = { id: item.id, productId: item.productId, qty: item.qty, price: Number(item.price), name: item.name ?? undefined };
      return NextResponse.json({ success: true, item: cartLine, cart }, { status: 201 });
    }

    // Fallback: in-memory for guests
    const item = addCartMemoryItem({ productId, qty, price, name });
    return NextResponse.json({ success: true, item, cart: getCartMemory() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid cart payload' }, { status: 400 });
  }
}

// ── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = await getUserId();

    if (userId) {
      if (body?.clearAll || !body?.productId) {
        await prisma.cartItem.deleteMany({ where: { userId } });
      } else {
        await prisma.cartItem.deleteMany({
          where: { userId, productId: String(body.productId) },
        });
      }
      const cart = await getDbCart(userId);
      return NextResponse.json({ success: true, cart });
    }

    // Guest fallback
    if (body?.clearAll) {
      return NextResponse.json({ success: true, cart: clearCartMemory() });
    }
    if (body?.productId) {
      return NextResponse.json({ success: true, cart: removeCartMemoryItem(String(body.productId)) });
    }
    return NextResponse.json({ success: true, cart: clearCartMemory() });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid delete payload' }, { status: 400 });
  }
}
