import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, canManageSystemSettings } from "@/lib/auth-helpers";
import { UserRole } from "@prisma/client";

// GET /api/admin/settings/system - Get all system settings
export async function GET(request: NextRequest) {
  const { user, error } = await requireRole(["ADMIN", "MANAGER"]);
  
  if (error) {
    return error;
  }

  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: {
        key: "asc"
      }
    });

    // Convert array to key-value object for easier consumption
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      settings: settingsObject,
      raw: settings // Also include raw array for reference
    });
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch system settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings/system - Update system settings
export async function PATCH(request: NextRequest) {
  const { user, error } = await requireRole(["ADMIN", "MANAGER"]);
  
  if (error) {
    return error;
  }

  if (!canManageSystemSettings(user.role)) {
    return NextResponse.json(
      { error: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Invalid request: settings object is required" },
        { status: 400 }
      );
    }

    // Process each setting
    const results = [];
    
    for (const [key, value] of Object.entries(settings)) {
      if (typeof key !== "string") {
        continue;
      }

      const stringValue = String(value);

      // Upsert the setting
      const updatedSetting = await prisma.systemSetting.upsert({
        where: { key },
        update: { 
          value: stringValue,
          updatedAt: new Date()
        },
        create: { 
          key, 
          value: stringValue 
        }
      });

      results.push(updatedSetting);
    }

    // Fetch all settings to return
    const allSettings = await prisma.systemSetting.findMany({
      orderBy: {
        key: "asc"
      }
    });

    const settingsObject = allSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      message: "System settings updated successfully",
      settings: settingsObject,
      updated: results.length
    });
  } catch (error) {
    console.error("Error updating system settings:", error);
    return NextResponse.json(
      { error: "Failed to update system settings" },
      { status: 500 }
    );
  }
}
