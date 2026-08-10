import { MachineStatus, type ProductionStatus } from "@prisma/client";

const PRODUCTION_STATUS_TRANSITIONS: Record<ProductionStatus, ProductionStatus[]> = {
  PENDING: ["IN_PROGRESS", "ON_HOLD", "CANCELED"],
  IN_PROGRESS: ["ON_HOLD", "COMPLETED", "CANCELED"],
  ON_HOLD: ["IN_PROGRESS", "CANCELED"],
  COMPLETED: [],
  CANCELED: [],
};

export function canTransitionProductionStatus(
  currentStatus: ProductionStatus,
  nextStatus: ProductionStatus,
): boolean {
  if (currentStatus === nextStatus) return true;
  return PRODUCTION_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
}

type OutsourceFinancialsInput = {
  quantity: number;
  supplierCostPerUnit?: number | null;
  supplierCostPerM2?: number | null;
  markupPercent?: number | null;
};

type OutsourceFinancialsResult = {
  estimatedCost: number;
  outsourcedCost: number;
  outsourcedProfit: number;
};

export function calculateOutsourceFinancials({
  quantity,
  supplierCostPerUnit,
  supplierCostPerM2,
  markupPercent,
}: OutsourceFinancialsInput): OutsourceFinancialsResult {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const unitCost = Number(supplierCostPerUnit ?? 0);
  const sqmCost = Number(supplierCostPerM2 ?? 0);
  const markup = Number(markupPercent ?? 0);

  const outsourcedCost = safeQuantity * (unitCost + sqmCost);
  const outsourcedProfit = outsourcedCost * (markup / 100);

  return {
    estimatedCost: outsourcedCost,
    outsourcedCost,
    outsourcedProfit,
  };
}

export class MachineReservationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "MachineReservationError";
    this.statusCode = statusCode;
  }
}

type MachineReservationDb = {
  machine: {
    updateMany: (args: {
      where: { id: string; active: true; status: MachineStatus };
      data: { status: MachineStatus };
    }) => Promise<{ count: number }>;
    findUnique: (args: {
      where: { id: string };
      select: { name: true; active: true; status: true };
    }) => Promise<{
      name: string;
      active: boolean;
      status: MachineStatus;
    } | null>;
  };
};

export async function reserveMachineAtomically(db: MachineReservationDb, machineId: string): Promise<void> {
  const reserved = await db.machine.updateMany({
    where: {
      id: machineId,
      active: true,
      status: MachineStatus.AVAILABLE,
    },
    data: {
      status: MachineStatus.BUSY,
    },
  });

  if (reserved.count === 1) {
    return;
  }

  const machine = await db.machine.findUnique({
    where: { id: machineId },
    select: {
      name: true,
      active: true,
      status: true,
    },
  });

  if (!machine) {
    throw new MachineReservationError("Machine not found", 404);
  }

  if (!machine.active) {
    throw new MachineReservationError(`Echipamentul "${machine.name}" este inactiv`, 409);
  }

  if (machine.status === MachineStatus.BUSY) {
    throw new MachineReservationError(`Echipamentul "${machine.name}" este deja ocupat de alt job`, 409);
  }

  if (machine.status === MachineStatus.MAINTENANCE) {
    throw new MachineReservationError(`Echipamentul "${machine.name}" este în mentenanță`, 409);
  }

  throw new MachineReservationError(`Echipamentul "${machine.name}" nu poate fi alocat`, 409);
}