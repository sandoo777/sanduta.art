import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateMachinePayload } from '@/modules/machines/validation';
import { normalizeMaintenanceType, toDbMaintenanceType } from '@/modules/machines/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function serializeMachine(
  machine: Record<string, unknown>
) {
  const n = (v: unknown) => (v != null ? Number(v) : null);

  return {
    ...machine,
    maxWidth:            n(machine.maxWidth),
    maxHeight:           n(machine.maxHeight),
    purchaseCostMdl:     n(machine.purchaseCostMdl),
    expectedLifetimePages: n(machine.expectedLifetimePages),
    electricityCostPerKwh: n(machine.electricityCostPerKwh),
    maxGramWeight:       n(machine.maxGramWeight),
    speedPpm:            n(machine.speedPpm),
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
  };
}

async function loadMaterials(ids?: string[] | null) {
  const safeIds = Array.isArray(ids) ? ids : [];
  if (safeIds.length === 0) return [];
  return prisma.material.findMany({
    where: { id: { in: safeIds } },
    select: { id: true, name: true, unit: true },
  });
}

async function validateMaterialIds(ids: string[]): Promise<string | null> {
  if (ids.length === 0) return null;
  const found = await prisma.material.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    return 'Unul sau mai multe materiale selectate nu există';
  }
  return null;
}

async function validatePrintMethodIds(ids: string[]): Promise<string | null> {
  if (ids.length === 0) return null;
  const found = await prisma.printMethod.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    return 'Una sau mai multe metode de tipărire selectate nu există';
  }
  return null;
}

function validateByType(body: Record<string, unknown>): string | null {
  return validateMachinePayload(body);
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
    const machine = await prisma.machine.findUnique({
      where: { id },
    });

    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    const maintenanceHistory = await prisma.machineMaintenanceRecord.findMany({
      where: { machineId: id },
      orderBy: { date: 'desc' },
    });

    const materials = await loadMaterials(machine.compatibleMaterialIds ?? []);
    return NextResponse.json({
      ...serializeMachine({
        ...machine,
        maintenanceHistory,
      } as unknown as Record<string, unknown>),
      maintenanceHistory: maintenanceHistory.map((record) => ({
        ...record,
        type: normalizeMaintenanceType(record.type as string),
        cost: record.cost != null ? Number(record.cost) : null,
        date: record.date ? new Date(record.date).toISOString() : null,
      })),
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

    // Validate that material IDs exist in DB
    if (Array.isArray(body.compatibleMaterialIds)) {
      const matError = await validateMaterialIds(body.compatibleMaterialIds as string[]);
      if (matError) {
        return NextResponse.json({ error: matError }, { status: 422 });
      }
    }

    if (Array.isArray(body.compatiblePrintMethodIds)) {
      const printMethodError = await validatePrintMethodIds(body.compatiblePrintMethodIds as string[]);
      if (printMethodError) {
        return NextResponse.json({ error: printMethodError }, { status: 422 });
      }
    }

    const n = (v: unknown) => (v != null ? Number(v) : null);
    const updateData: Record<string, unknown> = {};
    const rawMaintenanceHistory = Array.isArray(body.maintenanceHistory) ? body.maintenanceHistory as Record<string, unknown>[] : [];

    // Scalar fields – only set if key present in body
    const scalarFields = ['name', 'type', 'equipmentType', 'status', 'speed', 'maxFormat', 'description', 'notes'] as const;
    for (const f of scalarFields) {
      if (f in body) updateData[f] = body[f] ?? null;
    }

    // Boolean
    if ('active' in body) updateData.active = Boolean(body.active);

    // Integer fields
    if ('maxWidth'      in body) updateData.maxWidth      = body.maxWidth      != null ? Math.round(n(body.maxWidth)!)      : null;
    if ('maxHeight'     in body) updateData.maxHeight     = body.maxHeight     != null ? Math.round(n(body.maxHeight)!)     : null;
    if ('maxGramWeight' in body) updateData.maxGramWeight = body.maxGramWeight != null ? Math.round(n(body.maxGramWeight)!) : null;
    if ('expectedLifetimePages' in body) updateData.expectedLifetimePages = body.expectedLifetimePages != null ? Math.round(n(body.expectedLifetimePages)!) : null;
    if ('speedPpm'      in body) updateData.speedPpm      = body.speedPpm      != null ? Math.round(n(body.speedPpm)!)      : null;

    // Decimal fields
    const decimalFields = [
      'costPerHour', 'operatorCostPerHour', 'energyConsumptionKw', 'purchaseCostMdl', 'electricityCostPerKwh',
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
    if ('speedProfiles' in body) updateData.speedProfiles = Array.isArray(body.speedProfiles) ? body.speedProfiles : null;
    if ('maintenanceComponents' in body) updateData.maintenanceComponents = Array.isArray(body.maintenanceComponents) ? body.maintenanceComponents : null;
    if ('tonerConsumables' in body) updateData.tonerConsumables = Array.isArray(body.tonerConsumables) ? body.tonerConsumables : null;

    if (rawMaintenanceHistory.length > 0) {
      const latestDate = new Date(Math.max(...rawMaintenanceHistory.map((record) => new Date(String(record.date ?? 0)).getTime()))).toISOString();
      updateData.lastMaintenance = new Date(latestDate);
      updateData.maintenanceHistory = {
        upsert: rawMaintenanceHistory.map((record) => {
          const recordId = typeof record.id === 'string' && record.id.trim() ? record.id : crypto.randomUUID();
          const payload = {
            date: new Date(String(record.date)),
            type: toDbMaintenanceType(String(record.type ?? 'Preventive')) as any,
            description: String(record.description ?? 'Maintenance record'),
            cost: record.cost != null ? Number(record.cost) : null,
            technician: record.technician ? String(record.technician) : null,
            notes: record.notes ? String(record.notes) : null,
          };

          return {
            where: { id: recordId },
            update: payload,
            create: { id: recordId, ...payload },
          };
        }),
      };
    }

    const machine = await prisma.machine.update({
      where: { id },
      data: updateData,
    });

    const maintenanceHistory = await prisma.machineMaintenanceRecord.findMany({
      where: { machineId: id },
      orderBy: { date: 'desc' },
    });

    const materials = await loadMaterials(machine.compatibleMaterialIds ?? []);
    return NextResponse.json({
      ...serializeMachine({
        ...machine,
        maintenanceHistory,
      } as unknown as Record<string, unknown>),
      maintenanceHistory: maintenanceHistory.map((record) => ({
        ...record,
        type: normalizeMaintenanceType(record.type as string),
        cost: record.cost != null ? Number(record.cost) : null,
        date: record.date ? new Date(record.date).toISOString() : null,
      })),
      compatibleMaterials: materials,
    });
  } catch (error) {
    console.error('Error updating machine:', error);
    const message = error instanceof Error && error.message
      ? error.message
      : 'Failed to update machine';
    return NextResponse.json({ error: message }, { status: 500 });
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
