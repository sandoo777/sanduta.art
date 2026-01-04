import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Props {
  params: Promise<{ id: string }>;
}

// GET /api/admin/production/[id] - Get single production job
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER", "OPERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.productionJob.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Production job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching production job:", error);
    return NextResponse.json(
      { error: "Failed to fetch production job" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/production/[id] - Update production job
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER", "OPERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, status, priority, dueDate, notes, assignedToId } = body;

    // Check if job exists
    const existingJob = await prisma.productionJob.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Production job not found" }, { status: 404 });
    }

    // Validate status if provided
    const validStatuses = ["PENDING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Validate priority if provided
    const validPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    // If assignedToId is being changed, validate user
    if (assignedToId !== undefined) {
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
    }

    // Build update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;

    // Handle status transitions
    if (status) {
      // If transitioning to IN_PROGRESS and startedAt is not set
      if (status === "IN_PROGRESS" && !existingJob.startedAt) {
        updateData.startedAt = new Date();
      }

      // If transitioning to COMPLETED and completedAt is not set
      if (status === "COMPLETED" && !existingJob.completedAt) {
        updateData.completedAt = new Date();
      }

      // If moving away from COMPLETED, clear completedAt
      if (status !== "COMPLETED" && existingJob.status === "COMPLETED") {
        updateData.completedAt = null;
      }
    }

    // Update job
    const updatedJob = await prisma.productionJob.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Error updating production job:", error);
    return NextResponse.json(
      { error: "Failed to update production job" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/production/[id] - Delete production job
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER", "OPERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if job exists
    const job = await prisma.productionJob.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json({ error: "Production job not found" }, { status: 404 });
    }

    // Check if job can be deleted (not IN_PROGRESS or COMPLETED)
    if (job.status === "IN_PROGRESS" || job.status === "COMPLETED") {
      return NextResponse.json(
        { error: `Cannot delete job with status ${job.status}` },
        { status: 400 }
      );
    }

    // Delete job
    await prisma.productionJob.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Production job deleted successfully" });
  } catch (error) {
    console.error("Error deleting production job:", error);
    return NextResponse.json(
      { error: "Failed to delete production job" },
      { status: 500 }
    );
  }
}
