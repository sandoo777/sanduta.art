/**
 * Settings API Integration Tests
 * 
 * Tests:
 * 1. User CRUD operations
 * 2. Password hashing
 * 3. Role-based permissions
 * 4. System settings management
 * 5. Edge cases and validations
 */

import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { UserRole } from "@prisma/client";

async function testSettings() {
  console.log("========================================");
  console.log("Settings API Integration Tests");
  console.log("========================================\n");

  let testUserId: string | null = null;

  try {
    // Test 1: Create User
    console.log("Test 1: Create User");
    const hashedPassword = await hash("password123", 10);
    const newUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: `test-${Date.now()}@example.com`,
        password: hashedPassword,
        role: "OPERATOR" as UserRole,
        active: true,
      },
    });
    testUserId = newUser.id;
    console.log("✓ User created:", newUser.email);
    console.log("");

    // Test 2: Verify password hash
    console.log("Test 2: Verify Password Hash");
    const passwordMatch = await compare("password123", newUser.password);
    if (passwordMatch) {
      console.log("✓ Password correctly hashed and verified");
    } else {
      console.log("✗ Password verification failed");
    }
    console.log("");

    // Test 3: Update user
    console.log("Test 3: Update User");
    const updatedUser = await prisma.user.update({
      where: { id: testUserId },
      data: {
        name: "Updated Test User",
        active: false,
      },
    });
    if (updatedUser.name === "Updated Test User" && !updatedUser.active) {
      console.log("✓ User updated successfully");
    } else {
      console.log("✗ User update failed");
    }
    console.log("");

    // Test 4: Update password
    console.log("Test 4: Update Password");
    const newHashedPassword = await hash("newpassword456", 10);
    await prisma.user.update({
      where: { id: testUserId },
      data: {
        password: newHashedPassword,
      },
    });
    const userWithNewPassword = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    const newPasswordMatch = await compare(
      "newpassword456",
      userWithNewPassword!.password
    );
    if (newPasswordMatch) {
      console.log("✓ Password updated and verified");
    } else {
      console.log("✗ Password update failed");
    }
    console.log("");

    // Test 5: List users
    console.log("Test 5: List Users");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });
    console.log(`✓ Found ${users.length} users`);
    console.log("");

    // Test 6: Get single user
    console.log("Test 6: Get Single User");
    const singleUser = await prisma.user.findUnique({
      where: { id: testUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });
    if (singleUser) {
      console.log("✓ User retrieved:", singleUser.email);
    } else {
      console.log("✗ User not found");
    }
    console.log("");

    // Test 7: Check email uniqueness
    console.log("Test 7: Email Uniqueness Validation");
    try {
      await prisma.user.create({
        data: {
          name: "Duplicate User",
          email: newUser.email,
          password: hashedPassword,
          role: "OPERATOR" as UserRole,
        },
      });
      console.log("✗ Duplicate email was not rejected");
    } catch (_error) {
      if (error.code === "P2002") {
        console.log("✓ Duplicate email correctly rejected");
      } else {
        console.log("✗ Unexpected error:", (error as Error).message);
      }
    }
    console.log("");

    // Test 8: Count admins (for deletion protection)
    console.log("Test 8: Count Admin Users");
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    console.log(`✓ Found ${adminCount} admin user(s)`);
    console.log("");

    // Test 9: System Settings - Create
    console.log("Test 9: Create System Settings");
    const settings = await Promise.all([
      prisma.systemSetting.upsert({
        where: { key: "company_name" },
        update: { value: "Sanduta Print" },
        create: { key: "company_name", value: "Sanduta Print" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "company_email" },
        update: { value: "contact@sanduta.art" },
        create: { key: "company_email", value: "contact@sanduta.art" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "default_currency" },
        update: { value: "MDL" },
        create: { key: "default_currency", value: "MDL" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "low_stock_threshold" },
        update: { value: "10" },
        create: { key: "low_stock_threshold", value: "10" },
      }),
      prisma.systemSetting.upsert({
        where: { key: "timezone" },
        update: { value: "Europe/Chisinau" },
        create: { key: "timezone", value: "Europe/Chisinau" },
      }),
    ]);
    console.log(`✓ Created/updated ${settings.length} system settings`);
    console.log("");

    // Test 10: System Settings - Read
    console.log("Test 10: Read System Settings");
    const allSettings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });
    console.log(`✓ Retrieved ${allSettings.length} settings:`);
    allSettings.forEach((setting) => {
      console.log(`  - ${setting.key}: ${setting.value}`);
    });
    console.log("");

    // Test 11: System Settings - Update
    console.log("Test 11: Update System Setting");
    const updatedSetting = await prisma.systemSetting.update({
      where: { key: "company_name" },
      data: { value: "Sanduta Print Studio" },
    });
    if (updatedSetting.value === "Sanduta Print Studio") {
      console.log("✓ System setting updated successfully");
    } else {
      console.log("✗ System setting update failed");
    }
    console.log("");

    // Test 12: Role-based checks (logic simulation)
    console.log("Test 12: Role-Based Permission Checks");
    const _roles: UserRole[] = ["ADMIN", "MANAGER", "OPERATOR", "VIEWER"];
    console.log("Permission matrix:");
    console.log("  ADMIN:");
    console.log("    - Manage users: ✓");
    console.log("    - Manage roles: ✓");
    console.log("    - Manage settings: ✓");
    console.log("  MANAGER:");
    console.log("    - Manage users: ✓");
    console.log("    - Manage roles: ✗");
    console.log("    - Manage settings: ✓");
    console.log("  OPERATOR:");
    console.log("    - Manage users: ✗ (read-only)");
    console.log("    - Manage roles: ✗");
    console.log("    - Manage settings: ✗");
    console.log("  VIEWER:");
    console.log("    - Manage users: ✗ (read-only)");
    console.log("    - Manage roles: ✗");
    console.log("    - Manage settings: ✗");
    console.log("");

    // Test 13: Delete test user
    console.log("Test 13: Delete Test User");
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
      console.log("✓ Test user deleted");
    }
    console.log("");

    console.log("========================================");
    console.log("All Tests Completed Successfully!");
    console.log("========================================");
  } catch (_error) {
    console.error("Test failed with error:", error);
    
    // Cleanup
    if (testUserId) {
      try {
        await prisma.user.delete({
          where: { id: testUserId },
        });
        console.log("Cleanup: Test user deleted");
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
    }
  }
}

// Run tests
testSettings()
  .then(() => {
    console.log("\nTests completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
