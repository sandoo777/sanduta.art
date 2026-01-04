import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@sanduta.art';
  const password = 'admin123';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email,
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created/updated:');
  console.log({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
