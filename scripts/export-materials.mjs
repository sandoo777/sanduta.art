/**
 * Materials module export script — generates structured JSON for audit
 * Run: npx tsx scripts/export-materials.mjs
 */
import { config } from 'dotenv';
config(); // loads .env from cwd
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const [materials, categories] = await Promise.all([
    prisma.material.findMany({
      include: {
        category: true,
        compatibleMethods: {
          select: { id: true, name: true, type: true, active: true },
        },
        consumption: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            quantity: true,
            unit: true,
            wastePercent: true,
            totalUsed: true,
            cost: true,
            createdAt: true,
            jobId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.materialCategory.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  const output = {
    exported_at: new Date().toISOString(),
    exported_by: 'Copilot/export-materials.mjs',
    schema_version: '1.0.0',
    stats: {
      total_materials: materials.length,
      active_materials: materials.filter((m) => m.active).length,
      inactive_materials: materials.filter((m) => !m.active).length,
      materials_with_sku: materials.filter((m) => m.sku).length,
      materials_missing_sku: materials.filter((m) => !m.sku).length,
      materials_low_stock: materials.filter((m) => m.stock <= m.minStock).length,
      total_categories: categories.length,
      active_categories: categories.filter((c) => c.active).length,
    },
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description ?? null,
      parentId: c.parentId ?? null,
      active: c.active,
      flags: {
        requiresThickness: c.requiresThickness,
        requiresDensity: c.requiresDensity,
        requiresPricePerSqm: c.requiresPricePerSqm,
        requiresPricePerMeter: c.requiresPricePerMeter,
        requiresPricePerUnit: c.requiresPricePerUnit,
        requiresWastePercent: c.requiresWastePercent,
      },
      created_at: c.createdAt.toISOString(),
      updated_at: c.updatedAt.toISOString(),
    })),
    materials: materials.map((m) => ({
      id: m.id,
      sku: m.sku ?? null,
      name: m.name,
      category_id: m.categoryId,
      category_name: m.category?.name ?? null,
      unit: m.unit,
      consumption_type: m.consumptionType,
      active: m.active,
      stock: Number(m.stock),
      min_stock: Number(m.minStock),
      low_stock: Number(m.stock) <= Number(m.minStock),
      attributes: {
        thickness_mm: m.thickness ?? null,
        density: m.density ?? null,
        finish: m.finishType ?? null,
        waste_percent: m.wastePercent,
        packaging_label: m.packagingLabel ?? null,
        packaging_qty: m.packagingQty ?? null,
        properties: m.properties ?? null,
      },
      pricing: {
        purchase_price: m.purchasePrice !== null ? Number(m.purchasePrice) : null,
        sale_price: m.salePrice !== null ? Number(m.salePrice) : null,
        sale_price_mode: m.salePriceMode,
        sale_price_percent: m.salePricePercent ?? null,
        packaging_price: m.packagingPrice !== null ? Number(m.packagingPrice) : null,
      },
      compatible_methods: m.compatibleMethods.map((pm) => ({
        id: pm.id,
        name: pm.name,
        type: pm.type,
        active: pm.active,
      })),
      consumption_history: m.consumption.map((c) => ({
        id: c.id,
        job_id: c.jobId,
        quantity: Number(c.quantity),
        unit: c.unit,
        waste_percent: Number(c.wastePercent),
        total_used: Number(c.totalUsed),
        cost: Number(c.cost),
        recorded_at: c.createdAt.toISOString(),
      })),
      notes: m.notes ?? null,
      created_at: m.createdAt.toISOString(),
      updated_at: m.updatedAt.toISOString(),
    })),
  };

  process.stdout.write(JSON.stringify(output, null, 2));
}

main()
  .catch((e) => { process.stderr.write(String(e) + '\n'); process.exit(1); })
  .finally(() => prisma.$disconnect());
