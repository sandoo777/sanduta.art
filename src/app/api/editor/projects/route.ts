import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';

// POST /api/editor/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, elements = [], canvas = { width: 800, height: 600 } } = body;
    
    const project = await prisma.editorProject.create({
      data: {
        name: name || 'Proiect Nou',
        userId: session.user.id,
        elements: JSON.stringify(elements),
        canvas: JSON.stringify(canvas),
        versions: JSON.stringify([]),
      },
    });
    
    // Parse JSON fields for response
    const parsedProject = {
      ...project,
      elements: JSON.parse(project.elements as string),
      canvas: JSON.parse(project.canvas as string),
      versions: JSON.parse(project.versions as string),
    };
    
    return NextResponse.json(parsedProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// GET /api/editor/projects - List user's projects
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const projects = await prisma.editorProject.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
