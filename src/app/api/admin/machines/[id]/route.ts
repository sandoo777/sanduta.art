import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/admin/machines/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const machine = await prisma.machine.findUnique({
      where: { id: params.id }
    });

    if (!machine) {
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...machine,
      costPerHour: machine.costPerHour ? Number(machine.costPerHour) : null,
    });
  } catch (_error) {
    console.error('Error fetching machine:', error);
    return NextResponse.json(
      { error: 'Failed to fetch machine' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/machines/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      type,
      costPerHour,
      speed,
      maxWidth,
      maxHeight,
      compatibleMaterialIds,
      compatiblePrintMethodIds,
      description,
      active
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (costPerHour !== undefined) updateData.costPerHour = costPerHour ? Number(costPerHour) : null;
    if (speed !== undefined) updateData.speed = speed;
    if (maxWidth !== undefined) updateData.maxWidth = maxWidth ? Number(maxWidth) : null;
    if (maxHeight !== undefined) updateData.maxHeight = maxHeight ? Number(maxHeight) : null;
    if (compatibleMaterialIds !== undefined) updateData.compatibleMaterialIds = compatibleMaterialIds;
    if (compatiblePrintMethodIds !== undefined) updateData.compatiblePrintMethodIds = compatiblePrintMethodIds;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;

    const machine = await prisma.machine.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      ...machine,
      costPerHour: machine.costPerHour ? Number(machine.costPerHour) : null,
    });
  } catch (_error) {
    console.error('Error updating machine:', error);
    return NextResponse.json(
      { error: 'Failed to update machine' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/machines/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.machine.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error('Error deleting machine:', error);
    return NextResponse.json(
      { error: 'Failed to delete machine' },
      { status: 500 }
    );
  }
}
