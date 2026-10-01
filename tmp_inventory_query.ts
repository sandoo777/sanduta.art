import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = 'postgresql://postgres:password@localhost:5432/sanduta';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

async function main() {
  try {
    const rows = await prisma.inventoryItem.findMany({ take: 5 });
    console.log('INVENTORY_COUNT', rows.length);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('INVENTORY_QUERY_ERROR', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
