import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EquipmentType, MachineStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { normalizeEquipmentType, normalizeMaintenanceType, toDbMaintenanceType } from '@/modules/machines/types';
import { validateMachinePayload } from '@/modules/machines/validation';

const EQUIPMENT_TYPES: EquipmentType[] = [
  'DIGITAL_COLOR',
  'DIGITAL_MONO',
  'UV',
  'LARGE_FORMAT',
  'DTF',
  'SUBLIMATION',
  'OFFSET',
  'EMBROIDERY',
  'PLOTTER_CUTTING',
];
const MACHINE_STATUSES: MachineStatus[] = ['AVAILABLE', 'BUSY', 'MAINTENANCE'];

type EquipmentConsumableRecord = {
  machineId: string;
  materialId: string;
  consumptionPerSqm: Prisma.Decimal | null;
  consumptionPerUnit: Prisma.Decimal | null;
  consumptionPerJob: Prisma.Decimal | null;
  material: {
    id: string;
    name: string;
    unit: string;
    stock: number;
    purchasePrice: Prisma.Decimal | null;
  };
};

type SerializedEquipmentConsumable = Omit<EquipmentConsumableRecord, 'consumptionPerSqm' | 'consumptionPerUnit' | 'consumptionPerJob' | 'material'> & {
  consumptionPerSqm: number | null;
  consumptionPerUnit: number | null;
  consumptionPerJob: number | null;
  material: EquipmentConsumableRecord['material'] & {
    purchasePrice: number | null;
  };
};

// ─── helpers ────────────────────────────────────────────────────────────────

function serializeMachine(
  machine: Record<string, unknown>
) {
  const n = (v: unknown) => (v != null ? Number(v) : null);
  const {
    compatiblePrintMethodIds: _compatiblePrintMethodIds,
    compatiblePrintMethods: _compatiblePrintMethods,
    ...machineWithoutPrintMethodCompatibility
  } = machine;

  const rawHistory = Array.isArray((machine as { maintenanceHistory?: unknown[] }).maintenanceHistory)
    ? (machine as { maintenanceHistory: Record<string, unknown>[] }).maintenanceHistory
    : [];

  const maintenanceHistory = rawHistory
    .map((record) => ({
      ...record,
      cost: record.cost != null ? Number(record.cost) : null,
      date: record.date ? new Date(record.date as string).toISOString() : null,
    }))
    .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime());

  const latestMaintenance = maintenanceHistory[0]?.date ?? (machine.lastMaintenance ? new Date(machine.lastMaintenance as string).toISOString() : null);

  return {
    ...machineWithoutPrintMethodCompatibility,
    lastMaintenance: latestMaintenance,
    maintenanceHistory,
    costPerHour:         n(machine.costPerHour),
    speedM2PerHour:      n(machine.speedM2PerHour),
    inkPerM2:            n(machine.inkPerM2),
    materialPerM2:       n(machine.materialPerM2),
    headAmortPerM2:      n(machine.headAmortPerM2),
    printerAmortPerM2:   n(machine.printerAmortPerM2),
    maintCostPerM2:      n(machine.maintCostPerM2),
    operatorCostPerHour: n(machine.operatorCostPerHour),
    energyConsumptionKw: n(machine.energyConsumptionKw),
    purchaseCostMdl: n(machine.purchaseCostMdl),
    expectedLifetimePages: machine.expectedLifetimePages != null ? Number(machine.expectedLifetimePages) : null,
    electricityCostPerKwh: n(machine.electricityCostPerKwh),
    costClickColor:      n(machine.costClickColor),
    costClickBW:         n(machine.costClickBW),
    servicePerClick:     n(machine.servicePerClick),
    speedProfiles: Array.isArray(machine.speedProfiles) ? machine.speedProfiles as unknown[] : null,
    maintenanceComponents: Array.isArray(machine.maintenanceComponents) ? machine.maintenanceComponents as unknown[] : null,
    tonerConsumables: Array.isArray(machine.tonerConsumables) ? machine.tonerConsumables as unknown[] : null,
  };
}

async function enrichWithMaterials<T extends { id: string; compatibleMaterialIds?: string[] | null }>(
  machines: T[]
): Promise<(T & { compatibleMaterials: { id: string; name: string; unit: string }[] })[]> {
  const allIds = [...new Set(machines.flatMap((m) => Array.isArray(m.compatibleMaterialIds) ? m.compatibleMaterialIds : [] ))];
  const materials = allIds.length > 0
    ? await prisma.material.findMany({
        where: { id: { in: allIds } },
        select: { id: true, name: true, unit: true },
      })
    : [];
  const byId = new Map(materials.map((m) => [m.id, m]));
  return machines.map((machine) => ({
    ...machine,
    compatibleMaterials: (Array.isArray(machine.compatibleMaterialIds) ? machine.compatibleMaterialIds : [])
      .map((id) => byId.get(id))
      .filter(Boolean) as { id: string; name: string; unit: string }[],
  }));
}

