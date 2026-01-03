import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('API:Admin:Products', 'Fetching all products');
    
    const products = await prisma.product.findMany();
    
    logger.info('API:Admin:Products', `Fetched ${products.length} products`);
    
    return NextResponse.json(products);
  } catch (error) {
    logApiError('API:Admin:Products', error, { action: 'fetch_products' });
    return createErrorResponse('Failed to fetch products', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, category, price, image_url, options } = await request.json();

    if (!name || !category || price === undefined) {
      logger.warn('API:Admin:Products', 'Missing required fields', { hasName: !!name, hasCategory: !!category, hasPrice: price !== undefined });
      return createErrorResponse('Name, category, and price are required', 400);
    }

    logger.info('API:Admin:Products', 'Creating new product', { name, category, price });

    const product = await prisma.product.create({
      data: { name, category, price, image_url, options },
    });

    logger.info('API:Admin:Products', 'Product created successfully', { productId: product.id, name: product.name });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logApiError('API:Admin:Products', error, { action: 'create_product' });
    return createErrorResponse('Failed to create product', 500);
  }
}