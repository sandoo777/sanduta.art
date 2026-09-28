import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

const tables = [
  'materials',
  'material_price_breaks',
  'material_suppliers',
  'suppliers',
  'print_methods',
  '_PrintMethodMaterials',
  'material_categories',
  'inventory_items',
  'job_material_usages'
];

try {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT table_name, column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = ANY($1)
     ORDER BY table_name, ordinal_position`,
    tables
  );
  console.log(JSON.stringify(rows, null, 2));
} catch (error) {
  console.error('SCHEMA_QUERY_ERROR');
  console.error(error);
} finally {
  await prisma.$disconnect();
}