async function validateMaterialIds(ids: string[]): Promise<string | null> {
  if (ids.length === 0) return null;
  const found = await prisma.material.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    return 'Unul sau mai multe materiale selectate nu există';
  }
  return null;
}

async function enrichWithConsumables<T extends { id: string }>(
  machines: T[]
): Promise<(T & { consumables: SerializedEquipmentConsumable[] })[]> {
  const machineIds = machines.map((m) => m.id);
  const consumables = machineIds.length > 0
    ? await prisma.equipmentConsumable.findMany({
        where: { machineId: { in: machineIds }, active: true },
        include: {
          material: {
            select: {
              id: true,
              name: true,
              unit: true,
              stock: true,
              purchasePrice: true,
            },
          },
        },
      })
    : [];
  
  const byMachineId = new Map<string, SerializedEquipmentConsumable[]>();
  consumables.forEach((c: EquipmentConsumableRecord) => {
    if (!byMachineId.has(c.machineId)) {
      byMachineId.set(c.machineId, []);
    }
    byMachineId.get(c.machineId)!.push({
      ...c,
      consumptionPerSqm: c.consumptionPerSqm ? Number(c.consumptionPerSqm) : null,
      consumptionPerUnit: c.consumptionPerUnit ? Number(c.consumptionPerUnit) : null,
      consumptionPerJob: c.consumptionPerJob ? Number(c.consumptionPerJob) : null,
      material: {
        ...c.material,
        purchasePrice: c.material.purchasePrice ? Number(c.material.purchasePrice) : null,
      },
    });
  });
  
  return machines.map((machine) => ({
    ...machine,
    consumables: byMachineId.get(machine.id) || [],
  }));
}

function validateByType(body: Record<string, unknown>): string | null {
  return validateMachinePayload(body);
}

// ─── GET /api/admin/machines ─────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const machines = await prisma.machine.findMany({
      orderBy: { name: 'asc' },
    });

    const machineIds = machines.map((machine) => machine.id);
    const maintenanceHistory = machineIds.length > 0
      ? await prisma.machineMaintenanceRecord.findMany({
          where: { machineId: { in: machineIds } },
          orderBy: { date: 'desc' },
        })
      : [];

    const historyByMachineId = new Map<string, typeof maintenanceHistory>();
    for (const record of maintenanceHistory) {
      const existing = historyByMachineId.get(record.machineId) ?? [];
      existing.push(record);
      historyByMachineId.set(record.machineId, existing);
    }

    const enrichedWithMaterials = await enrichWithMaterials(
      machines as unknown as { id: string; compatibleMaterialIds: string[] }[]
    );
    const enrichedWithConsumables = await enrichWithConsumables(
      enrichedWithMaterials as unknown as { id: string }[]
    );

    return NextResponse.json(
      enrichedWithConsumables.map((m) => {
        const mat = (m as unknown as { compatibleMaterials: { id: string; name: string; unit: string }[] }).compatibleMaterials;
        const cons = (m as unknown as { consumables: SerializedEquipmentConsumable[] }).consumables;
        const history = historyByMachineId.get(m.id) ?? [];
        const serialized = serializeMachine({
          ...m,
          maintenanceHistory: history,
        } as unknown as Record<string, unknown>);

        return {
          ...serialized,
          maintenanceHistory: history.map((record) => ({
            ...record,
            type: normalizeMaintenanceType(record.type as string),
            cost: record.cost != null ? Number(record.cost) : null,
            date: record.date ? new Date(record.date).toISOString() : null,
          })),
          compatibleMaterials: mat,
          consumables: cons,
        };
      })
    );
  } catch (error) {
    console.error('Error fetching machines:', error);
    return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 });
  }
}

