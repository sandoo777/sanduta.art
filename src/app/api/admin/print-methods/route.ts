import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/print-methods - Get all print methods
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const printMethods = await prisma.printMethod.findMany({
      orderBy: { name: "asc" },
    });

    // Convert Decimal to number
    const formatted = printMethods.map((pm) => ({
      ...pm,
      costPerM2: pm.costPerM2 ? Number(pm.costPerM2) : null,
      costPerSheet: pm.costPerSheet ? Number(pm.costPerSheet) : null,
      createdAt: pm.createdAt.toISOString(),
      updatedAt: pm.updatedAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching print methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch print methods" },
      { status: 500 }
    );
  }
}

// POST /api/admin/print-methods - Create new print method
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      type,
      costPerM2,
      costPerSheet,
      speed,
      maxWidth,
      maxHeight,
      description,
      active = true,
      materialIds = [],
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!type || !type.trim()) {
      return NextResponse.json(
        { error: "Type is required" },
        { status: 400 }
      );
    }

    const printMethod = await prisma.printMethod.create({
      data: {
        name: name.trim(),
        type: type.trim(),
        costPerM2: costPerM2 ? Number(costPerM2) : null,
        costPerSheet: costPerSheet ? Number(costPerSheet) : null,
        speed: speed?.trim() || null,
        maxWidth: maxWidth ? Number(maxWidth) : null,
        maxHeight: maxHeight ? Number(maxHeight) : null,
        description: description?.trim() || null,
        active,
        materialIds,
      },
    });

    return NextResponse.json(
      {
        ...printMethod,
        costPerM2: printMethod.costPerM2 ? Number(printMethod.costPerM2) : null,
        costPerSheet: printMethod.costPerSheet ? Number(printMethod.costPerSheet) : null,
        createdAt: printMethod.createdAt.toISOString(),
        updatedAt: printMethod.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating print method:", error);
    return NextResponse.json(
      { error: "Failed to create print method" },
      { status: 500 }
    );
  }
}
