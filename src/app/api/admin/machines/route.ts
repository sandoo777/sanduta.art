import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/admin/machines - List all machines
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const machines = await prisma.machine.findMany({
      orderBy: [
        { active: 'desc' },
        { name: 'asc' }
      ]
    });

    const serializedMachines = machines.map(machine => ({
      ...machine,
      costPerHour: machine.costPerHour ? Number(machine.costPerHour) : null,
    }));

    return NextResponse.json(serializedMachines);
  } catch (_error) {
    console.error('Error fetching machines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch machines' },
      { status: 500 }
    );
  }
}

// POST /api/admin/machines - Create new machine
export async function POST(_request: NextRequest) {
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

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const machine = await prisma.machine.create({
      data: {
        name,
        type,
        costPerHour: costPerHour ? Number(costPerHour) : null,
        speed,
        maxWidth: maxWidth ? Number(maxWidth) : null,
        maxHeight: maxHeight ? Number(maxHeight) : null,
        compatibleMaterialIds: compatibleMaterialIds || [],
        compatiblePrintMethodIds: compatiblePrintMethodIds || [],
        description,
        active: active !== undefined ? active : true,
      }
    });

    return NextResponse.json({
      ...machine,
      costPerHour: machine.costPerHour ? Number(machine.costPerHour) : null,
    }, { status: 201 });
  } catch (_error) {
    console.error('Error creating machine:', error);
    return NextResponse.json(
      { error: 'Failed to create machine' },
      { status: 500 }
    );
  }
}
