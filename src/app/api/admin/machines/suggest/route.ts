import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, MachineStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Returnează echipamentele compatibile cu o metodă de tipărire și/sau un material.
 * Filtrare: active=true, status=AVAILABLE, compatibilitate cu method/material.
 *
 * GET /api/admin/machines/suggest?printMethodId=xxx&materialId=xxx
 */

export interface CompatibleMachine {
  id: string;
  name: string;
  type: string;
  equipmentType: string;
  status: string;
  // Câmpuri comune
  costPerHour: number | null;
  // LARGE_FORMAT — viteză + costuri per m²
  speedM2PerHour: number | null;
  inkPerM2: number | null;
  materialPerM2: number | null;
  headAmortPerM2: number | null;
  printerAmortPerM2: number | null;
  maintCostPerM2: number | null;
  // DIGITAL — viteză + costuri click
  speedPpm: number | null;
  costClickColor: number | null;
  costClickBW: number | null;
}

export async function getCompatibleEquipment({
  printMethodId,
  materialId,
  excludeStatuses = ['BUSY', 'MAINTENANCE'],
}: {
  printMethodId?: string;
  materialId?: string;
  excludeStatuses?: string[];
}): Promise<CompatibleMachine[]> {
  const where: {
    active: boolean;
    status: { notIn: MachineStatus[] };
    compatiblePrintMethodIds?: { has: string };
    compatibleMaterialIds?: { has: string };
  } = {
    active: true,
    status: { notIn: excludeStatuses as MachineStatus[] },
  };

  if (printMethodId) {
    where.compatiblePrintMethodIds = { has: printMethodId };
  }

  if (materialId) {
    where.compatibleMaterialIds = { has: materialId };
  }

  const machines = await prisma.machine.findMany({
    where,
    select: {
      id: true,
      name: true,
      type: true,
      equipmentType: true,
      status: true,
      costPerHour: true,
      speedM2PerHour: true,
      inkPerM2: true,
      materialPerM2: true,
      headAmortPerM2: true,
      printerAmortPerM2: true,
      maintCostPerM2: true,
      speedPpm: true,
      costClickColor: true,
      costClickBW: true,
    },
    orderBy: [{ name: 'asc' }],
  });

  return machines.map((m) => ({
    ...m,
    costPerHour:       m.costPerHour       ? Number(m.costPerHour)       : null,
    speedM2PerHour:    m.speedM2PerHour    ? Number(m.speedM2PerHour)    : null,
    inkPerM2:          m.inkPerM2          ? Number(m.inkPerM2)          : null,
    materialPerM2:     m.materialPerM2     ? Number(m.materialPerM2)     : null,
    headAmortPerM2:    m.headAmortPerM2    ? Number(m.headAmortPerM2)    : null,
    printerAmortPerM2: m.printerAmortPerM2 ? Number(m.printerAmortPerM2) : null,
    maintCostPerM2:    m.maintCostPerM2    ? Number(m.maintCostPerM2)    : null,
    speedPpm:          m.speedPpm          ?? null,
    costClickColor:    m.costClickColor    ? Number(m.costClickColor)    : null,
    costClickBW:       m.costClickBW       ? Number(m.costClickBW)       : null,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER', 'OPERATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const printMethodId = searchParams.get('printMethodId') ?? undefined;
    const materialId    = searchParams.get('materialId')    ?? undefined;

    const machines = await getCompatibleEquipment({ printMethodId, materialId });

    let message: string | undefined;
    if (machines.length === 0) {
      if (printMethodId && materialId) {
        message = 'Niciun echipament activ nu suportă simultan această metodă și acest material';
      } else if (printMethodId) {
        message = 'Niciun echipament activ nu suportă această metodă de tipărire';
      } else if (materialId) {
        message = 'Niciun echipament activ nu suportă acest material';
      } else {
        message = 'Niciun echipament disponibil momentan';
      }
    }

    return NextResponse.json({ machines, message });
  } catch (error) {
    console.error('Error fetching suggested machines:', error);
    return NextResponse.json({ error: 'Failed to fetch compatible machines' }, { status: 500 });
  }
}
