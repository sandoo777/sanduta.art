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

const updateConsumableSchema = z.object({
  consumptionPerSqm: z.number().nullable().optional(),
  consumptionPerUnit: z.number().nullable().optional(),
  consumptionPerJob: z.number().nullable().optional(),
  unit: z.enum(['liter', 'ml', 'gram', 'kg', 'unit', 'm2', 'meter', 'pcs']).optional(),
  active: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

// PATCH /api/admin/machines/[id]/consumables/[consumableId] - Update a consumable
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; consumableId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { consumableId } = params;
    const body = await request.json();
    const validatedData = updateConsumableSchema.parse(body);

    const consumable = await prisma.equipmentConsumable.update({
      where: { id: consumableId },
      data: {
        consumptionPerSqm: validatedData.consumptionPerSqm,
        consumptionPerUnit: validatedData.consumptionPerUnit,
        consumptionPerJob: validatedData.consumptionPerJob,
        unit: validatedData.unit as MaterialUnit | undefined,
        active: validatedData.active,
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
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating consumable:', error);
    return NextResponse.json({ error: 'Failed to update consumable' }, { status: 500 });
  }
}

// DELETE /api/admin/machines/[id]/consumables/[consumableId] - Delete a consumable
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; consumableId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { consumableId } = params;

    await prisma.equipmentConsumable.delete({
      where: { id: consumableId },
    });

    return NextResponse.json({ success: true, message: 'Consumable deleted' });
  } catch (error) {
    console.error('Error deleting consumable:', error);
    return NextResponse.json({ error: 'Failed to delete consumable' }, { status: 500 });
  }
}
