import { prisma } from './src/lib/prisma';

async function main() {
  const result = await prisma.$executeRawUnsafe(`
    UPDATE public.machine_maintenance_records
    SET type = CASE
      WHEN type = 'Preventive' THEN 'PREVENTIVE'
      WHEN type = 'Corrective' THEN 'CORRECTIVE'
      WHEN type = 'Calibration' THEN 'CALIBRATION'
      WHEN type = 'Repair' THEN 'REPAIR'
      WHEN type = 'Part Replacement' THEN 'PART_REPLACEMENT'
      WHEN type = 'Inspection' THEN 'INSPECTION'
      WHEN type = 'PREVENTIVE' THEN 'PREVENTIVE'
      WHEN type = 'CORRECTIVE' THEN 'CORRECTIVE'
      WHEN type = 'CALIBRATION' THEN 'CALIBRATION'
      WHEN type = 'REPAIR' THEN 'REPAIR'
      WHEN type = 'PART_REPLACEMENT' THEN 'PART_REPLACEMENT'
      WHEN type = 'INSPECTION' THEN 'INSPECTION'
      ELSE 'PREVENTIVE'
    END
    WHERE type IS NOT NULL;
  `);

  const rows = await prisma.$queryRawUnsafe('SELECT id, "machineId", type FROM public.machine_maintenance_records ORDER BY "createdAt" DESC');
  console.log(JSON.stringify({ updated: result, rows }, null, 2));
  await prisma.$disconnect();
}

main();