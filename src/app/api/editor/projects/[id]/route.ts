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
    
    // Parse JSON data field
    const parsedProject = {
      ...project,
      data: project.data ? JSON.parse(project.data as string) : { elements: [], canvas: { width: 800, height: 600 }, versions: [] },
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
    const { name, data, thumbnail } = body;
    
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
        data: JSON.stringify(data),
        thumbnail,
        updatedAt: new Date(),
      },
    });
    
    // Parse JSON data field for response
    const parsedProject = {
      ...updatedProject,
      data: JSON.parse(updatedProject.data as string),
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
