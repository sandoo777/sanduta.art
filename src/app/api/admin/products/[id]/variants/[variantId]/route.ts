import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/admin/products/[id]/variants/[variantId]
 * Update a variant
 * 
 * Body can include:
 * {
 *   name?: string,
 *   price?: number,
 *   stock?: number
 * }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; variantId: string } }
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
    const { name, price, stock } = body;

    // Validations
    if (price !== undefined && price < 0) {
      return NextResponse.json(
        { error: "Price must be non-negative" },
        { status: 400 }
      );
    }

    if (stock !== undefined && stock < 0) {
      return NextResponse.json(
        { error: "Stock must be non-negative" },
        { status: 400 }
      );
    }

    // Check if variant exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: params.variantId },
    });

    if (!existingVariant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    // Verify variant belongs to the product
    if (existingVariant.productId !== params.id) {
      return NextResponse.json(
        { error: "Variant does not belong to this product" },
        { status: 400 }
      );
    }

    // Update variant
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;

    const variant = await prisma.productVariant.update({
      where: { id: params.variantId },
      data: updateData,
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Error updating variant:", error);
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]/variants/[variantId]
 * Delete a variant
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: params.variantId },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    // Verify variant belongs to the product
    if (variant.productId !== params.id) {
      return NextResponse.json(
        { error: "Variant does not belong to this product" },
        { status: 400 }
      );
    }

    // Delete variant
    await prisma.productVariant.delete({
      where: { id: params.variantId },
    });

    return NextResponse.json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
