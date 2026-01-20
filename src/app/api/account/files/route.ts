import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/validation";

export const GET = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.SEARCH);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { searchParams } = new URL(request.url);
      const searchRaw = searchParams.get("search")?.trim();
      const search = searchRaw ? sanitizeString(searchRaw) : null;
      const sort = searchParams.get("sort") || "newest";
      const typeFilter = searchParams.get("type");

    let orderBy: { [key: string]: "asc" | "desc" } = { createdAt: "desc" };

    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "az":
        orderBy = { name: "asc" };
        break;
      case "za":
        orderBy = { name: "desc" };
        break;
      case "type":
        orderBy = { type: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const files = await prisma.userFile.findMany({
      where: {
        userId: user.id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { type: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(typeFilter && typeFilter !== "all" ? { type: typeFilter } : {}),
      },
      orderBy,
      include: {
        _count: { select: { versions: true } },
      },
    });

      const payload = files.map((file) => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        thumbnailUrl: file.thumbnailUrl,
        previewUrl: file.previewUrl,
        originalUrl: file.originalUrl,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
        lastUsedAt: file.lastUsedAt ? file.lastUsedAt.toISOString() : null,
        versionCount: file._count.versions,
      }));

      return NextResponse.json(payload);
    } catch (error) {
      console.error("Error loading files", error);
      return NextResponse.json(
        { error: "Failed to load files" },
        { status: 500 }
      );
    }
  }
);
