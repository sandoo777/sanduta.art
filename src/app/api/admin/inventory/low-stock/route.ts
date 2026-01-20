import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get('threshold') || '10');

    logger.info('API:Inventory', 'Fetching low stock', { userId: user.id, threshold });

    // Fetch products with low stock
    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: threshold
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy: {
        stock: 'asc'
      }
    });

    // Calculate additional metrics
    const enrichedProducts = products.map(product => {
      const outOfStock = product.stock === 0;
      const critical = product.stock > 0 && product.stock <= 5;
      const lowStock = product.stock > 5 && product.stock <= threshold;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        price: product.price,
        category: product.category,
        totalOrders: product._count.orderItems,
        status: outOfStock ? 'OUT_OF_STOCK' : critical ? 'CRITICAL' : 'LOW_STOCK',
        lastUpdated: product.updatedAt
      };
    });

    // Summary statistics
    const summary = {
      total: enrichedProducts.length,
      outOfStock: enrichedProducts.filter(p => p.status === 'OUT_OF_STOCK').length,
      critical: enrichedProducts.filter(p => p.status === 'CRITICAL').length,
      lowStock: enrichedProducts.filter(p => p.status === 'LOW_STOCK').length
    };

    return NextResponse.json({
      products: enrichedProducts,
      summary,
      threshold
    });
  } catch (error) {
    logApiError('API:Inventory', error);
    return createErrorResponse('Failed to fetch low stock products', 500);
  }
}
