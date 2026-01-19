import { prisma } from './src/lib/prisma';

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@sanduta.art' },
    select: { id: true, email: true, name: true, role: true, password: true }
  });
  
  if (user) {
    console.log('✅ User found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Has password:', !!user.password);
    console.log('  Password hash length:', user.password?.length);
  } else {
    console.log('❌ User not found - need to run seed');
  }
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);
