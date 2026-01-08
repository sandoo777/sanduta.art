import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding products...\n');

  // Create categories
  const categories = [
    {
      name: 'Flyere & Pliante',
      slug: 'flyere-pliante',
      color: '#3B82F6',
      icon: '📄',
    },
    {
      name: 'Cărți de Vizită',
      slug: 'carti-vizita',
      color: '#10B981',
      icon: '💼',
    },
    {
      name: 'Bannere & Postere',
      slug: 'bannere-postere',
      color: '#F59E0B',
      icon: '🎨',
    },
  ];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    console.log(`✅ Category: ${category.name}`);
  }

  // Get category IDs
  const flyereCategory = await prisma.category.findUnique({
    where: { slug: 'flyere-pliante' },
  });

  // Create products
  const products = [
    {
      name: 'Flyere A5',
      slug: 'flyere-a5',
      description: 'Flyere A5 (148x210mm) - perfecte pentru promoții și evenimente. Disponibile în materiale de 130g, 170g sau 300g, cu finisaje premium.',
      price: 150.00,
      categoryId: flyereCategory?.id || '',
    },
    {
      name: 'Flyere A6',
      slug: 'flyere-a6',
      description: 'Flyere A6 (105x148mm) - compact și eficient pentru campanii rapide. Format practic, ușor de distribuit.',
      price: 120.00,
      categoryId: flyereCategory?.id || '',
    },
    {
      name: 'Flyere A4',
      slug: 'flyere-a4',
      description: 'Flyere A4 (210x297mm) - format mare pentru impact maxim. Ideal pentru menuri, postere mici și materiale educaționale.',
      price: 200.00,
      categoryId: flyereCategory?.id || '',
    },
  ];

  for (const prod of products) {
    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
    console.log(`✅ Product: ${product.name} (${product.slug})`);
  }

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📝 Products available at:');
  console.log('   http://localhost:3000/produse');
  console.log('   http://localhost:3000/produse/flyere-a5/configure');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
