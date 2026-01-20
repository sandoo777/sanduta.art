import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
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

    const { fileId } = await params;

    const file = await prisma.userFile.findFirst({
      where: { id: fileId, userId: user.id },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        thumbnailUrl: true,
        previewUrl: true,
        originalUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const updated = await prisma.userFile.update({
      where: { id: fileId },
      data: { lastUsedAt: new Date() },
      include: {
        _count: { select: { versions: true } },
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      type: updated.type,
      size: updated.size,
      thumbnailUrl: updated.thumbnailUrl,
      previewUrl: updated.previewUrl,
      originalUrl: updated.originalUrl,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      lastUsedAt: updated.lastUsedAt ? updated.lastUsedAt.toISOString() : null,
      versionCount: updated._count.versions,
    });
  } catch (_error) {
    console.error("Error marking file as reused", error);
    return NextResponse.json(
      { error: "Failed to update file usage" },
      { status: 500 }
    );
  }
}
