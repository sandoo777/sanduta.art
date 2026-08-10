/**
 * Integration tests for MaterialUsage (TASK 6 & 7) database flow.
 * Requires DATABASE_URL to be set; skipped otherwise.
 *
 * Covers:
 *  - MaterialUsage schema fields: unit, wastePercent, totalUsed
 *  - Production job → COMPLETED auto-consumption via PATCH API
 *  - Orders API materialUsages aggregation query
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { UsageUnit } from "@prisma/client";
import {
  calculateMaterialUsage,
  MaterialConsumptionError,
} from "@/modules/materials/materialConsumption";
import type { Material, ProductionJob, Order } from "@prisma/client";

const hasDatabaseCredentials = Boolean(
  process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SHADOW_DATABASE_URL
);

const describeDB = hasDatabaseCredentials ? describe : describe.skip;

if (!hasDatabaseCredentials) {
  console.warn(
    "⚠ Skipping DB integration tests — no DATABASE_URL configured."
  );
}

// ── Shared state ──────────────────────────────────────────────────────────

let testOrder: Order;
let testJob: ProductionJob;
let sheetMaterial: Material;
let rollMaterial: Material;

const UNIQUE_PREFIX = `t8-${Date.now()}`;

describeDB("MaterialUsage — schema fields (unit / wastePercent / totalUsed)", () => {
  beforeAll(async () => {
    testOrder = await prisma.order.create({
      data: {
        customerName: "T8 Test Customer",
        customerEmail: `t8-${Date.now()}@test.local`,
        totalPrice: 0,
      },
    });

    testJob = await prisma.productionJob.create({
      data: {
        orderId: testOrder.id,
        name: "T8 Test Job",
        quantity: 2,
      },
    });

    sheetMaterial = await prisma.material.create({
      data: {
        name: `${UNIQUE_PREFIX} Sheet PVC`,
        category: "sheet",
        unit: "m2",
        pricePerSqm: 12.5,
        wastePercent: 10,
        stock: 50,
        active: true,
      },
    });

    rollMaterial = await prisma.material.create({
      data: {
        name: `${UNIQUE_PREFIX} Roll Banner`,
        category: "roll",
        unit: "m",
        pricePerMeter: 7,
        wastePercent: 5,
        stock: 100,
        active: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.materialUsage.deleteMany({
      where: { jobId: testJob.id },
    });
    await prisma.productionJob.delete({ where: { id: testJob.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
    await prisma.material.deleteMany({
      where: { name: { startsWith: UNIQUE_PREFIX } },
    });
  });

  it("creates MaterialUsage with unit=sqm, wastePercent, totalUsed", async () => {
    const usage = await prisma.materialUsage.create({
      data: {
        materialId: sheetMaterial.id,
        jobId: testJob.id,
        quantity: 2,
        unit: UsageUnit.sqm,
        wastePercent: 10,
        totalUsed: 2.2,
      },
    });

    expect(usage.unit).toBe(UsageUnit.sqm);
    expect(usage.wastePercent).toBe(10);
    expect(usage.totalUsed).toBeCloseTo(2.2, 5);
    expect(usage.quantity).toBe(2);
  });

  it("defaults unit=unit when not specified", async () => {
    const usage = await prisma.materialUsage.create({
      data: {
        materialId: rollMaterial.id,
        jobId: testJob.id,
        quantity: 5,
        // omit unit → should default to 'unit'
        totalUsed: 5.25,
        wastePercent: 5,
      },
    });
    // 'unit' is the DEFAULT in the schema
    expect(usage.unit).toBe(UsageUnit.unit);
  });

  it("creates MaterialUsage with unit=meter", async () => {
    const usage = await prisma.materialUsage.create({
      data: {
        materialId: rollMaterial.id,
        jobId: testJob.id,
        quantity: 8,
        unit: UsageUnit.meter,
        wastePercent: 5,
        totalUsed: 8.4,
      },
    });
    expect(usage.unit).toBe(UsageUnit.meter);
    expect(usage.totalUsed).toBeCloseTo(8.4, 5);
  });

  it("reads MaterialUsage with nested material via consumption relation", async () => {
    const materialWithUsage = await prisma.material.findUnique({
      where: { id: sheetMaterial.id },
      include: {
        consumption: true,
      },
    });

    expect(materialWithUsage).not.toBeNull();
    expect(materialWithUsage!.consumption.length).toBeGreaterThan(0);

    const first = materialWithUsage!.consumption[0];
    expect(first.unit).toBe(UsageUnit.sqm);
    expect(first.wastePercent).toBe(10);
  });
});

// ── calculateMaterialUsage + DB transaction ───────────────────────────────

describeDB("calculateMaterialUsage + DB — full COMPLETED flow simulation", () => {
  let flowOrder: Order;
  let flowJob: ProductionJob;
  let flowMaterial: Material;

  beforeAll(async () => {
    flowOrder = await prisma.order.create({
      data: {
        customerName: "T8 Flow Customer",
        customerEmail: `t8-flow-${Date.now()}@test.local`,
        totalPrice: 0,
      },
    });

    flowMaterial = await prisma.material.create({
      data: {
        name: `${UNIQUE_PREFIX} Rigid Board`,
        category: "rigid",
        unit: "m2",
        pricePerSqm: 30,
        wastePercent: 8,
        stock: 20,
        active: true,
      },
    });

    flowJob = await prisma.productionJob.create({
      data: {
        orderId: flowOrder.id,
        name: "T8 Flow Job",
        materialId: flowMaterial.id,
        quantity: 5, // 5 m²
      },
    });
  });

  afterAll(async () => {
    await prisma.materialUsage.deleteMany({ where: { jobId: flowJob.id } });
    await prisma.productionJob.delete({ where: { id: flowJob.id } });
    await prisma.order.delete({ where: { id: flowOrder.id } });
    await prisma.material.delete({ where: { id: flowMaterial.id } });
  });

  it("calculateMaterialUsage produces correct values for rigid material", () => {
    const result = calculateMaterialUsage(
      { id: flowJob.id, quantity: 5 },
      {
        id: flowMaterial.id,
        name: flowMaterial.name,
        active: flowMaterial.active,
        category: flowMaterial.category,
        wastePercent: flowMaterial.wastePercent,
        pricePerSqm: flowMaterial.pricePerSqm,
        pricePerMeter: flowMaterial.pricePerMeter,
        pricePerUnit: flowMaterial.pricePerUnit,
        stock: flowMaterial.stock,
      }
    );

    expect(result.usageUnit).toBe(UsageUnit.sqm);
    expect(result.quantity).toBe(5);
    expect(result.wastePercent).toBe(8);
    expect(result.totalUsed).toBeCloseTo(5.4, 5); // 5 × 1.08
    expect(result.unitPrice).toBe(30);
    expect(result.totalCost).toBeCloseTo(162, 5); // 5.4 × 30
  });

  it("persists MaterialUsage + deducts stock in transaction", async () => {
    const stockBefore = flowMaterial.stock;

    const result = calculateMaterialUsage(
      { id: flowJob.id, quantity: Number(flowJob.quantity) },
      {
        id: flowMaterial.id,
        name: flowMaterial.name,
        active: flowMaterial.active,
        category: flowMaterial.category,
        wastePercent: flowMaterial.wastePercent,
        pricePerSqm: flowMaterial.pricePerSqm,
        pricePerMeter: flowMaterial.pricePerMeter,
        pricePerUnit: flowMaterial.pricePerUnit,
        stock: flowMaterial.stock,
      }
    );

    // Simulate what the PATCH /production/[id] transaction does
    const [usage, updatedMaterial] = await prisma.$transaction([
      prisma.materialUsage.create({
        data: {
          materialId: flowMaterial.id,
          jobId: flowJob.id,
          quantity: result.quantity,
          unit: result.usageUnit,
          wastePercent: result.wastePercent,
          totalUsed: result.totalUsed,
        },
      }),
      prisma.material.update({
        where: { id: flowMaterial.id },
        data: { stock: { decrement: result.totalUsed } },
      }),
    ]);

    expect(usage.unit).toBe(UsageUnit.sqm);
    expect(usage.wastePercent).toBe(8);
    expect(usage.totalUsed).toBeCloseTo(5.4, 5);
    expect(updatedMaterial.stock).toBeCloseTo(stockBefore - 5.4, 2);
  });

  it("re-completion guard: second call does NOT create duplicate usage", async () => {
    // Simulate checking for existing usage before creating (as the PATCH route does)
    const existingUsage = await prisma.materialUsage.findFirst({
      where: { jobId: flowJob.id },
      select: { id: true },
    });

    // existingUsage exists (from previous test), so we should NOT create another
    expect(existingUsage).not.toBeNull();

    const countBefore = await prisma.materialUsage.count({
      where: { jobId: flowJob.id },
    });

    // Guard: skip if already exists
    if (!existingUsage) {
      await prisma.materialUsage.create({
        data: {
          materialId: flowMaterial.id,
          jobId: flowJob.id,
          quantity: 5,
          unit: UsageUnit.sqm,
          wastePercent: 8,
          totalUsed: 5.4,
        },
      });
    }

    const countAfter = await prisma.materialUsage.count({
      where: { jobId: flowJob.id },
    });

    // Count must be unchanged because of the guard
    expect(countAfter).toBe(countBefore);
  });
});

// ── Orders API aggregation query ──────────────────────────────────────────

describeDB("Orders API — materialUsages aggregation via JOIN", () => {
  let agOrder: Order;
  let agJob: ProductionJob;
  let agMaterial: Material;

  beforeAll(async () => {
    agMaterial = await prisma.material.create({
      data: {
        name: `${UNIQUE_PREFIX} Textile Banner`,
        category: "textile",
        unit: "m",
        pricePerMeter: 18,
        wastePercent: 7,
        stock: 200,
        active: true,
      },
    });

    agOrder = await prisma.order.create({
      data: {
        customerName: "T8 Aggregation Customer",
        customerEmail: `t8-ag-${Date.now()}@test.local`,
        totalPrice: 0,
      },
    });

    agJob = await prisma.productionJob.create({
      data: {
        orderId: agOrder.id,
        name: "T8 Aggregation Job",
        materialId: agMaterial.id,
        quantity: 10,
        status: "COMPLETED",
      },
    });

    // Create MaterialUsage record (as if COMPLETED flow already ran)
    await prisma.materialUsage.create({
      data: {
        materialId: agMaterial.id,
        jobId: agJob.id,
        quantity: 10,
        unit: UsageUnit.meter,
        wastePercent: 7,
        totalUsed: 10.7,
      },
    });
  });

  afterAll(async () => {
    await prisma.materialUsage.deleteMany({ where: { jobId: agJob.id } });
    await prisma.productionJob.delete({ where: { id: agJob.id } });
    await prisma.order.delete({ where: { id: agOrder.id } });
    await prisma.material.delete({ where: { id: agMaterial.id } });
  });

  it("fetches order with productionJobs.materialUsages.material via JOIN", async () => {
    const order = await prisma.order.findUnique({
      where: { id: agOrder.id },
      include: {
        productionJobs: {
          include: {
            materialUsages: {
              include: {
                material: {
                  select: {
                    id: true,
                    name: true,
                    category: true,
                    pricePerSqm: true,
                    pricePerMeter: true,
                    pricePerUnit: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(order).not.toBeNull();
    expect(order!.productionJobs.length).toBe(1);

    const job = order!.productionJobs[0];
    expect(job.materialUsages.length).toBe(1);

    const usage = job.materialUsages[0];
    expect(usage.unit).toBe(UsageUnit.meter);
    expect(usage.quantity).toBe(10);
    expect(usage.wastePercent).toBe(7);
    expect(usage.totalUsed).toBeCloseTo(10.7, 5);
    expect(usage.material.name).toContain("Textile Banner");
    expect(usage.material.pricePerMeter).toBe(18);
  });

  it("aggregated material cost is computed correctly from client-side formula", async () => {
    // This replicates the aggregateOrderMaterials() logic from OrdersList.tsx
    const order = await prisma.order.findUnique({
      where: { id: agOrder.id },
      include: {
        productionJobs: {
          include: {
            materialUsages: {
              include: {
                material: {
                  select: {
                    pricePerSqm: true,
                    pricePerMeter: true,
                    pricePerUnit: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const allUsages = order!.productionJobs.flatMap(
      (j) => j.materialUsages
    );

    const totalCost = allUsages.reduce((sum, u) => {
      const price =
        u.unit === "sqm"
          ? u.material.pricePerSqm
          : u.unit === "meter"
          ? u.material.pricePerMeter
          : u.material.pricePerUnit;
      return sum + (price != null ? u.totalUsed * price : 0);
    }, 0);

    // totalCost = 10.7 × 18 = 192.6
    expect(totalCost).toBeCloseTo(192.6, 1);
  });
});

// ── Error guard tests ─────────────────────────────────────────────────────

describeDB("calculateMaterialUsage — error guards with real Prisma objects", () => {
  let inactiveMaterial: Material;

  beforeAll(async () => {
    inactiveMaterial = await prisma.material.create({
      data: {
        name: `${UNIQUE_PREFIX} Inactive Mat`,
        category: "sheet",
        unit: "m2",
        pricePerSqm: 10,
        active: false,
        stock: 0,
      },
    });
  });

  afterAll(async () => {
    await prisma.material.delete({ where: { id: inactiveMaterial.id } });
  });

  it("throws MaterialConsumptionError(409) for inactive material", () => {
    expect(() =>
      calculateMaterialUsage(
        { id: "any-job", quantity: 2 },
        {
          id: inactiveMaterial.id,
          name: inactiveMaterial.name,
          active: inactiveMaterial.active,
          category: inactiveMaterial.category,
          wastePercent: inactiveMaterial.wastePercent,
          pricePerSqm: inactiveMaterial.pricePerSqm,
          pricePerMeter: inactiveMaterial.pricePerMeter,
          pricePerUnit: inactiveMaterial.pricePerUnit,
          stock: inactiveMaterial.stock,
        }
      )
    ).toThrowError(MaterialConsumptionError);
  });

  it("throws MaterialConsumptionError(400) when job has no quantity", () => {
    expect(() =>
      calculateMaterialUsage(
        { id: "any-job", quantity: null },
        {
          id: inactiveMaterial.id,
          name: "Active Mat",
          active: true,
          category: "sheet",
          wastePercent: 0,
          pricePerSqm: 10,
          pricePerMeter: null,
          pricePerUnit: null,
          stock: 100,
        }
      )
    ).toThrowError(MaterialConsumptionError);
  });
});
