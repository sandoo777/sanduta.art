import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";
import { UserRole } from "@prisma/client";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validateInput } from "@/lib/validation";
import { logAuditAction, AUDIT_ACTIONS } from "@/lib/audit-log";
import { z } from "zod";

interface Props {
  params: Promise<{ id: string }>;
}

const updateProductionJobSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
});

// GET /api/admin/production/[id] - Get single production job
export const GET = withRole(
  [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_GENERAL);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
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
);

// PATCH /api/admin/production/[id] - Update production job
export const PATCH = withRole(
  [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR],
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_STRICT);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { id } = await params;
      const body = await request.json();

      // Validate input
      const validation = await validateInput(updateProductionJobSchema, body);
      if (!validation.success) {
        return NextResponse.json({ errors: validation.errors }, { status: 400 });
      }

      const { name, status, priority, dueDate, notes, assignedToId } = validation.data;

      // Check if job exists and get old data for audit
      const existingJob = await prisma.productionJob.findUnique({
        where: { id },
        select: {
          status: true,
          priority: true,
          assignedToId: true,
          startedAt: true,
          completedAt: true,
        },
      });

      if (!existingJob) {
        return NextResponse.json({ error: "Production job not found" }, { status: 404 });
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

      // Audit log for status changes
      if (status && status !== existingJob.status) {
        await logAuditAction({
          userId: user.id,
          action: AUDIT_ACTIONS.PRODUCTION_STATUS_CHANGE,
          resourceType: 'production_job',
          resourceId: id,
          details: {
            oldStatus: existingJob.status,
            newStatus: status,
          },
        });
      }

      return NextResponse.json(updatedJob);
    } catch (error) {
      console.error("Error updating production job:", error);
      return NextResponse.json(
        { error: "Failed to update production job" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/production/[id] - Delete production job
export const DELETE = withRole(
  [UserRole.ADMIN, UserRole.MANAGER],
  async (request: NextRequest, { params, user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_STRICT);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { id } = await params;

      // Check if job exists
      const job = await prisma.productionJob.findUnique({
        where: { id },
        select: {
          status: true,
          name: true,
        },
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

      // Audit log
      await logAuditAction({
        userId: user.id,
        action: AUDIT_ACTIONS.PRODUCTION_DELETE,
        resourceType: 'production_job',
        resourceId: id,
        details: {
          name: job.name,
          status: job.status,
        },
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
);