// ─── POST /api/admin/machines ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;

    const { name, type } = body as { name?: string; type?: string };
    if (!name || !type) {
      return NextResponse.json({ error: 'Numele și tipul sunt obligatorii' }, { status: 400 });
    }

    const validationError = validateByType(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 422 });
    }

    const matIds = Array.isArray(body.compatibleMaterialIds) ? (body.compatibleMaterialIds as string[]) : [];
    const matIdsError = await validateMaterialIds(matIds);
    if (matIdsError) {
      return NextResponse.json({ error: matIdsError }, { status: 422 });
    }

    const {
      equipmentType, status,
      costPerHour, speed, maxWidth, maxHeight, printMarginsMm,
      operatorCostPerHour, energyConsumptionKw, purchaseCostMdl, expectedLifetimePages,
      electricityCostPerKwh, speedProfiles, maintenanceComponents, tonerConsumables,
      speedM2PerHour, inkPerM2, materialPerM2, headAmortPerM2, printerAmortPerM2, maintCostPerM2,
      costClickColor, costClickBW, servicePerClick, maxFormat, maxGramWeight, speedPpm,
      compatibleMaterialIds,
      description, notes, active, maintenanceHistory,
    } = body as Record<string, unknown>;

    const n = (v: unknown) => (v != null ? Number(v) : null);
    const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
    const resolvedEquipmentType: EquipmentType = EQUIPMENT_TYPES.includes(normalizeEquipmentType(equipmentType as string) as EquipmentType)
      ? (normalizeEquipmentType(equipmentType as string) as EquipmentType)
      : 'DIGITAL_COLOR';
    const resolvedStatus: MachineStatus = MACHINE_STATUSES.includes(status as MachineStatus)
      ? (status as MachineStatus)
      : 'AVAILABLE';

    const normalizedMaintenanceHistory = Array.isArray(maintenanceHistory) ? maintenanceHistory as Record<string, unknown>[] : [];
    const computedLastMaintenance = normalizedMaintenanceHistory.length > 0
      ? new Date(Math.max(...normalizedMaintenanceHistory.map((entry) => new Date(String(entry.date ?? 0)).getTime()))).toISOString()
      : null;

    const machine = await prisma.machine.create({
      data: {
        name: name as string,
        type: type as string,
        equipmentType: resolvedEquipmentType,
        status: resolvedStatus,
        costPerHour:         n(costPerHour),
        speed:               (speed as string) ?? null,
        maxWidth:            n(maxWidth),
        maxHeight:           n(maxHeight),
        printMarginsMm:      n(printMarginsMm),
        operatorCostPerHour: n(operatorCostPerHour),
        energyConsumptionKw: n(energyConsumptionKw),
        purchaseCostMdl: n(purchaseCostMdl),
        expectedLifetimePages: n(expectedLifetimePages) != null ? Math.round(n(expectedLifetimePages)!) : null,
        electricityCostPerKwh: n(electricityCostPerKwh),
        speedProfiles: Array.isArray(speedProfiles) ? speedProfiles : null,
        maintenanceComponents: Array.isArray(maintenanceComponents) ? maintenanceComponents : null,
        tonerConsumables: Array.isArray(tonerConsumables) ? tonerConsumables : null,
        speedM2PerHour:      n(speedM2PerHour),
        inkPerM2:            n(inkPerM2),
        materialPerM2:       n(materialPerM2),
        headAmortPerM2:      n(headAmortPerM2),
        printerAmortPerM2:   n(printerAmortPerM2),
        maintCostPerM2:      n(maintCostPerM2),
        costClickColor:      n(costClickColor),
        costClickBW:         n(costClickBW),
        servicePerClick:     n(servicePerClick),
        maxFormat:           (maxFormat as string) || null,
        maxGramWeight:       n(maxGramWeight) != null ? Math.round(n(maxGramWeight)!) : null,
        speedPpm:            n(speedPpm) != null ? Math.round(n(speedPpm)!) : null,
        compatibleMaterialIds: arr(compatibleMaterialIds),
        description: (description as string) ?? null,
        notes:       (notes as string) ?? null,
        lastMaintenance: computedLastMaintenance ? new Date(computedLastMaintenance) : null,
        active: active !== undefined ? Boolean(active) : true,
        maintenanceHistory: {
          create: normalizedMaintenanceHistory.map((record) => {
            const recordId = typeof record.id === 'string' && record.id.trim() ? record.id : crypto.randomUUID();
            return {
              id: recordId,
              date: new Date(String(record.date)),
              type: toDbMaintenanceType(String(record.type ?? 'Preventive')) as any,
              description: String(record.description ?? 'Maintenance record'),
              cost: record.cost != null ? Number(record.cost) : null,
              technician: record.technician ? String(record.technician) : null,
              notes: record.notes ? String(record.notes) : null,
            };
          }),
        },
      },
      include: {
        maintenanceHistory: {
          orderBy: { date: 'desc' },
        },
      },
    });

    const [withMaterials] = await enrichWithMaterials([
      machine as unknown as { id: string; compatibleMaterialIds: string[] },
    ]);
    const serialized = serializeMachine(withMaterials as unknown as Record<string, unknown>);
    return NextResponse.json({ ...serialized, compatibleMaterials: withMaterials.compatibleMaterials }, { status: 201 });
  } catch (error) {
    console.error('Error creating machine:', error);
    return NextResponse.json({ error: 'Failed to create machine' }, { status: 500 });
  }
}
