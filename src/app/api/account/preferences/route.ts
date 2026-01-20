import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/account/preferences - Obține preferințele utilizatorului
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Găsește sau creează preferințe
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Dacă nu există preferințe, creează-le cu valori default
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (_error) {
    console.error("[PREFERENCES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/account/preferences - Actualizează preferințele
export async function PATCH(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validare minimă - poți adăuga mai multe validări
    if (body.language && !["RO", "EN", "RU"].includes(body.language)) {
      return NextResponse.json(
        { error: "Invalid language" },
        { status: 400 }
      );
    }

    if (body.theme && !["LIGHT", "DARK", "SYSTEM"].includes(body.theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    // Găsește sau creează preferințe
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      // Creează cu datele trimise
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          ...body,
        },
      });
    } else {
      // Actualizează
      preferences = await prisma.userPreferences.update({
        where: { userId: session.user.id },
        data: body,
      });
    }

    return NextResponse.json(preferences);
  } catch (_error) {
    console.error("[PREFERENCES_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
