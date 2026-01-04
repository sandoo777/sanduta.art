import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@/lib/types-prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { error: "Failed to fetch variant" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, value, priceAdjustment, stockAdjustment } = await request.json();

    // Check if variant exists
    const existing = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // If updating name or value, check for duplicate combination
    if (name || value) {
      const duplicate = await prisma.productVariant.findFirst({
        where: {
          AND: [
            { productId: existing.productId },
            { id: { not: id } },
            {
              name: name || existing.name,
              value: value || existing.value,
            },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Variant with this name and value already exists" },
          { status: 400 }
        );
      }
    }

    const variant = await prisma.productVariant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(value && { value }),
        ...(priceAdjustment !== undefined && { priceAdjustment }),
        ...(stockAdjustment !== undefined && { stockAdjustment }),
      },
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    await prisma.productVariant.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
