import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";

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
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid JSON body" 
      }, { status: 400 });
    }
    
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
    } = body;
    
    // Validate that at least one field is provided
    if (!name && !slug && !description && image === undefined && !color && !icon && 
        parentId === undefined && order === undefined && active === undefined && 
        featured === undefined && !metaTitle && !metaDescription) {
      return NextResponse.json({ 
        error: "At least one field must be provided for update" 
      }, { status: 400 });
    }

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
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
    
    if (!existingCategory) {
      return NextResponse.json({ 
        error: "Category not found" 
      }, { status: 404 });
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
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    // Check for Prisma-specific errors
    if (error?.code === 'P2025') {
      return NextResponse.json({ 
        error: "Category not found" 
      }, { status: 404 });
    }
    
    if (error?.code === 'P2002') {
      return NextResponse.json({ 
        error: "Category with this slug already exists" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to update category",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
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
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
