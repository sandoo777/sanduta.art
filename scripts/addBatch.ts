/**
 * Add material batch via CLI
 * Usage: npx tsx scripts/addBatch.ts --sku=BANNER-MESH-440 --batch=B-20260828 --qty=100 --location=WH-A
 * Optional: --qc=accepted|pending|rejected  (default: pending)
 *           --received=2026-08-28            (default: today)
 *           --expires=2027-08-28             (default: null)
 *           --notes="Some note"
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// ── Arg parser ──────────────────────────────────────────────────────────────
function parseArgs() {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)(?:=(.+))?$/);
    if (match) args[match[1]] = match[2] ?? 'true';
  }
  return args;
}

const args = parseArgs();

const sku = args['sku'];
const batchCode = args['batch'];
const qty = args['qty'] ? Number(args['qty']) : null;
const location = args['location'] ?? 'WH-DEFAULT';
const qcStatus = (args['qc'] ?? 'pending') as 'accepted' | 'pending' | 'rejected';
const receivedAt = args['received'] ? new Date(args['received']) : new Date();
const expiresAt = args['expires'] ? new Date(args['expires']) : null;
const notes = args['notes'] ?? null;

// ── Validation ──────────────────────────────────────────────────────────────
if (!sku || !batchCode || qty === null || Number.isNaN(qty) || qty <= 0) {
  console.error('Usage: npx tsx scripts/addBatch.ts --sku=<SKU> --batch=<CODE> --qty=<N> [--location=<LOC>] [--qc=accepted|pending|rejected]');
  process.exit(1);
}

if (!['accepted', 'pending', 'rejected'].includes(qcStatus)) {
  console.error('--qc must be one of: accepted, pending, rejected');
  process.exit(1);
}

// ── DB ──────────────────────────────────────────────────────────────────────
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Lookup material
  const material = await prisma.material.findUnique({
    where: { sku },
    select: { id: true, name: true, stock: true },
  });

  if (!material) {
    console.error(`Material with SKU "${sku}" not found.`);
    process.exit(1);
  }

  console.log(`Found material: [${sku}] ${material.name} (current stock: ${material.stock})`);

  // Insert batch into properties JSON (since no material_batches table exists yet,
  // we store batch metadata in properties and increment stock).
  const currentProps = await prisma.material.findUnique({
    where: { sku },
    select: { properties: true },
  });

  const existingBatches: Array<{
    batchCode: string;
    quantity: number;
    location: string;
    qcStatus: string;
    receivedAt: string;
    expiresAt: string | null;
    notes: string | null;
  }> = (currentProps?.properties as Record<string, unknown> | null)?.batches as typeof existingBatches ?? [];

  // Check batch code uniqueness
  const duplicate = existingBatches.find((b) => b.batchCode === batchCode);
  if (duplicate) {
    console.error(`Batch code "${batchCode}" already exists for this material.`);
    process.exit(1);
  }

  const newBatch = {
    batchCode,
    quantity: qty,
    location,
    qcStatus,
    receivedAt: receivedAt.toISOString(),
    expiresAt: expiresAt?.toISOString() ?? null,
    notes,
  };

  const updatedBatches = [...existingBatches, newBatch];

  // Update material: add batch to properties, increment stock if QC accepted
  const stockDelta = qcStatus === 'accepted' ? qty : 0;

  await prisma.material.update({
    where: { sku },
    data: {
      properties: {
        ...(currentProps?.properties as Record<string, unknown> | null ?? {}),
        batches: updatedBatches,
      },
      stock: { increment: stockDelta },
    },
  });

  const verb = stockDelta > 0 ? `stock +${stockDelta} (QC accepted)` : 'stock unchanged (QC pending/rejected)';
  console.log(`Batch "${batchCode}" added to [${sku}] — qty: ${qty}, location: ${location}, qc: ${qcStatus}, ${verb}`);

  // Show updated state
  const updated = await prisma.material.findUnique({
    where: { sku },
    select: { stock: true, properties: true },
  });
  console.log(`Updated stock: ${updated?.stock}`);
  console.log(`Total batches: ${updatedBatches.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => pool.end());
