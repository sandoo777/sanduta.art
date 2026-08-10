import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── helpers ────────────────────────────────────────────────────────────────

function serializeMachine(
  machine: Record<string, unknown>,
  printMethods?: { id: string; name: string; type: string }[]
) {
  const n = (v: unknown) => (v != null ? Number(v) : null);
  return {
    ...machine,
    costPerHour:         n(machine.costPerHour),
    speedM2PerHour:      n(machine.speedM2PerHour),
    inkPerM2:            n(machine.inkPerM2),
    materialPerM2:       n(machine.materialPerM2),
    headAmortPerM2:      n(machine.headAmortPerM2),
    printerAmortPerM2:   n(machine.printerAmortPerM2),
    maintCostPerM2:      n(machine.maintCostPerM2),
    operatorCostPerHour: n(machine.operatorCostPerHour),
    energyConsumptionKw: n(machine.energyConsumptionKw),
    costClickColor:      n(machine.costClickColor),
    costClickBW:         n(machine.costClickBW),
    servicePerClick:     n(machine.servicePerClick),
    compatiblePrintMethods: printMethods ?? [],
  };
}

async function loadPrintMethods(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.printMethod.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, type: true },
  });
}

async function loadMaterials(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.material.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, unit: true },
  });
}

async function validatePrintMethodIds(ids: string[]): Promise<string | null> {
  if (ids.length === 0) return null;
  const found = await prisma.printMethod.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    return 'Una sau mai multe metode de tipărire selectate nu există';
  }
  return null;
}

async function validateMaterialIds(ids: string[]): Promise<string | null> {
  if (ids.length === 0) return null;
  const found = await prisma.material.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    return 'Unul sau mai multe materiale selectate nu există';
  }
  return null;
}

function validateByType(body: Record<string, unknown>): string | null {
  const { equipmentType, compatibleMaterialIds, compatiblePrintMethodIds } = body as {
    equipmentType?: string;
    compatibleMaterialIds?: string[];
    compatiblePrintMethodIds?: string[];
  };

  if (Array.isArray(compatibleMaterialIds) && compatibleMaterialIds.length === 0) {
    return 'Trebuie selectat cel puțin un material compatibil';
  }
  if (Array.isArray(compatiblePrintMethodIds) && compatiblePrintMethodIds.length === 0) {
    return 'Trebuie selectată cel puțin o metodă de tipărire compatibilă';
  }

  if (equipmentType === 'LARGE_FORMAT' && !body.speedM2PerHour) {
    return 'Câmpul "Viteză (m²/h)" este obligatoriu pentru echipamente Large Format';
  }
  if (equipmentType === 'DIGITAL' && !body.costClickColor && !body.costClickBW) {
    return 'Cel puțin un cost per click (color sau A/N) este obligatoriu pentru echipamente Digitale';
  }
  if (equipmentType === 'HOURLY' && !body.costPerHour) {
    return 'Câmpul "Cost pe oră" este obligatoriu pentru echipamente Orare';
  }
  return null;
}

// ─── GET /api/admin/machines/[id] ───────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const machine = await prisma.machine.findUnique({ where: { id } });

    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    const printMethods = await loadPrintMethods(machine.compatiblePrintMethodIds);
    const materials = await loadMaterials(machine.compatibleMaterialIds);
    return NextResponse.json({
      ...serializeMachine(machine as unknown as Record<string, unknown>, printMethods),
      compatibleMaterials: materials,
    });
  } catch (error) {
    console.error('Error fetching machine:', error);
    return NextResponse.json({ error: 'Failed to fetch machine' }, { status: 500 });
  }
}

// ─── PATCH /api/admin/machines/[id] ─────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;

    // Validate type-specific fields only if equipmentType is provided
    if (body.equipmentType !== undefined) {
      const validationError = validateByType(body);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 422 });
      }
    }

    // Validate that print method IDs exist in DB
    if (Array.isArray(body.compatiblePrintMethodIds)) {
      const idsError = await validatePrintMethodIds(body.compatiblePrintMethodIds as string[]);
      if (idsError) {
        return NextResponse.json({ error: idsError }, { status: 422 });
      }
    }

    // Validate that material IDs exist in DB
    if (Array.isArray(body.compatibleMaterialIds)) {
      const matError = await validateMaterialIds(body.compatibleMaterialIds as string[]);
      if (matError) {
        return NextResponse.json({ error: matError }, { status: 422 });
      }
    }

    const n = (v: unknown) => (v != null ? Number(v) : null);
    const updateData: Record<string, unknown> = {};

    // Scalar fields – only set if key present in body
    const scalarFields = ['name', 'type', 'equipmentType', 'status', 'speed', 'maxFormat', 'description', 'notes'] as const;
    for (const f of scalarFields) {
      if (f in body) updateData[f] = body[f] ?? null;
    }

    // Boolean
    if ('active' in body) updateData.active = Boolean(body.active);

    // Date
    if ('lastMaintenance' in body) {
      updateData.lastMaintenance = body.lastMaintenance ? new Date(body.lastMaintenance as string) : null;
    }

    // Integer fields
    if ('maxWidth'      in body) updateData.maxWidth      = body.maxWidth      != null ? Math.round(n(body.maxWidth)!)      : null;
    if ('maxHeight'     in body) updateData.maxHeight     = body.maxHeight     != null ? Math.round(n(body.maxHeight)!)     : null;
    if ('maxGramWeight' in body) updateData.maxGramWeight = body.maxGramWeight != null ? Math.round(n(body.maxGramWeight)!) : null;
    if ('speedPpm'      in body) updateData.speedPpm      = body.speedPpm      != null ? Math.round(n(body.speedPpm)!)      : null;

    // Decimal fields
    const decimalFields = [
      'costPerHour', 'operatorCostPerHour', 'energyConsumptionKw',
      'speedM2PerHour', 'inkPerM2', 'materialPerM2', 'headAmortPerM2',
      'printerAmortPerM2', 'maintCostPerM2',
      'costClickColor', 'costClickBW', 'servicePerClick',
    ] as const;
    for (const f of decimalFields) {
      if (f in body) updateData[f] = n(body[f]);
    }

    // Array fields
    if ('compatibleMaterialIds'    in body) updateData.compatibleMaterialIds    = Array.isArray(body.compatibleMaterialIds)    ? body.compatibleMaterialIds    : [];
    if ('compatiblePrintMethodIds' in body) updateData.compatiblePrintMethodIds = Array.isArray(body.compatiblePrintMethodIds) ? body.compatiblePrintMethodIds : [];

    const machine = await prisma.machine.update({
      where: { id },
      data: updateData,
    });

    const printMethods = await loadPrintMethods(machine.compatiblePrintMethodIds);
    const materials = await loadMaterials(machine.compatibleMaterialIds);
    return NextResponse.json({
      ...serializeMachine(machine as unknown as Record<string, unknown>, printMethods),
      compatibleMaterials: materials,
    });
  } catch (error) {
    console.error('Error updating machine:', error);
    return NextResponse.json({ error: 'Failed to update machine' }, { status: 500 });
  }
}

// ─── DELETE /api/admin/machines/[id] ────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.machine.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting machine:', error);
    return NextResponse.json({ error: 'Failed to delete machine' }, { status: 500 });
  }
}
