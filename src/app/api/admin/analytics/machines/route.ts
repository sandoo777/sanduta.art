import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";

/**
 * GET /api/admin/analytics/machines
 * Obține utilizarea echipamentelor (mock data - va fi integrat cu sistemul real)
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error: authError } = await requireRole(["ADMIN", "MANAGER", "OPERATOR"]);
    if (authError) return authError;

    logger.info("API:Analytics:Machines", "Fetching machines utilization", {
      userId: user.id,
    });

    // Mock data - va fi înlocuit cu date reale din baza de date
    const machines = [
      {
        id: "m1",
        name: "Laser Cutter 1",
        status: "active" as const,
        utilization: 87,
        activeTime: 6.5,
        idleTime: 1.5,
      },
      {
        id: "m2",
        name: "CNC Router",
        status: "active" as const,
        utilization: 92,
        activeTime: 7.2,
        idleTime: 0.8,
      },
      {
        id: "m3",
        name: "UV Printer",
        status: "idle" as const,
        utilization: 45,
        activeTime: 3.5,
        idleTime: 4.5,
      },
      {
        id: "m4",
        name: "Laser Cutter 2",
        status: "active" as const,
        utilization: 78,
        activeTime: 6.0,
        idleTime: 2.0,
      },
      {
        id: "m5",
        name: "Plotter",
        status: "maintenance" as const,
        utilization: 0,
        activeTime: 0,
        idleTime: 8.0,
      },
    ];

    logger.info("API:Analytics:Machines", "Machines utilization fetched successfully", {
      userId: user.id,
      count: machines.length,
    });

    return NextResponse.json(machines);
  } catch (err) {
    logApiError("API:Analytics:Machines", err);
    return createErrorResponse("Failed to fetch machines utilization", 500);
  }
}
