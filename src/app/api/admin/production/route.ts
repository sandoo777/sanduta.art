import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/admin/production - List production jobs with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER", "OPERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedToId = searchParams.get("assignedToId");
    const orderId = searchParams.get("orderId");

    // Build filter object
    const where: any = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (orderId) where.orderId = orderId;

    const jobs = await prisma.productionJob.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            totalPrice: true,
            status: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ jobs });
  } catch (_error) {
    console.error("Error fetching production jobs:", _error);
    return NextResponse.json(
      { error: "Failed to fetch production jobs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/production - Create production job
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER", "OPERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, name, priority, dueDate, notes, assignedToId } = body;

    // Validations
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If assignedToId is provided, validate user exists and has correct role
    if (assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedToId },
      });

      if (!user) {
        return NextResponse.json({ error: "Assigned user not found" }, { status: 404 });
      }

      if (!["MANAGER", "OPERATOR"].includes(user.role)) {
        return NextResponse.json(
          { error: "Assigned user must be MANAGER or OPERATOR" },
          { status: 400 }
        );
      }
    }

    // Validate priority if provided
    const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    // Create production job
    const job = await prisma.productionJob.create({
      data: {
        orderId,
        name: name.trim(),
        priority: priority || "NORMAL",
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes?.trim() || null,
        assignedToId: assignedToId || null,
        status: "PENDING",
      },
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            totalPrice: true,
            status: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (_error) {
    console.error("Error creating production job:", error);
    return NextResponse.json(
      { error: "Failed to create production job" },
      { status: 500 }
    );
  }
}
