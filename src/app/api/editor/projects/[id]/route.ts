import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';

// GET /api/editor/projects/[id] - Load project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const project = await prisma.editorProject.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Parse JSON fields
    const parsedProject = {
      ...project,
      elements: project.elements ? JSON.parse(project.elements as string) : [],
      canvas: project.canvas ? JSON.parse(project.canvas as string) : { width: 800, height: 600 },
      versions: project.versions ? JSON.parse(project.versions as string) : [],
    };
    
    return NextResponse.json(parsedProject);
  } catch (error) {
    console.error('Error loading project:', error);
    return NextResponse.json(
      { error: 'Failed to load project' },
      { status: 500 }
    );
  }
}

// PUT /api/editor/projects/[id] - Save project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, elements, canvas, thumbnailUrl, versions } = body;
    
    // Verify project ownership
    const existingProject = await prisma.editorProject.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });
    
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Update project
    const updatedProject = await prisma.editorProject.update({
      where: { id: id },
      data: {
        name,
        elements: JSON.stringify(elements),
        canvas: JSON.stringify(canvas),
        thumbnailUrl,
        versions: JSON.stringify(versions || []),
        updatedAt: new Date(),
      },
    });
    
    // Parse JSON fields for response
    const parsedProject = {
      ...updatedProject,
      elements: JSON.parse(updatedProject.elements as string),
      canvas: JSON.parse(updatedProject.canvas as string),
      versions: JSON.parse(updatedProject.versions as string),
    };
    
    return NextResponse.json(parsedProject);
  } catch (error) {
    console.error('Error saving project:', error);
    return NextResponse.json(
      { error: 'Failed to save project' },
      { status: 500 }
    );
  }
}

// DELETE /api/editor/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify project ownership
    const existingProject = await prisma.editorProject.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });
    
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Delete project
    await prisma.editorProject.delete({
      where: { id: id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
