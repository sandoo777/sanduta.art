import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
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
      orderBy: [
        { order: 'asc' }, // Sortare după order custom
        { name: 'asc' },  // Apoi alfabetic
      ],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate slug from name if not provided
    // Remove diacritics for Romanian characters
    const finalSlug = slug || name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/ă/g, 'a')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    // Check if slug already exists (unique constraint)
    const existing = await prisma.category.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return NextResponse.json({ 
        error: "Category slug already exists" 
      }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        color: color || '#3B82F6',
        icon: icon || '📦',
        parentId: parentId || null,
        order: order ?? 0,
        active: active ?? true,
        featured: featured ?? false,
        metaTitle,
        metaDescription,
      },
      include: {
        _count: {
          select: { products: true },
        },
        parent: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
