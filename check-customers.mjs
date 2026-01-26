import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const count = await prisma.customer.count();
  console.log('✅ Total customers:', count);
  
  if (count > 0) {
    const customers = await prisma.customer.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
    console.log('\n📋 First 3 customers:');
    customers.forEach(c => {
      console.log(`  - ID: ${c.id} | Name: ${c.name} | Email: ${c.email || 'N/A'}`);
    });
  } else {
    console.log('\n⚠️  No customers found in database');
  }
  
  await prisma.$disconnect();
} catch (error) {
  console.error('❌ Error:', error.message);
  await prisma.$disconnect();
  process.exit(1);
}
