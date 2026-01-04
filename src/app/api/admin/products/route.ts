import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/products
 * List all products with relations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        variants: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create a new product
 * 
 * Body:
 * {
 *   name: string,
 *   slug: string,
 *   description?: string,
 *   price: number,
 *   categoryId: string,
 *   images?: string[],
 *   variants?: [{ name: string, price: number, stock: number }]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, slug, description, price, categoryId, images, variants } = body;

    // Validations
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: "Price must be non-negative" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    // Create product with relations
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: price,
        categoryId,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    // Add images if provided
    if (images && images.length > 0) {
      await Promise.all(
        images.map((url: string) =>
          prisma.productImage.create({
            data: { productId: product.id, url },
          })
        )
      );
    }

    // Add variants if provided
    if (variants && variants.length > 0) {
      await Promise.all(
        variants.map((v: any) =>
          prisma.productVariant.create({
            data: {
              productId: product.id,
              name: v.name,
              price: v.price,
              stock: v.stock,
            },
          })
        )
      );
    }

    // Fetch complete product with all relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(completeProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
