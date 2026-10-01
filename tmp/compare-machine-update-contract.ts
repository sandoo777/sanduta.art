import { prisma } from '../src/lib/prisma';
import { validateMachinePayload } from '../src/modules/machines/validation';

function buildUpdateData(body: Record<string, unknown>) {
  const n = (v: unknown) => (v != null ? Number(v) : null);
  const updateData: Record<string, unknown> = {};
  const rawMaintenanceHistory = Array.isArray(body.maintenanceHistory) ? body.maintenanceHistory as Record<string, unknown>[] : [];

  const scalarFields = ['name', 'type', 'equipmentType', 'status', 'speed', 'maxFormat', 'description', 'notes'] as const;
  for (const f of scalarFields) {
    if (f in body) updateData[f] = body[f] ?? null;
  }

  if ('active' in body) updateData.active = Boolean(body.active);

  if ('maxWidth' in body) updateData.maxWidth = body.maxWidth != null ? Math.round(n(body.maxWidth)!) : null;
  if ('maxHeight' in body) updateData.maxHeight = body.maxHeight != null ? Math.round(n(body.maxHeight)!) : null;
  if ('printMarginsMm' in body) updateData.printMarginsMm = body.printMarginsMm != null ? Number(n(body.printMarginsMm) ?? 0) : null;
  if ('maxGramWeight' in body) updateData.maxGramWeight = body.maxGramWeight != null ? Math.round(n(body.maxGramWeight)!) : null;
  if ('expectedLifetimePages' in body) updateData.expectedLifetimePages = body.expectedLifetimePages != null ? Math.round(n(body.expectedLifetimePages)!) : null;
  if ('speedPpm' in body) updateData.speedPpm = body.speedPpm != null ? Math.round(n(body.speedPpm)!) : null;

  const decimalFields = [
    'costPerHour', 'operatorCostPerHour', 'energyConsumptionKw', 'purchaseCostMdl', 'electricityCostPerKwh',
    'speedM2PerHour', 'inkPerM2', 'materialPerM2', 'headAmortPerM2',
    'printerAmortPerM2', 'maintCostPerM2',
    'costClickColor', 'costClickBW', 'servicePerClick',
  ] as const;
  for (const f of decimalFields) {
    if (f in body) updateData[f] = n(body[f]);
  }

  if ('compatibleMaterialIds' in body) updateData.compatibleMaterialIds = Array.isArray(body.compatibleMaterialIds) ? body.compatibleMaterialIds : [];
  if ('speedProfiles' in body) updateData.speedProfiles = Array.isArray(body.speedProfiles) ? body.speedProfiles : null;
  if ('maintenanceComponents' in body) updateData.maintenanceComponents = Array.isArray(body.maintenanceComponents) ? body.maintenanceComponents : null;
  if ('tonerConsumables' in body) updateData.tonerConsumables = Array.isArray(body.tonerConsumables) ? body.tonerConsumables : null;

  if (rawMaintenanceHistory.length > 0) {
    updateData.lastMaintenance = new Date();
    updateData.maintenanceHistory = {
      upsert: rawMaintenanceHistory.map((record) => ({
        where: { id: String(record.id ?? crypto.randomUUID()) },
        update: {
          date: new Date(String(record.date)),
          type: String(record.type ?? 'PREVENTIVE'),
          description: String(record.description ?? 'Maintenance record'),
          cost: record.cost != null ? Number(record.cost) : null,
          technician: record.technician ? String(record.technician) : null,
          notes: record.notes ? String(record.notes) : null,
        },
        create: {
          id: String(record.id ?? crypto.randomUUID()),
          date: new Date(String(record.date)),
          type: String(record.type ?? 'PREVENTIVE'),
          description: String(record.description ?? 'Maintenance record'),
          cost: record.cost != null ? Number(record.cost) : null,
          technician: record.technician ? String(record.technician) : null,
          notes: record.notes ? String(record.notes) : null,
        },
      })),
    };
  }

  return updateData;
}

async function main() {
  const all = await prisma.machine.findMany({ orderBy: { createdAt: 'asc' } });
  const oldMachine = all[0];
  const newMachine = all[all.length - 1];

  const pickPayload = (m: any) => ({
    name: m.name,
    type: m.type,
    equipmentType: m.equipmentType,
    status: m.status,
    speed: m.speed,
    maxWidth: m.maxWidth,
    maxHeight: m.maxHeight,
    printMarginsMm: m.printMarginsMm,
    operatorCostPerHour: m.operatorCostPerHour,
    energyConsumptionKw: m.energyConsumptionKw,
    purchaseCostMdl: m.purchaseCostMdl,
    expectedLifetimePages: m.expectedLifetimePages,
    electricityCostPerKwh: m.electricityCostPerKwh,
    costPerHour: m.costPerHour,
    speedM2PerHour: m.speedM2PerHour,
    inkPerM2: m.inkPerM2,
    materialPerM2: m.materialPerM2,
    headAmortPerM2: m.headAmortPerM2,
    printerAmortPerM2: m.printerAmortPerM2,
    maintCostPerM2: m.maintCostPerM2,
    costClickColor: m.costClickColor,
    costClickBW: m.costClickBW,
    servicePerClick: m.servicePerClick,
    maxFormat: m.maxFormat,
    maxGramWeight: m.maxGramWeight,
    speedPpm: m.speedPpm,
    speedProfiles: m.speedProfiles,
    maintenanceComponents: m.maintenanceComponents,
    tonerConsumables: m.tonerConsumables,
    compatibleMaterialIds: m.compatibleMaterialIds,
    compatiblePrintMethodIds: m.compatiblePrintMethodIds,
    description: m.description,
    notes: m.notes,
    active: m.active,
    maintenanceHistory: [],
  });

  const oldPayload = pickPayload(oldMachine);
  const newPayload = pickPayload(newMachine);

  const oldValidation = validateMachinePayload(oldPayload as any);
  const newValidation = validateMachinePayload(newPayload as any);

  const oldMatIds = Array.isArray(oldPayload.compatibleMaterialIds) ? oldPayload.compatibleMaterialIds : [];
  const newMatIds = Array.isArray(newPayload.compatibleMaterialIds) ? newPayload.compatibleMaterialIds : [];

  const oldMatCount = oldMatIds.length ? await prisma.material.count({ where: { id: { in: oldMatIds as string[] } } }) : 0;
  const newMatCount = newMatIds.length ? await prisma.material.count({ where: { id: { in: newMatIds as string[] } } }) : 0;

  const oldUpdateData = buildUpdateData(oldPayload as any);
  const newUpdateData = buildUpdateData(newPayload as any);

  const attempt = async (id: string, data: any) => {
    try {
      await prisma.machine.update({ where: { id }, data });
      return { ok: true };
    } catch (error: any) {
      return { ok: false, message: String(error?.message || error) };
    }
  };

  const oldResult = await attempt(oldMachine.id, oldUpdateData);
  const newResult = await attempt(newMachine.id, newUpdateData);

  console.log(JSON.stringify({
    oldMachine: { id: oldMachine.id, name: oldMachine.name, equipmentType: oldMachine.equipmentType, compatibleMaterialIds: oldMatIds },
    newMachine: { id: newMachine.id, name: newMachine.name, equipmentType: newMachine.equipmentType, compatibleMaterialIds: newMatIds },
    validation: { oldValidation, newValidation },
    materialValidation: {
      old: { ids: oldMatIds.length, found: oldMatCount },
      new: { ids: newMatIds.length, found: newMatCount },
    },
    updateAttempt: { oldResult, newResult },
  }, null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
});
