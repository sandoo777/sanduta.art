import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@/lib/types-prisma";
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info('API:Admin:Products', 'Fetching all products');
    
    const products = await prisma.product.findMany({
      include: {
        categoryRef: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    logger.info('API:Admin:Products', `Fetched ${products.length} products`);
    
    return NextResponse.json(products);
  } catch (error) {
    logApiError('API:Admin:Products', error, { action: 'fetch_products' });
    return createErrorResponse('Failed to fetch products', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, description, category, categoryId, price, stock, image_url, images, status, options } = await request.json();

    if (!name || (!category && !categoryId) || price === undefined) {
      logger.warn('API:Admin:Products', 'Missing required fields', { hasName: !!name, hasCategory: !!(category || categoryId), hasPrice: price !== undefined });
      return createErrorResponse('Name, category, and price are required', 400);
    }

    if (price < 0) {
      return createErrorResponse('Price must be a positive number', 400);
    }

    // Generate slug from name if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Check if slug already exists
    if (finalSlug) {
      const existing = await prisma.product.findUnique({
        where: { slug: finalSlug },
      });
      if (existing) {
        return createErrorResponse('Product with this slug already exists', 400);
      }
    }

    logger.info('API:Admin:Products', 'Creating new product', { name, category: category || categoryId, price });

    const product = await prisma.product.create({
      data: { 
        name, 
        slug: finalSlug,
        description,
        category: category || 'Uncategorized', 
        categoryId,
        price, 
        stock: stock || 0,
        image_url, 
        images: images || [],
        status: status || 'ACTIVE',
        options 
      },
      include: {
        categoryRef: true,
      },
    });

    logger.info('API:Admin:Products', 'Product created successfully', { productId: product.id, name: product.name });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logApiError('API:Admin:Products', error, { action: 'create_product' });
    return createErrorResponse('Failed to create product', 500);
  }
}