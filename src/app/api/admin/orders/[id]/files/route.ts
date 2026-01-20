import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/orders/[id]/files
 * Add a file to order
 *
 * Body:
 * {
 *   url: string,
 *   name: string
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { url, name } = body;

    // Validations
    if (!url || !name) {
      return NextResponse.json(
        { error: "URL and name are required" },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Create file
    const file = await prisma.orderFile.create({
      data: {
        orderId: id,
        url,
        name,
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch (_error) {
    console.error("Error adding file:", error);
    return NextResponse.json(
      { error: "Failed to add file" },
      { status: 500 }
    );
  }
}
