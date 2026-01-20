import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      productId,
      previewImage,
      finalFile,
      layers,
      metadata,
    } = body;

    // Validate required fields
    if (!productId || !layers || !metadata) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let project;

    if (projectId) {
      // Update existing project
      project = await prisma.editorProject.update({
        where: {
          id: projectId,
          userId: session.user.id, // Ensure user owns the project
        },
        data: {
          previewImage,
          finalFile,
          layers,
          metadata,
          updatedAt: new Date(),
          data: JSON.stringify({ layers, metadata }), // Legacy field
        },
      });
    } else {
      // Create new project
      project = await prisma.editorProject.create({
        data: {
          name: `Proiect ${new Date().toLocaleDateString('ro-RO')}`,
          userId: session.user.id,
          productId,
          previewImage,
          finalFile,
          layers,
          metadata,
          status: 'draft',
          data: JSON.stringify({ layers, metadata }), // Legacy field
        },
      });
    }

    return NextResponse.json({
      success: true,
      projectId: project.id,
      previewUrl: project.previewImage,
      finalFileUrl: project.finalFile,
    });
  } catch (error) {
    console.error('Error saving project:', error);
    return NextResponse.json(
      { error: 'Failed to save project' },
      { status: 500 }
    );
  }
}

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      );
    }

    const project = await prisma.editorProject.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        productId: project.productId,
        productName: project.product.name,
        productSlug: project.product.slug,
        previewImage: project.previewImage,
        finalFile: project.finalFile,
        layers: project.layers,
        metadata: project.metadata,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error loading project:', error);
    return NextResponse.json(
      { error: 'Failed to load project' },
      { status: 500 }
    );
  }
}
