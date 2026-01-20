import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/analytics/alerts
 * Obține alerte și notificări critice
 */
export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await requireRole(["ADMIN", "MANAGER", "OPERATOR"]);
    if (authError) return authError;

    logger.info("API:Analytics:Alerts", "Fetching alerts", { userId: user.id });

    const alerts: Array<{
      id: string;
      type: "error" | "warning" | "info";
      category: "file" | "order" | "machine" | "operation";
      title: string;
      message: string;
      timestamp: string;
      actionUrl?: string;
    }> = [];

    const now = new Date();

    // 1. Comenzi întârziate (delayed orders)
    const delayedOrders = await prisma.order.count({
      where: {
        status: { in: ["IN_PRODUCTION", "IN_PREPRODUCTION", "IN_DESIGN", "IN_PRINTING"] },
        // estimatedDeliveryDate: { lt: now }, // Uncomment when field exists
      },
    });

    if (delayedOrders > 0) {
      alerts.push({
        id: `delayed-${Date.now()}`,
        type: "error",
        category: "order",
        title: "Comenzi întârziate",
        message: `${delayedOrders} comenzi sunt întârziate față de termenul estimat`,
        timestamp: now.toISOString(),
        actionUrl: "/admin/orders?filter=delayed",
      });
    }

    // 2. Comenzi fără fișiere încărcate
    const ordersWithoutFiles = await prisma.order.count({
      where: {
        status: "PENDING",
        // TODO: Verificare fișiere după ce adăugăm logica
      },
    });

    if (ordersWithoutFiles > 0) {
      alerts.push({
        id: `no-files-${Date.now()}`,
        type: "warning",
        category: "file",
        title: "Comenzi fără fișiere",
        message: `${ordersWithoutFiles} comenzi așteaptă încărcarea fișierelor`,
        timestamp: now.toISOString(),
        actionUrl: "/admin/orders?filter=no-files",
      });
    }

    // 3. Comenzi cu producție blocată (mock - va fi integrat cu sistemul real)
    const blockedProduction = 2; // Mock value
    if (blockedProduction > 0) {
      alerts.push({
        id: `blocked-${Date.now()}`,
        type: "error",
        category: "operation",
        title: "Producție blocată",
        message: `${blockedProduction} comenzi sunt blocate în producție`,
        timestamp: now.toISOString(),
        actionUrl: "/admin/production",
      });
    }

    // 4. Echipamente în mentenanță (mock)
    alerts.push({
      id: `maintenance-${Date.now()}`,
      type: "info",
      category: "machine",
      title: "Echipament în mentenanță",
      message: "Plotter este în mentenanță preventivă",
      timestamp: now.toISOString(),
      actionUrl: "/admin/equipment",
    });

    // 5. Comenzi noi (ultimele 2 ore)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const newOrders = await prisma.order.count({
      where: {
        createdAt: { gte: twoHoursAgo },
        status: "PENDING",
      },
    });

    if (newOrders > 0) {
      alerts.push({
        id: `new-orders-${Date.now()}`,
        type: "info",
        category: "order",
        title: "Comenzi noi",
        message: `${newOrders} comenzi noi primite în ultimele 2 ore`,
        timestamp: now.toISOString(),
        actionUrl: "/admin/orders?filter=new",
      });
    }

    // Sortează alertele: error > warning > info, apoi după timestamp
    alerts.sort((a, b) => {
      const typeOrder = { error: 0, warning: 1, info: 2 };
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    logger.info("API:Analytics:Alerts", "Alerts fetched successfully", {
      userId: user.id,
      count: alerts.length,
    });

    return NextResponse.json(alerts);
  } catch (err) {
    logApiError("API:Analytics:Alerts", err);
    return createErrorResponse("Failed to fetch alerts", 500);
  }
}
