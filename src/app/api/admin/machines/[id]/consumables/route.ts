import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, MaterialUnit } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { z } from 'zod';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const consumableSchema = z.object({
  materialId: z.string().min(1, 'Material ID este obligatoriu'),
  consumptionPerSqm: z.number().nullable().optional(),
  consumptionPerUnit: z.number().nullable().optional(),
  consumptionPerJob: z.number().nullable().optional(),
  unit: z.enum(['liter', 'ml', 'gram', 'kg', 'unit', 'm2', 'meter', 'pcs']),
  active: z.boolean().default(true),
  notes: z.string().nullable().optional(),
});

// GET /api/admin/machines/[id]/consumables - List consumables for a machine
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER', 'OPERATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: machineId } = params;

    const consumables = await prisma.equipmentConsumable.findMany({
      where: { machineId },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
            stock: true,
            pricePerUnit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(consumables.map(c => ({
      ...c,
      consumptionPerSqm: c.consumptionPerSqm ? Number(c.consumptionPerSqm) : null,
      consumptionPerUnit: c.consumptionPerUnit ? Number(c.consumptionPerUnit) : null,
      consumptionPerJob: c.consumptionPerJob ? Number(c.consumptionPerJob) : null,
      material: {
        ...c.material,
        pricePerUnit: c.material.pricePerUnit ? Number(c.material.pricePerUnit) : null,
      },
    })));
  } catch (error) {
    console.error('Error fetching consumables:', error);
    return NextResponse.json({ error: 'Failed to fetch consumables' }, { status: 500 });
  }
}

// POST /api/admin/machines/[id]/consumables - Add a consumable to a machine
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: machineId } = params;
    const body = await request.json();
    const validatedData = consumableSchema.parse(body);

    // Check if machine exists
    const machine = await prisma.machine.findUnique({
      where: { id: machineId },
    });
    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    // Check if material exists
    const material = await prisma.material.findUnique({
      where: { id: validatedData.materialId },
    });
    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Check if consumable already exists for this machine + material
    const existing = await prisma.equipmentConsumable.findUnique({
      where: {
        machineId_materialId: {
          machineId,
          materialId: validatedData.materialId,
        },
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'Consumable already exists for this machine' }, { status: 400 });
    }

    const consumable = await prisma.equipmentConsumable.create({
      data: {
        machineId,
        materialId: validatedData.materialId,
        consumptionPerSqm: validatedData.consumptionPerSqm,
        consumptionPerUnit: validatedData.consumptionPerUnit,
        consumptionPerJob: validatedData.consumptionPerJob,
        unit: validatedData.unit as MaterialUnit,
        active: validatedData.active ?? true,
        notes: validatedData.notes,
      },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
            stock: true,
            pricePerUnit: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...consumable,
      consumptionPerSqm: consumable.consumptionPerSqm ? Number(consumable.consumptionPerSqm) : null,
      consumptionPerUnit: consumable.consumptionPerUnit ? Number(consumable.consumptionPerUnit) : null,
      consumptionPerJob: consumable.consumptionPerJob ? Number(consumable.consumptionPerJob) : null,
      material: {
        ...consumable.material,
        pricePerUnit: consumable.material.pricePerUnit ? Number(consumable.material.pricePerUnit) : null,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating consumable:', error);
    return NextResponse.json({ error: 'Failed to create consumable' }, { status: 500 });
  }
}
