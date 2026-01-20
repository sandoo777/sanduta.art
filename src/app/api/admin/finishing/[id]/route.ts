import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/admin/finishing/[id] - Get single finishing operation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const operation = await prisma.finishingOperation.findUnique({
      where: { id: params.id }
    });

    if (!operation) {
      return NextResponse.json(
        { error: 'Finishing operation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...operation,
      costFix: operation.costFix ? Number(operation.costFix) : null,
      costPerUnit: operation.costPerUnit ? Number(operation.costPerUnit) : null,
      costPerM2: operation.costPerM2 ? Number(operation.costPerM2) : null,
    });
  } catch (_error) {
    console.error('Error fetching finishing operation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finishing operation' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/finishing/[id] - Update finishing operation
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
      costFix,
      costPerUnit,
      costPerM2,
      timeSeconds,
      compatibleMaterialIds,
      compatiblePrintMethodIds,
      description,
      active
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (costFix !== undefined) updateData.costFix = costFix ? Number(costFix) : null;
    if (costPerUnit !== undefined) updateData.costPerUnit = costPerUnit ? Number(costPerUnit) : null;
    if (costPerM2 !== undefined) updateData.costPerM2 = costPerM2 ? Number(costPerM2) : null;
    if (timeSeconds !== undefined) updateData.timeSeconds = timeSeconds ? Number(timeSeconds) : null;
    if (compatibleMaterialIds !== undefined) updateData.compatibleMaterialIds = compatibleMaterialIds;
    if (compatiblePrintMethodIds !== undefined) updateData.compatiblePrintMethodIds = compatiblePrintMethodIds;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;

    const operation = await prisma.finishingOperation.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      ...operation,
      costFix: operation.costFix ? Number(operation.costFix) : null,
      costPerUnit: operation.costPerUnit ? Number(operation.costPerUnit) : null,
      costPerM2: operation.costPerM2 ? Number(operation.costPerM2) : null,
    });
  } catch (_error) {
    console.error('Error updating finishing operation:', error);
    return NextResponse.json(
      { error: 'Failed to update finishing operation' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/finishing/[id] - Delete finishing operation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.finishingOperation.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error('Error deleting finishing operation:', error);
    return NextResponse.json(
      { error: 'Failed to delete finishing operation' },
      { status: 500 }
    );
  }
}
