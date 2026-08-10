import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EquipmentType, MachineStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
const EQUIPMENT_TYPES: EquipmentType[] = ['LARGE_FORMAT', 'DIGITAL', 'HOURLY'];
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

async function enrichWithPrintMethods<T extends { id: string; compatiblePrintMethodIds: string[] }>(
  machines: T[]
): Promise<(T & { compatiblePrintMethods: { id: string; name: string; type: string }[] })[]> {
  const allIds = [...new Set(machines.flatMap((m) => m.compatiblePrintMethodIds))];
  const methods = allIds.length > 0
    ? await prisma.printMethod.findMany({
        where: { id: { in: allIds } },
        select: { id: true, name: true, type: true },
      })
    : [];
  const byId = new Map(methods.map((m) => [m.id, m]));
  return machines.map((machine) => ({
    ...machine,
    compatiblePrintMethods: machine.compatiblePrintMethodIds
      .map((id) => byId.get(id))
      .filter(Boolean) as { id: string; name: string; type: string }[],
  }));
}

async function validatePrintMethodIds(ids: string[]): Promise<string | null> {
  if (ids.length === 0) return null;
  const found = await prisma.printMethod.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    return 'Una sau mai multe metode de tipărire selectate nu există';
  }
  return null;
}

async function enrichWithMaterials<T extends { id: string; compatibleMaterialIds: string[] }>(
  machines: T[]
): Promise<(T & { compatibleMaterials: { id: string; name: string; unit: string }[] })[]> {
  const allIds = [...new Set(machines.flatMap((m) => m.compatibleMaterialIds))];
  const materials = allIds.length > 0
    ? await prisma.material.findMany({
        where: { id: { in: allIds } },
        select: { id: true, name: true, unit: true },
      })
    : [];
  const byId = new Map(materials.map((m) => [m.id, m]));
  return machines.map((machine) => ({
    ...machine,
    compatibleMaterials: machine.compatibleMaterialIds
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
  const { equipmentType, compatibleMaterialIds, compatiblePrintMethodIds } = body as {
    equipmentType?: string;
    compatibleMaterialIds?: string[];
    compatiblePrintMethodIds?: string[];
  };

  if (!compatibleMaterialIds || compatibleMaterialIds.length === 0) {
    return 'Trebuie selectat cel puțin un material compatibil';
  }
  if (!compatiblePrintMethodIds || compatiblePrintMethodIds.length === 0) {
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

// ─── GET /api/admin/machines ─────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const machines = await prisma.machine.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    });

    const enriched = await enrichWithPrintMethods(
      machines as unknown as { id: string; compatiblePrintMethodIds: string[] }[]
    );
    const enrichedWithMaterials = await enrichWithMaterials(
      enriched as unknown as { id: string; compatibleMaterialIds: string[] }[]
    );
    const enrichedWithConsumables = await enrichWithConsumables(
      enrichedWithMaterials as unknown as { id: string }[]
    );

    return NextResponse.json(
      enrichedWithConsumables.map((m) => {
        const pm = (m as unknown as { compatiblePrintMethods: { id: string; name: string; type: string }[] }).compatiblePrintMethods;
        const mat = (m as unknown as { compatibleMaterials: { id: string; name: string; unit: string }[] }).compatibleMaterials;
        const cons = (m as unknown as { consumables: SerializedEquipmentConsumable[] }).consumables;
        return { 
          ...serializeMachine(m as unknown as Record<string, unknown>, pm), 
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

    const methodIds = Array.isArray(body.compatiblePrintMethodIds) ? (body.compatiblePrintMethodIds as string[]) : [];
    const idsError = await validatePrintMethodIds(methodIds);
    if (idsError) {
      return NextResponse.json({ error: idsError }, { status: 422 });
    }

    const matIds = Array.isArray(body.compatibleMaterialIds) ? (body.compatibleMaterialIds as string[]) : [];
    const matIdsError = await validateMaterialIds(matIds);
    if (matIdsError) {
      return NextResponse.json({ error: matIdsError }, { status: 422 });
    }

    const {
      equipmentType, status,
      costPerHour, speed, maxWidth, maxHeight,
      operatorCostPerHour, energyConsumptionKw,
      speedM2PerHour, inkPerM2, materialPerM2, headAmortPerM2, printerAmortPerM2, maintCostPerM2,
      costClickColor, costClickBW, servicePerClick, maxFormat, maxGramWeight, speedPpm,
      compatibleMaterialIds, compatiblePrintMethodIds,
      description, notes, lastMaintenance, active,
    } = body as Record<string, unknown>;

    const n = (v: unknown) => (v != null ? Number(v) : null);
    const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
    const resolvedEquipmentType: EquipmentType = EQUIPMENT_TYPES.includes(equipmentType as EquipmentType)
      ? (equipmentType as EquipmentType)
      : 'HOURLY';
    const resolvedStatus: MachineStatus = MACHINE_STATUSES.includes(status as MachineStatus)
      ? (status as MachineStatus)
      : 'AVAILABLE';

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
        operatorCostPerHour: n(operatorCostPerHour),
        energyConsumptionKw: n(energyConsumptionKw),
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
        compatibleMaterialIds:    arr(compatibleMaterialIds),
        compatiblePrintMethodIds: arr(compatiblePrintMethodIds),
        description: (description as string) ?? null,
        notes:       (notes as string) ?? null,
        lastMaintenance: lastMaintenance ? new Date(lastMaintenance as string) : null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    const [withMethods] = await enrichWithPrintMethods([
      machine as unknown as { id: string; compatiblePrintMethodIds: string[] },
    ]);
    const [withMaterials] = await enrichWithMaterials([
      withMethods as unknown as { id: string; compatibleMaterialIds: string[] },
    ]);
    const serialized = serializeMachine(
      withMaterials as unknown as Record<string, unknown>,
      withMethods.compatiblePrintMethods
    );
    return NextResponse.json({ ...serialized, compatibleMaterials: withMaterials.compatibleMaterials }, { status: 201 });
  } catch (error) {
    console.error('Error creating machine:', error);
    return NextResponse.json({ error: 'Failed to create machine' }, { status: 500 });
  }
}
