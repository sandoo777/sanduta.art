import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = 'postgresql://postgres:password@localhost:5432/sanduta';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

const models = [
  'user',
  'materialCategory',
  'category',
  'product',
  'material',
  'supplier',
  'machine',
  'machineMaintenanceRecord',
  'order',
  'purchaseOrder',
  'inventoryItem',
  'productionJob',
  'equipmentConsumable',
  'printMethod',
  'orderItem',
  'purchaseOrderLine',
  'orderTimeline',
];

async function main() {
  const results: Record<string, { ok: boolean; count: number; error?: string }> = {};

  for (const model of models) {
    const client = prisma as any;
    if (!client[model] || typeof client[model].findMany !== 'function') {
      results[model] = { ok: false, count: 0, error: 'missing model client' };
      continue;
    }

    try {
      const rows = await client[model].findMany({ take: 1 });
      results[model] = { ok: true, count: rows.length };
    } catch (error) {
      results[model] = {
        ok: false,
        count: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
