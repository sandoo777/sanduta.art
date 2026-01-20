import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (_error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { 
      name, 
      slug, 
      description, 
      image, 
      color, 
      icon, 
      parentId, 
      order, 
      active, 
      featured,
      metaTitle,
      metaDescription 
    } = await request.json();

    // Check if slug already exists (excluding current category)
    if (slug) {
      const existing = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { slug },
          ],
        },
      });

      if (existing) {
        return NextResponse.json({ 
          error: "Category slug already exists" 
        }, { status: 400 });
      }
    }

    // Prevent category from being its own parent
    if (parentId === id) {
      return NextResponse.json({ 
        error: "Category cannot be its own parent" 
      }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(parentId !== undefined && { parentId }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
        ...(featured !== undefined && { featured }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
      },
      include: {
        _count: {
          select: { products: true },
        },
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(category);
  } catch (_error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if category has associated products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category. It has ${category._count.products} associated product${category._count.products > 1 ? 's' : ''}. Please reassign or delete the products first.` 
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (_error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
