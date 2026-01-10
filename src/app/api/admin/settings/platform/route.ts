import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { logger, logApiError, createErrorResponse } from "@/lib/logger";

/**
 * Tipuri pentru setările platformei
 */
interface PlatformSettings {
  general: {
    platformName: string;
    logo: string;
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    timezone: string;
    dateFormat: string;
    languages: string[];
    defaultLanguage: string;
  };
  business: {
    companyName: string;
    cui: string;
    registrationNumber: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  financial: {
    currency: string;
    vat: number;
    bankAccount: string;
    bankName: string;
  };
  email: {
    senderName: string;
    senderEmail: string;
    replyToEmail: string;
    notificationEmail: string;
  };
  notifications: {
    orderCreated: boolean;
    orderStatusChanged: boolean;
    paymentReceived: boolean;
    productionStarted: boolean;
    productionCompleted: boolean;
    deliveryReady: boolean;
  };
}

// Setările implicite (în memorie pentru demo, în producție ar fi în DB)
let platformSettings: PlatformSettings = {
  general: {
    platformName: "Sanduta.art",
    logo: "/logo.svg",
    brandColors: {
      primary: "#3B82F6",
      secondary: "#8B5CF6",
      accent: "#EC4899",
    },
    timezone: "Europe/Bucharest",
    dateFormat: "DD.MM.YYYY",
    languages: ["ro", "en", "ru"],
    defaultLanguage: "ro",
  },
  business: {
    companyName: "Sanduta SRL",
    cui: "RO12345678",
    registrationNumber: "J40/1234/2020",
    address: "Str. Exemplu nr. 1, București, România",
    phone: "+40 123 456 789",
    email: "contact@sanduta.art",
    website: "https://sanduta.art",
  },
  financial: {
    currency: "RON",
    vat: 19,
    bankAccount: "RO49AAAA1B31007593840000",
    bankName: "Banca Comercială Română",
  },
  email: {
    senderName: "Sanduta.art",
    senderEmail: "noreply@sanduta.art",
    replyToEmail: "contact@sanduta.art",
    notificationEmail: "admin@sanduta.art",
  },
  notifications: {
    orderCreated: true,
    orderStatusChanged: true,
    paymentReceived: true,
    productionStarted: true,
    productionCompleted: true,
    deliveryReady: true,
  },
};

/**
 * GET /api/admin/settings/platform
 * Obține toate setările platformei
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRole(["ADMIN", "MANAGER"]);
    if (error) return error;

    logger.info("API:Settings:Platform", "Fetching platform settings", { userId: user.id });

    // În viitor, citim din baza de date
    // const settings = await prisma.platformSettings.findFirst();
    
    return NextResponse.json(platformSettings);
  } catch (err) {
    logApiError("API:Settings:Platform", err);
    return createErrorResponse("Failed to fetch platform settings", 500);
  }
}

/**
 * PUT /api/admin/settings/platform
 * Actualizează setările platformei
 */
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRole(["ADMIN"]);
    if (error) return error;

    const body = await req.json();
    const { section, data } = body;

    logger.info("API:Settings:Platform", "Updating platform settings", {
      userId: user.id,
      section,
    });

    // Validare
    if (!section || !data) {
      return createErrorResponse("Missing section or data", 400);
    }

    const validSections = ["general", "business", "financial", "email", "notifications"];
    if (!validSections.includes(section)) {
      return createErrorResponse("Invalid section", 400);
    }

    // Actualizează secțiunea
    platformSettings = {
      ...platformSettings,
      [section]: {
        ...platformSettings[section as keyof PlatformSettings],
        ...data,
      },
    };

    // În viitor, salvăm în baza de date
    // await prisma.platformSettings.update({ ... });

    logger.info("API:Settings:Platform", "Platform settings updated", {
      userId: user.id,
      section,
    });

    return NextResponse.json({
      success: true,
      settings: platformSettings,
    });
  } catch (err) {
    logApiError("API:Settings:Platform", err);
    return createErrorResponse("Failed to update platform settings", 500);
  }
}

/**
 * PATCH /api/admin/settings/platform
 * Actualizează parțial setările platformei
 */
export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireRole(["ADMIN"]);
    if (error) return error;

    const body = await req.json();

    logger.info("API:Settings:Platform", "Patching platform settings", {
      userId: user.id,
    });

    // Merge partial updates
    platformSettings = deepMerge(platformSettings, body);

    logger.info("API:Settings:Platform", "Platform settings patched", {
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      settings: platformSettings,
    });
  } catch (err) {
    logApiError("API:Settings:Platform", err);
    return createErrorResponse("Failed to patch platform settings", 500);
  }
}

// Helper function pentru deep merge
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}
