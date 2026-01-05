import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all folders with project count
    const folders = await prisma.projectFolder.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedFolders = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      createdAt: folder.createdAt.toISOString(),
      projectCount: folder._count.projects,
    }));

    return NextResponse.json(formattedFolders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    const folder = await prisma.projectFolder.create({
      data: {
        name: name.trim(),
        userId: user.id,
      },
    });

    return NextResponse.json({
      id: folder.id,
      name: folder.name,
      createdAt: folder.createdAt.toISOString(),
      projectCount: 0,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
