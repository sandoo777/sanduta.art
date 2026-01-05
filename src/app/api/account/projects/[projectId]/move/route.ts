import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
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

    const { folderId } = await request.json();

    // Check ownership
    const project = await prisma.editorProject.findUnique({
      where: { id: projectId, userId: user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If folderId is provided, verify it exists and belongs to user
    if (folderId) {
      const folder = await prisma.projectFolder.findUnique({
        where: { id: folderId, userId: user.id },
      });

      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
    }

    // Update project folder
    const updatedProject = await prisma.editorProject.update({
      where: { id: projectId },
      data: { folderId },
    });

    return NextResponse.json({
      id: updatedProject.id,
      name: updatedProject.name,
      folderId: updatedProject.folderId,
      updatedAt: updatedProject.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error moving project:", error);
    return NextResponse.json(
      { error: "Failed to move project" },
      { status: 500 }
    );
  }
}
