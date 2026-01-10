import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { ActivityType } from "@prisma/client";

/**
 * GET /api/admin/settings/audit-logs
 * Obține audit logs cu filtrare și paginare
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(["ADMIN", "MANAGER"]);
    if (error) return error;

    logger.info("API:Settings:AuditLogs", "Fetching audit logs", { userId: user.id });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") as ActivityType | null;
    const success = searchParams.get("success");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build filters
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (type) {
      where.type = type;
    }

    if (success !== null) {
      where.success = success === "true";
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.securityActivity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.securityActivity.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logApiError("API:Settings:AuditLogs", err);
    return createErrorResponse("Failed to fetch audit logs", 500);
  }
}

/**
 * POST /api/admin/settings/audit-logs
 * Creează un nou audit log entry (pentru acțiuni custom)
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRole(["ADMIN", "MANAGER"]);
    if (error) return error;

    const body = await req.json();
    const { targetUserId, type, action, resource, metadata } = body;

    logger.info("API:Settings:AuditLogs", "Creating audit log", {
      userId: user.id,
      action,
      resource,
    });

    const log = await prisma.securityActivity.create({
      data: {
        userId: targetUserId || user.id,
        type: type || "LOGIN",
        userAgent: req.headers.get("user-agent") || "unknown",
        success: true,
        metadata: {
          action,
          resource,
          performedBy: user.id,
          ip: req.headers.get("x-forwarded-for") || "unknown",
          ...metadata,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    logApiError("API:Settings:AuditLogs", err);
    return createErrorResponse("Failed to create audit log", 500);
  }
}

/**
 * GET /api/admin/settings/audit-logs/stats
 * Obține statistici despre audit logs
 */
export async function getAuditStats(req: NextRequest) {
  try {
    const { user, error } = await requireRole(["ADMIN"]);
    if (error) return error;

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      total,
      last24hCount,
      last7daysCount,
      last30daysCount,
      failedLogins,
      byType,
    ] = await Promise.all([
      prisma.securityActivity.count(),
      prisma.securityActivity.count({
        where: { createdAt: { gte: last24h } },
      }),
      prisma.securityActivity.count({
        where: { createdAt: { gte: last7days } },
      }),
      prisma.securityActivity.count({
        where: { createdAt: { gte: last30days } },
      }),
      prisma.securityActivity.count({
        where: {
          type: "FAILED_LOGIN",
          createdAt: { gte: last7days },
        },
      }),
      prisma.securityActivity.groupBy({
        by: ["type"],
        _count: true,
        where: {
          createdAt: { gte: last30days },
        },
      }),
    ]);

    return NextResponse.json({
      total,
      last24h: last24hCount,
      last7days: last7daysCount,
      last30days: last30daysCount,
      failedLogins,
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
    });
  } catch (err) {
    logApiError("API:Settings:AuditLogs:Stats", err);
    return createErrorResponse("Failed to fetch audit stats", 500);
  }
}
