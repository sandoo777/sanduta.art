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

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    if (!name || !value) {
      return NextResponse.json(
        { error: "Name and value are required" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if variant combination already exists
    const existing = await prisma.productVariant.findUnique({
      where: {
        productId_name_value: {
          productId: id,
          name,
          value,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Variant with this name and value already exists" },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        name,
        value,
        priceAdjustment: priceAdjustment || 0,
        stockAdjustment: stockAdjustment || 0,
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}
