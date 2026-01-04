import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@/lib/types-prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categoryRef: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, slug, description, category, categoryId, price, stock, image_url, images, status, options } = await request.json();

    if (price !== undefined && price < 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    // Check if slug already exists (excluding current product)
    if (slug) {
      const existing = await prisma.product.findFirst({
        where: {
          AND: [
            { slug },
            { id: { not: id } },
          ],
        },
      });
      if (existing) {
        return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: { 
        ...(name && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(categoryId !== undefined && { categoryId }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(image_url !== undefined && { image_url }),
        ...(images !== undefined && { images }),
        ...(status && { status }),
        ...(options !== undefined && { options }),
      },
      include: {
        categoryRef: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}