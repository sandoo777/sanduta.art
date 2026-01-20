import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    logger.info('API:Wishlist', 'Fetching wishlist', { userId: user.id });

    // Fetch user's wishlist
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: user.id
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      items: wishlistItems,
      count: wishlistItems.length
    });
  } catch (error) {
    logApiError('API:Wishlist', error);
    return createErrorResponse('Failed to fetch wishlist', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return createErrorResponse('Product ID is required', 400);
    }

    logger.info('API:Wishlist', 'Adding to wishlist', { userId: user.id, productId });

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId: user.id,
        productId
      }
    });

    if (existing) {
      return createErrorResponse('Product already in wishlist', 400);
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
    logApiError('API:Wishlist', error);
    return createErrorResponse('Failed to add to wishlist', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return createErrorResponse('Product ID is required', 400);
    }

    logger.info('API:Wishlist', 'Removing from wishlist', { userId: user.id, productId });

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError('API:Wishlist', error);
    return createErrorResponse('Failed to remove from wishlist', 500);
  }
}
