import { prisma } from "../src/lib/prisma";

async function checkUserStatus() {
  try {
    console.log("Checking user status in database...\n");
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (users.length === 0) {
      console.log("❌ No users found in database!");
      console.log("You need to create at least one user.");
      return;
    }

    console.log(`Found ${users.length} user(s):\n`);
    
    users.forEach((user, index) => {
      const statusIcon = user.active ? "✅" : "❌";
      const roleIcon = user.role === "ADMIN" ? "👑" : user.role === "MANAGER" ? "📊" : "👤";
      
      console.log(`${index + 1}. ${statusIcon} ${roleIcon} ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.active ? "Yes" : "No (INACTIVE!)"}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log("");
    });

    // Check for inactive admin users
    const inactiveAdmins = users.filter(u => (u.role === "ADMIN" || u.role === "MANAGER") && !u.active);
    if (inactiveAdmins.length > 0) {
      console.log("⚠️  WARNING: Found inactive admin/manager users:");
      inactiveAdmins.forEach(u => {
        console.log(`   - ${u.email} (${u.role})`);
      });
      console.log("");
    }

    // Check for accounts without active flag
    const activeUsers = users.filter(u => u.active);
    const inactiveUsers = users.filter(u => !u.active);
    
    console.log("Summary:");
    console.log(`  Active users: ${activeUsers.length}`);
    console.log(`  Inactive users: ${inactiveUsers.length}`);
    console.log(`  Admins: ${users.filter(u => u.role === "ADMIN").length}`);
    console.log(`  Managers: ${users.filter(u => u.role === "MANAGER").length}`);
    
  } catch (error) {
    console.error("Error checking user status:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
