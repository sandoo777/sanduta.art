import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";
import { UserRole, OrderStatus, PaymentStatus } from "@prisma/client";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validateInput } from "@/lib/validation";
import { logAuditAction, AUDIT_ACTIONS } from "@/lib/audit-log";
import { z } from "zod";

function normalizeOutsourceJob<T>(job: T): T {
  const candidate = job as T & {
    printMethod?: { isOutsourced?: boolean | null; markup?: unknown } | null;
    outsourcedCost?: number | string | null;
    outsourcedProfit?: number | string | null;
    estimatedCost?: number | string | null;
  };

  if (!candidate?.printMethod?.isOutsourced) {
    return {
      ...job,
      estimatedCost: Number(candidate.estimatedCost ?? 0),
    };
  }

  const supplierCost = Number(candidate.outsourcedCost ?? 0);
  const storedProfit = Number(candidate.outsourcedProfit ?? 0);
  const markupPercent = Number(candidate.printMethod?.markup ?? 0);
  const normalizedProfit = storedProfit > 0 ? storedProfit : supplierCost * (markupPercent / 100);

  return {
    ...job,
    estimatedCost: supplierCost,
    outsourcedProfit: normalizedProfit,
  };
}

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  dueDate: z.string().optional().nullable(),
  assignedToUserId: z.string().optional().nullable(),
});

/**
 * GET /api/admin/orders/[id]
 * Get a single order by ID
 */
export const GET = withRole(
  [UserRole.ADMIN, UserRole.MANAGER],
  async (request: NextRequest, { params }) => {
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

      const order = await prisma.order.findUnique({
        where: { id: id },
        include: {
          customer: true,
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  printMethodId: true,
                  materialId: true,
                  isOutsourced: true,
                  saleUnit: true,
                  pricePerM2: true,
                  pricePerUnit: true,
                  minOrderQty: true,
                  pricing: true,
                },
              },
            },
          },
          files: true,
          productionJobs: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  saleUnit: true,
                },
              },
              printMethod: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  isOutsourced: true,
                  termenFurnizor: true,
                  markup: true,
                },
              },
              machine: {
                select: { id: true, name: true, type: true, equipmentType: true, status: true },
              },
              material: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                },
              },
              assignedTo: {
                select: { id: true, name: true },
              },
              materialUsages: {
                select: {
                  id: true,
                  quantity: true,
                  unit: true,
                  wastePercent: true,
                  totalUsed: true,
                  cost: true,
                  createdAt: true,
                  material: {
                    select: {
                      id: true,
                      name: true,
                      category: { select: { id: true, name: true } },
                      pricePerSqm: true,
                      pricePerMeter: true,
                      pricePerUnit: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              orderItems: true,
              files: true,
              productionJobs: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ...order,
        productionJobs: (order.productionJobs ?? []).map((job) => normalizeOutsourceJob(job)),
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/admin/orders/[id]
 * Update order (status, paymentStatus, dueDate, assignedToUser)
 */
export const PATCH = withRole(
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
      const body = await request.json();

      // Validate input
      const validation = await validateInput(updateOrderSchema, body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Date invalide", details: validation.errors },
          { status: 400 }
        );
      }

      const { status, paymentStatus, dueDate, assignedToUserId } = validation.data;

      // Check if order exists and get old data for audit
      const existingOrder = await prisma.order.findUnique({
        where: { id: id },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          assignedToUserId: true,
          customerName: true,
          totalPrice: true,
        },
      });

      if (!existingOrder) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Validate assignedToUser if provided
      if (assignedToUserId) {
        const assignedUser = await prisma.user.findUnique({
          where: { id: assignedToUserId },
        });

        if (!assignedUser) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 400 }
          );
        }
      }

      // Update order (with machine freeing on DELIVERED/CANCELLED)
      const updateData: {
        status?: OrderStatus;
        paymentStatus?: PaymentStatus;
        dueDate?: Date | null;
        assignedToUserId?: string | null;
      } = {};
      if (status !== undefined) updateData.status = status;
      if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (assignedToUserId !== undefined) updateData.assignedToUserId = assignedToUserId || null;

      const isTerminalStatus =
        status === 'DELIVERED' || status === 'CANCELLED';

      const order = await prisma.$transaction(async (tx) => {
        // Free machines from active production jobs when order is finalized
        if (isTerminalStatus) {
          const activeJobs = await tx.productionJob.findMany({
            where: {
              orderId: id,
              status: { notIn: ['COMPLETED', 'CANCELED'] },
              machineId: { not: null },
            },
            select: { id: true, machineId: true },
          });

          for (const job of activeJobs) {
            if (job.machineId) {
              await tx.machine.update({
                where: { id: job.machineId },
                data: { status: 'AVAILABLE' },
              });
            }
            await tx.productionJob.update({
              where: { id: job.id },
              data: { status: status === 'DELIVERED' ? 'COMPLETED' : 'CANCELED' },
            });
          }
        }

        return tx.order.update({
          where: { id: id },
          data: updateData,
          include: {
            customer: true,
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
            orderItems: {
              include: {
                product: {
                  select: { id: true, name: true },
                },
              },
            },
            files: true,
            productionJobs: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    saleUnit: true,
                  },
                },
                printMethod: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    isOutsourced: true,
                    termenFurnizor: true,
                    markup: true,
                  },
                },
                machine: {
                  select: { id: true, name: true, type: true, equipmentType: true, status: true },
                },
                material: {
                  select: {
                    id: true,
                    name: true,
                    unit: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      });

      // Audit logging for important changes
      if (status && status !== existingOrder.status) {
        await logAuditAction({
          userId: user.id,
          action: AUDIT_ACTIONS.ORDER_STATUS_CHANGE,
          resourceType: 'order',
          resourceId: id,
          details: {
            oldStatus: existingOrder.status,
            newStatus: status,
            customerName: existingOrder.customerName,
            totalPrice: existingOrder.totalPrice,
          },
        });
      }

      if (assignedToUserId !== undefined && assignedToUserId !== existingOrder.assignedToUserId) {
        await logAuditAction({
          userId: user.id,
          action: AUDIT_ACTIONS.ORDER_ASSIGN,
          resourceType: 'order',
          resourceId: id,
          details: {
            oldAssignedTo: existingOrder.assignedToUserId,
            newAssignedTo: assignedToUserId,
            customerName: existingOrder.customerName,
          },
        });
      }

      return NextResponse.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/admin/orders/[id]
 * Delete order (only if status === "PENDING")
 */
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

      // Check if order exists
      const order = await prisma.order.findUnique({
        where: { id: id },
        select: {
          status: true,
          customerName: true,
          totalPrice: true,
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Check if order can be deleted (only PENDING status)
      if (order.status !== "PENDING") {
        return NextResponse.json(
          { error: `Cannot delete order with status ${order.status}. Only PENDING orders can be deleted.` },
          { status: 400 }
        );
      }

      // Delete order (cascade will delete items and files)
      await prisma.order.delete({
        where: { id: id },
      });

      // Audit log
      await logAuditAction({
        userId: user.id,
        action: AUDIT_ACTIONS.ORDER_DELETE,
        resourceType: 'order',
        resourceId: id,
        details: {
          customerName: order.customerName,
          totalPrice: order.totalPrice,
          status: order.status,
        },
      });

      return NextResponse.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      return NextResponse.json(
        { error: "Failed to delete order" },
        { status: 500 }
      );
    }
  }
);
