import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Создаем простой Prisma client без адаптера для seed
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@sanduta.art' },
      update: {
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
      create: {
        name: 'Admin User',
        email: 'admin@sanduta.art',
        password: adminPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('✅ Admin user created:', admin.email);
    console.log('   Email: admin@sanduta.art');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
