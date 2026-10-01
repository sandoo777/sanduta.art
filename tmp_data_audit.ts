import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

const checks = [
  ['users', 'user'],
  ['categories', 'category'],
  ['products', 'product'],
  ['materials', 'material'],
  ['suppliers', 'supplier'],
  ['inventory_items', 'inventoryItem'],
  ['machines', 'machine'],
  ['machine_maintenance_records', 'machineMaintenanceRecord'],
  ['orders', 'order'],
  ['purchase_orders', 'purchaseOrder'],
  ['production_jobs', 'productionJob'],
] as const;

async function main() {
  const counts: Record<string, number | string> = {};

  for (const [table, model] of checks) {
    try {
      counts[table] = await (prisma as any)[model].count();
    } catch (error) {
      counts[table] = 'MISSING_TABLE_OR_MODEL';
    }
  }

  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
