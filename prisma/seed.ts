import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create ADMIN user
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

  // Create sample customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'Ion Popescu',
        email: 'ion@example.com',
        phone: '+373 69 123 456',
        source: 'ONLINE',
        tags: ['VIP'],
      },
      {
        name: 'Maria Ionescu',
        phone: '+373 69 789 012',
        source: 'OFFLINE',
        company: 'Print Studio SRL',
        tags: ['B2B'],
      },
      {
        name: 'Andrei Dumitru',
        email: 'andrei@business.md',
        phone: '+373 69 345 678',
        source: 'ONLINE',
        company: 'Marketing Pro',
        tags: ['B2B', 'Regular'],
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Created ${customers.count} customers`);

  // Create sample categories
  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Business Cards',
        slug: 'business-cards',
        color: '#3B82F6',
        icon: '💼',
      },
      {
        name: 'Flyers & Leaflets',
        slug: 'flyers-leaflets',
        color: '#10B981',
        icon: '📄',
      },
      {
        name: 'Banners & Posters',
        slug: 'banners-posters',
        color: '#F59E0B',
        icon: '🎨',
      },
      {
        name: 'Photo Printing',
        slug: 'photo-printing',
        color: '#EC4899',
        icon: '📸',
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Created ${categories.count} categories`);

  // Get created category for products
  const businessCardCategory = await prisma.category.findFirst({
    where: { slug: 'business-cards' },
  });

  // Create sample products
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Standard Business Cards',
        slug: 'standard-business-cards',
        description: '350gsm cardstock, full color, matte or glossy finish',
        category: 'Business Cards',
        categoryId: businessCardCategory?.id,
        price: 50,
        stock: 1000,
        status: 'ACTIVE',
      },
      {
        name: 'Premium Business Cards',
        slug: 'premium-business-cards',
        description: '450gsm premium cardstock with soft-touch lamination',
        category: 'Business Cards',
        categoryId: businessCardCategory?.id,
        price: 100,
        stock: 500,
        status: 'ACTIVE',
      },
      {
        name: 'A5 Flyers',
        slug: 'a5-flyers',
        description: '150gsm coated paper, full color both sides',
        category: 'Flyers & Leaflets',
        price: 25,
        stock: 2000,
        status: 'ACTIVE',
      },
    ],
    skipDuplicates: true,
  });
  console.log(`✅ Created ${products.count} products`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });