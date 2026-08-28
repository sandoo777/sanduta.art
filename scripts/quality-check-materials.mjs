/**
 * Data quality checks for materials table
 * Run: npx tsx scripts/quality-check-materials.mjs
 */
import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

let passed = 0;
let failed = 0;

function ok(label) { console.log(`  PASS  ${label}`); passed++; }
function fail(label, detail) { console.log(`  FAIL  ${label}`, detail); failed++; }

const all = await prisma.material.findMany({
  select: { id: true, sku: true, name: true, purchasePrice: true, salePrice: true, unit: true, stock: true, minStock: true, active: true, categoryId: true },
});

// 1. SKU duplicates
const skuMap = {};
for (const m of all) { skuMap[m.sku] = (skuMap[m.sku] || 0) + 1; }
const dups = Object.entries(skuMap).filter(([, c]) => c > 1);
dups.length === 0 ? ok('No SKU duplicates') : fail('SKU duplicates found', dups);

// 2. Missing SKU
const noSku = all.filter(m => !m.sku);
noSku.length === 0 ? ok('All materials have SKU') : fail('Materials missing SKU', noSku.map(m => m.name));

// 3. Missing purchasePrice or salePrice
const missingPrice = all.filter(m => m.purchasePrice === null || m.salePrice === null);
missingPrice.length === 0 ? ok('All materials have purchasePrice and salePrice') : fail('Missing prices', missingPrice.map(m => m.sku));

// 4. salePrice < purchasePrice
const saleBelowPurchase = all.filter(m =>
  m.purchasePrice !== null && m.salePrice !== null &&
  Number(m.salePrice) < Number(m.purchasePrice)
);
saleBelowPurchase.length === 0 ? ok('No salePrice < purchasePrice') : fail('salePrice below purchasePrice', saleBelowPurchase.map(m => `${m.sku}: purchase=${m.purchasePrice} sale=${m.salePrice}`));

// 5. Negative stock
const negStock = all.filter(m => m.stock < 0);
negStock.length === 0 ? ok('No negative stock') : fail('Negative stock', negStock.map(m => `${m.sku}: ${m.stock}`));

// 6. Missing categoryId
const noCat = all.filter(m => !m.categoryId);
noCat.length === 0 ? ok('All materials have categoryId') : fail('Missing categoryId', noCat.map(m => m.sku));

// 7. Unit distribution
const units = {};
for (const m of all) { units[m.unit] = (units[m.unit] || 0) + 1; }
console.log('\n  Units distribution:', Object.entries(units).map(([u, c]) => `${u}:${c}`).join(', '));

// Summary table
console.log('\n  === MATERIALS DATA QUALITY SUMMARY ===');
console.table(all.map(m => ({
  sku: m.sku,
  name: m.name.substring(0, 28),
  unit: m.unit,
  purchase: Number(m.purchasePrice),
  sale: Number(m.salePrice),
  stock: m.stock,
  minStock: m.minStock,
  low_stock: m.stock <= m.minStock,
  active: m.active,
})));

console.log(`\n  Result: ${passed} passed, ${failed} failed`);

await pool.end();
process.exit(failed > 0 ? 1 : 0);
