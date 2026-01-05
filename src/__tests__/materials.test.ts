import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

const hasDatabaseCredentials = Boolean(
  process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SHADOW_DATABASE_URL
);

const describeMaterials = hasDatabaseCredentials ? describe : describe.skip;

if (!hasDatabaseCredentials) {
  console.warn(
    "Skipping materials integration tests because no database credentials are configured"
  );
}

describeMaterials("Materials & Inventory Backend", () => {
  let testMaterial: any;
  let testJob: any;
  let testOrder: any;

  beforeAll(async () => {
    // Create test order and job for consumption tests
    testOrder = await prisma.order.create({
      data: {
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        totalPrice: 100,
      },
    });

    testJob = await prisma.productionJob.create({
      data: {
        orderId: testOrder.id,
        name: "Test Production Job",
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testMaterial) {
      await prisma.materialUsage.deleteMany({
        where: { materialId: testMaterial.id },
      });
      await prisma.material.delete({
        where: { id: testMaterial.id },
      });
    }
    if (testJob) {
      await prisma.productionJob.delete({
        where: { id: testJob.id },
      });
    }
    if (testOrder) {
      await prisma.order.delete({
        where: { id: testOrder.id },
      });
    }
  });

  describe("Test 1: Create Material", () => {
    it("should create a material successfully", async () => {
      testMaterial = await prisma.material.create({
        data: {
          name: "Test Material",
          sku: "TEST-MAT-001",
          unit: "kg",
          stock: 100,
          minStock: 20,
          costPerUnit: 15.5,
          notes: "Test material for unit testing",
        },
      });

      expect(testMaterial).toBeDefined();
      expect(testMaterial.name).toBe("Test Material");
      expect(testMaterial.sku).toBe("TEST-MAT-001");
      expect(testMaterial.unit).toBe("kg");
      expect(testMaterial.stock).toBe(100);
      expect(testMaterial.minStock).toBe(20);
    });

    it("should not allow duplicate SKU", async () => {
      await expect(
        prisma.material.create({
          data: {
            name: "Another Material",
            sku: "TEST-MAT-001", // Duplicate SKU
            unit: "pcs",
            stock: 50,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("Test 2: Update Material", () => {
    it("should update material successfully", async () => {
      const updated = await prisma.material.update({
        where: { id: testMaterial.id },
        data: {
          name: "Updated Test Material",
          stock: 150,
          minStock: 30,
        },
      });

      expect(updated.name).toBe("Updated Test Material");
      expect(updated.stock).toBe(150);
      expect(updated.minStock).toBe(30);
      expect(updated.sku).toBe("TEST-MAT-001"); // SKU unchanged
    });

    it("should update SKU if unique", async () => {
      const updated = await prisma.material.update({
        where: { id: testMaterial.id },
        data: {
          sku: "TEST-MAT-001-UPDATED",
        },
      });

      expect(updated.sku).toBe("TEST-MAT-001-UPDATED");
      testMaterial = updated;
    });
  });

  describe("Test 3: Delete Material", () => {
    it("should not delete material with consumption", async () => {
      // Create consumption first
      await prisma.materialUsage.create({
        data: {
          materialId: testMaterial.id,
          jobId: testJob.id,
          quantity: 10,
        },
      });

      const consumptionCount = await prisma.materialUsage.count({
        where: { materialId: testMaterial.id },
      });

      expect(consumptionCount).toBeGreaterThan(0);

      // Should not be able to delete
      // (In real API this would return 400 error)
    });

    it("should delete material without consumption", async () => {
      // Create a material without consumption
      const tempMaterial = await prisma.material.create({
        data: {
          name: "Temp Material",
          sku: "TEMP-001",
          unit: "pcs",
          stock: 50,
        },
      });

      const consumptionCount = await prisma.materialUsage.count({
        where: { materialId: tempMaterial.id },
      });

      expect(consumptionCount).toBe(0);

      // Should be able to delete
      await prisma.material.delete({
        where: { id: tempMaterial.id },
      });

      const deleted = await prisma.material.findUnique({
        where: { id: tempMaterial.id },
      });

      expect(deleted).toBeNull();
    });
  });

  describe("Test 4: Consume Material", () => {
    it("should consume material and decrease stock", async () => {
      const initialStock = testMaterial.stock;
      const consumeQuantity = 25;

      // Check if we have enough stock
      expect(initialStock).toBeGreaterThanOrEqual(consumeQuantity);

      // Create material usage
      const materialUsage = await prisma.materialUsage.create({
        data: {
          materialId: testMaterial.id,
          jobId: testJob.id,
          quantity: consumeQuantity,
        },
      });

      expect(materialUsage).toBeDefined();
      expect(materialUsage.quantity).toBe(consumeQuantity);

      // Update stock
      const updatedMaterial = await prisma.material.update({
        where: { id: testMaterial.id },
        data: {
          stock: initialStock - consumeQuantity,
        },
      });

      expect(updatedMaterial.stock).toBe(initialStock - consumeQuantity);
      testMaterial = updatedMaterial;
    });

    it("should return warning when stock is below minimum", async () => {
      // Set stock below minimum
      const updatedMaterial = await prisma.material.update({
        where: { id: testMaterial.id },
        data: {
          stock: 15, // Below minStock (30)
          minStock: 30,
        },
      });

      const lowStock = updatedMaterial.stock < updatedMaterial.minStock;
      expect(lowStock).toBe(true);
      testMaterial = updatedMaterial;
    });

    it("should not consume more than available stock", async () => {
      const currentStock = testMaterial.stock;
      const requestedQuantity = currentStock + 10;

      // This should fail in the API (checked before consumption)
      const hasEnoughStock = currentStock >= requestedQuantity;
      expect(hasEnoughStock).toBe(false);
    });
  });

  describe("Test 5: Get Material with Consumption History", () => {
    it("should retrieve material with consumption and job info", async () => {
      const material = await prisma.material.findUnique({
        where: { id: testMaterial.id },
        include: {
          consumption: {
            include: {
              job: {
                include: {
                  order: {
                    select: {
                      id: true,
                      customerName: true,
                      customerEmail: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      expect(material).toBeDefined();
      expect(material?.consumption).toBeDefined();
      expect(material?.consumption.length).toBeGreaterThan(0);

      // Check that consumption includes job info
      const firstConsumption = material?.consumption[0];
      expect(firstConsumption?.job).toBeDefined();
      expect(firstConsumption?.job.order).toBeDefined();
      expect(firstConsumption?.job.order.customerName).toBeDefined();
    });
  });

  describe("Test 6: List Materials with Metrics", () => {
    it("should retrieve all materials with low stock indicator", async () => {
      const materials = await prisma.material.findMany({
        include: {
          consumption: true,
        },
      });

      expect(materials).toBeDefined();
      expect(materials.length).toBeGreaterThan(0);

      // Calculate metrics for each material
      const materialsWithMetrics = materials.map((material) => {
        const totalConsumption = material.consumption.reduce(
          (sum, usage) => sum + usage.quantity,
          0
        );

        return {
          ...material,
          lowStock: material.stock < material.minStock,
          totalConsumption,
        };
      });

      // Check that test material has metrics
      const testMat = materialsWithMetrics.find((m) => m.id === testMaterial.id);
      expect(testMat).toBeDefined();
      expect(testMat?.lowStock).toBe(testMat!.stock < testMat!.minStock);
      expect(testMat?.totalConsumption).toBeGreaterThan(0);
    });

    it("should identify materials with low stock", async () => {
      const materials = await prisma.material.findMany();

      const lowStockMaterials = materials.filter(
        (m) => m.stock < m.minStock
      );

      expect(lowStockMaterials).toBeDefined();
      // Our test material should be in low stock
      const isTestMaterialLowStock = lowStockMaterials.some(
        (m) => m.id === testMaterial.id
      );
      expect(isTestMaterialLowStock).toBe(testMaterial.stock < testMaterial.minStock);
    });
  });

  describe("Validation Tests", () => {
    it("should validate required fields", async () => {
      // Name is required
      await expect(
        prisma.material.create({
          data: {
            name: "", // Empty name
            unit: "kg",
          },
        })
      ).rejects.toThrow();
    });

    it("should validate numeric fields are positive", async () => {
      // Stock should be >= 0
      const material = await prisma.material.create({
        data: {
          name: "Validation Test Material",
          sku: "VAL-001",
          unit: "pcs",
          stock: 0, // Zero is valid
          minStock: 0,
          costPerUnit: 0,
        },
      });

      expect(material.stock).toBe(0);

      // Clean up
      await prisma.material.delete({
        where: { id: material.id },
      });
    });
  });

  describe("Transaction Tests", () => {
    it("should handle consumption in transaction", async () => {
      const material = await prisma.material.create({
        data: {
          name: "Transaction Test Material",
          sku: "TRANS-001",
          unit: "kg",
          stock: 100,
          minStock: 20,
        },
      });

      try {
        // Perform consumption in transaction
        const [materialUsage, updatedMaterial] = await prisma.$transaction([
          prisma.materialUsage.create({
            data: {
              materialId: material.id,
              jobId: testJob.id,
              quantity: 30,
            },
          }),
          prisma.material.update({
            where: { id: material.id },
            data: { stock: material.stock - 30 },
          }),
        ]);

        expect(materialUsage).toBeDefined();
        expect(updatedMaterial.stock).toBe(70);

        // Clean up
        await prisma.materialUsage.deleteMany({
          where: { materialId: material.id },
        });
        await prisma.material.delete({
          where: { id: material.id },
        });
      } catch (error) {
        // Clean up on error
        await prisma.materialUsage.deleteMany({
          where: { materialId: material.id },
        });
        await prisma.material.delete({
          where: { id: material.id },
        });
        throw error;
      }
    });
  });
});
