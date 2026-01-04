import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/admin/products/[id]/images/[imageId]
 * Delete an image from a product
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if image exists
    const image = await prisma.productImage.findUnique({
      where: { id: params.imageId },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Verify image belongs to the product
    if (image.productId !== params.id) {
      return NextResponse.json(
        { error: "Image does not belong to this product" },
        { status: 400 }
      );
    }

    // Delete image
    await prisma.productImage.delete({
      where: { id: params.imageId },
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
