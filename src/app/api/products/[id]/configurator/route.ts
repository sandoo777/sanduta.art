import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';
import { mapProductToConfigurator } from '@/lib/products/mapProductToConfigurator';

const TAG = 'API:Products:Configurator';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;
    if (!identifier) {
      return createErrorResponse('ID-ul produsului este obligatoriu', 400);
    }

    const product = await prisma.product.findFirst({
      where: {
        active: true,
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        images: true,
        materials: {
          include: {
            material: true,
          },
        },
        printMethods: {
          include: {
            printMethod: true,
          },
        },
        finishing: {
          include: {
            finishing: true,
          },
        },
      },
    });

    if (!product) {
      return createErrorResponse('Produsul nu a fost găsit sau nu este activ', 404);
    }

    if (!product.pricing) {
      return createErrorResponse('Produsul nu are configurarea de preț necesară pentru configurator', 422);
    }

    const configuratorProduct = mapProductToConfigurator(product);
    logger.info(TAG, 'Configurator payload ready', { productId: product.id });

    const response = NextResponse.json(configuratorProduct);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
    return response;
  } catch (error) {
    logApiError(TAG, error, { productId: params.id });
    return createErrorResponse(
      'Nu am reușit să încărcăm datele necesare pentru configurator',
      500
    );
  }
}
