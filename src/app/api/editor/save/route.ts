import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/modules/auth/nextauth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { design = {}, name, thumbnail, id: existingId, productId } = body ?? {};

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const dataStr = typeof design === 'string' ? design : JSON.stringify(design);

    let project;

    if (existingId) {
      // Update existing project owned by this user
      const existing = await prisma.editorProject.findFirst({
        where: { id: existingId, userId },
        select: { id: true },
      });

      if (!existing) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
      }

      project = await prisma.editorProject.update({
        where: { id: existingId },
        data: { data: dataStr, ...(name ? { name } : {}), ...(thumbnail ? { thumbnail } : {}), status: 'saved' },
        select: { id: true, name: true, createdAt: true, updatedAt: true },
      });
    } else {
      // Create new project
      project = await prisma.editorProject.create({
        data: {
          name: name || `Design ${new Date().toLocaleDateString('ro-MD')}`,
          userId,
          data: dataStr,
          thumbnail,
          status: 'saved',
          ...(productId ? { productId } : {}),
        },
        select: { id: true, name: true, createdAt: true, updatedAt: true },
      });
    }

    return NextResponse.json({
      success: true,
      designId: project.id,
      project,
    }, { status: 201 });
  } catch (error) {
    console.error('Editor save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save design' }, { status: 500 });
  }
}
