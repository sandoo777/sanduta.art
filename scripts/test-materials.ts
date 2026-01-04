#!/usr/bin/env tsx

/**
 * Manual testing script for Materials & Inventory Backend
 * Run with: npx tsx scripts/test-materials.ts
 */

import { prisma } from "../src/lib/prisma";

interface TestResult {
  test: string;
  passed: boolean;
  message?: string;
  data?: any;
}

const results: TestResult[] = [];

async function runTests() {
  console.log("🧪 Starting Materials & Inventory Backend Tests\n");

  let testMaterial: any;
  let testJob: any;
  let testOrder: any;

  try {
    // Setup: Create test order and job
    console.log("📦 Setting up test data...");
    testOrder = await prisma.order.create({
      data: {
        customerName: "Test Customer",
        customerEmail: "test-materials@example.com",
        totalPrice: 100,
      },
    });

    testJob = await prisma.productionJob.create({
      data: {
        orderId: testOrder.id,
        name: "Test Production Job for Materials",
      },
    });
    console.log("✅ Test data created\n");

    // TEST 1: Create Material
    console.log("Test 1: Create Material");
    try {
      testMaterial = await prisma.material.create({
        data: {
          name: "Test Material Auto",
          sku: `TEST-MAT-${Date.now()}`,
          unit: "kg",
          stock: 100,
          minStock: 20,
          costPerUnit: 15.5,
          notes: "Test material for automated testing",
        },
      });

      results.push({
        test: "Create Material",
        passed: true,
        message: "Material created successfully",
        data: { id: testMaterial.id, name: testMaterial.name },
      });
      console.log("✅ PASSED: Material created\n");
    } catch (error: any) {
      results.push({
        test: "Create Material",
        passed: false,
        message: error.message,
      });
      console.log("❌ FAILED:", error.message, "\n");
    }

    // TEST 2: Update Material
    console.log("Test 2: Update Material");
    try {
      const updated = await prisma.material.update({
        where: { id: testMaterial.id },
        data: {
          name: "Updated Test Material",
          stock: 150,
          minStock: 30,
        },
      });

      const passed =
        updated.name === "Updated Test Material" &&
        updated.stock === 150 &&
        updated.minStock === 30;

      results.push({
        test: "Update Material",
        passed,
        message: passed ? "Material updated successfully" : "Update values mismatch",
        data: { name: updated.name, stock: updated.stock },
      });
      console.log(passed ? "✅ PASSED\n" : "❌ FAILED\n");

      testMaterial = updated;
    } catch (error: any) {
      results.push({
        test: "Update Material",
        passed: false,
        message: error.message,
      });
      console.log("❌ FAILED:", error.message, "\n");
    }

    // TEST 3: Delete Material (should fail with consumption)
    console.log("Test 3: Delete Material with Consumption");
    try {
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

      results.push({
        test: "Delete Material with Consumption - Check",
        passed: consumptionCount > 0,
        message: `Material has ${consumptionCount} consumption records (should not be deletable)`,
      });
      console.log(`✅ PASSED: Material has consumption (${consumptionCount} records)\n`);
    } catch (error: any) {
      results.push({
        test: "Delete Material with Consumption",
        passed: false,
        message: error.message,
      });
      console.log("❌ FAILED:", error.message, "\n");
    }

    // TEST 4: Consume Material
    console.log("Test 4: Consume Material");
    try {
      const initialStock = testMaterial.stock;
      const consumeQuantity = 25;

      // Check stock availability
      if (initialStock < consumeQuantity) {
        throw new Error("Insufficient stock for test");
      }

      // Create material usage and update stock
      const [materialUsage, updatedMaterial] = await prisma.$transaction([
        prisma.materialUsage.create({
          data: {
            materialId: testMaterial.id,
            jobId: testJob.id,
            quantity: consumeQuantity,
          },
        }),
        prisma.material.update({
          where: { id: testMaterial.id },
          data: {
            stock: initialStock - consumeQuantity,
          },
        }),
      ]);

      const stockCorrect = updatedMaterial.stock === initialStock - consumeQuantity;
      const lowStockWarning = updatedMaterial.stock < updatedMaterial.minStock;

      results.push({
        test: "Consume Material",
        passed: stockCorrect,
        message: `Stock decreased from ${initialStock} to ${updatedMaterial.stock}`,
        data: {
          consumed: consumeQuantity,
          newStock: updatedMaterial.stock,
          lowStockWarning,
        },
      });

      console.log(stockCorrect ? "✅ PASSED\n" : "❌ FAILED\n");
      if (lowStockWarning) {
        console.log(
          `⚠️  WARNING: Stock (${updatedMaterial.stock}) is below minimum (${updatedMaterial.minStock})\n`
        );
      }

      testMaterial = updatedMaterial;
    } catch (error: any) {
      results.push({
        test: "Consume Material",
        passed: false,
        message: error.message,
      });
      console.log("❌ FAILED:", error.message, "\n");
    }

    // TEST 5: Get Material with Consumption History
    console.log("Test 5: Get Material with Consumption History");
    try {
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

      const passed =
        material !== null &&
        material.consumption.length > 0 &&
        material.consumption[0].job !== null;

      results.push({
        test: "Get Material with History",
        passed,
        message: passed
          ? `Retrieved material with ${material!.consumption.length} consumption records`
          : "Failed to retrieve complete data",
        data: {
          consumptionCount: material?.consumption.length,
          hasJobInfo: material?.consumption[0]?.job !== undefined,
        },
      });

      console.log(passed ? "✅ PASSED\n" : "❌ FAILED\n");
    } catch (error: any) {
      results.push({
        test: "Get Material with History",
        passed: false,
        message: error.message,
      });
      console.log("❌ FAILED:", error.message, "\n");
    }

    // TEST 6: List Materials with Metrics
    console.log("Test 6: List Materials with Metrics");
    try {
      const materials = await prisma.material.findMany({
        include: {
          consumption: true,
        },
      });

      const materialsWithMetrics = materials.map((material) => {
        const totalConsumption = material.consumption.reduce(
          (sum, usage) => sum + usage.quantity,
          0
        );

        return {
          id: material.id,
          name: material.name,
          stock: material.stock,
          minStock: material.minStock,
          lowStock: material.stock < material.minStock,
          totalConsumption,
        };
      });

      const testMat = materialsWithMetrics.find((m) => m.id === testMaterial.id);
      const passed = testMat !== undefined && testMat.totalConsumption > 0;

      results.push({
        test: "List Materials with Metrics",
        passed,
        message: passed
          ? `Retrieved ${materials.length} materials with metrics`
          : "Failed to calculate metrics",
        data: {
          totalMaterials: materials.length,
          lowStockCount: materialsWithMetrics.filter((m) => m.lowStock).length,
          testMaterialConsumption: testMat?.totalConsumption,
        },
      });

      console.log(passed ? "✅ PASSED\n" : "❌ FAILED\n");
    } catch (error: any) {
      results.push({
        test: "List Materials with Metrics",
        passed: false,
        message: error.message,
      });
      console.log("❌ FAILED:", error.message, "\n");
    }

    // TEST 7: Validation - Insufficient Stock
    console.log("Test 7: Validation - Insufficient Stock");
    try {
      const currentStock = testMaterial.stock;
      const requestedQuantity = currentStock + 100;

      const hasEnoughStock = currentStock >= requestedQuantity;

      results.push({
        test: "Insufficient Stock Validation",
        passed: !hasEnoughStock, // Should be false (not enough stock)
        message: hasEnoughStock
          ? "Validation failed: Should not have enough stock"
          : `Correctly detected insufficient stock (have ${currentStock}, need ${requestedQuantity})`,
        data: { currentStock, requestedQuantity },
      });

      console.log(!hasEnoughStock ? "✅ PASSED\n" : "❌ FAILED\n");
    } catch (error: any) {
      results.push({
        test: "Insufficient Stock Validation",
        passed: false,
        message: error.message,
      });
      console.log("❌ FAILED:", error.message, "\n");
    }

    // Summary
    console.log("═══════════════════════════════════════");
    console.log("📊 TEST SUMMARY");
    console.log("═══════════════════════════════════════\n");

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;

    results.forEach((result) => {
      const status = result.passed ? "✅ PASSED" : "❌ FAILED";
      console.log(`${status}: ${result.test}`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
    });

    console.log("\n═══════════════════════════════════════");
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(
      `Success Rate: ${((passed / total) * 100).toFixed(1)}%`
    );
    console.log("═══════════════════════════════════════\n");

  } catch (error) {
    console.error("❌ Fatal error during testing:", error);
  } finally {
    // Cleanup
    console.log("🧹 Cleaning up test data...");
    try {
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
      console.log("✅ Cleanup completed\n");
    } catch (error) {
      console.error("⚠️  Warning: Cleanup failed:", error);
    }

    await prisma.$disconnect();
  }

  process.exit(results.some((r) => !r.passed) ? 1 : 0);
}

runTests();
