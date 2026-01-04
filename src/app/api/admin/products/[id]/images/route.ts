import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/products/[id]/images
 * Add a new image to a product
 * 
 * Body:
 * {
 *   url: string
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { url } = body;

    // Validations
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create image
    const image = await prisma.productImage.create({
      data: {
        productId: params.id,
        url,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Error creating image:", error);
    return NextResponse.json(
      { error: "Failed to create image" },
      { status: 500 }
    );
  }
}
