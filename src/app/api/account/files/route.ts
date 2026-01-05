import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
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
