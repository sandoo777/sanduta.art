import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    {
      email: 'admin@sanduta.art',
      name: 'Administrator',
      password: 'admin123',
      role: 'ADMIN',
    },
    {
      email: 'manager@sanduta.art',
      name: 'Manager User',
      password: 'manager123',
      role: 'MANAGER',
    },
    {
      email: 'operator@sanduta.art',
      name: 'Operator User',
      password: 'operator123',
      role: 'OPERATOR',
    },
    {
      email: 'viewer@sanduta.art',
      name: 'Viewer User',
      password: 'viewer123',
      role: 'VIEWER',
    },
  ];

  console.log('🚀 Creating users...\n');

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: hashedPassword,
        role: userData.role as any,
      },
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role as any,
      },
    });

    console.log(`✅ ${userData.role} user created/updated:`);
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      password: userData.password,
    });
    console.log('');
  }

  console.log('✨ All users created successfully!');
  console.log('\n📝 Login credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  users.forEach(u => {
    console.log(`${u.role.padEnd(10)} | ${u.email.padEnd(25)} | ${u.password}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
