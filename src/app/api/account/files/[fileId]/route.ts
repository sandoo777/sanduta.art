import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
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
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({
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
      versionCount: file.versions.length,
      versions: file.versions.map((version) => ({
        id: version.id,
        variant: version.variant,
        format: version.format,
        size: version.size,
        url: version.url,
        createdAt: version.createdAt.toISOString(),
        metadata: version.metadata,
      })),
    });
  } catch (error) {
    console.error("Error fetching file", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
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
      select: { id: true },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await prisma.userFile.delete({ where: { id: fileId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
