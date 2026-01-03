import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: 'Фото на бумаге 10x15',
        category: 'Фото на бумаге',
        price: 50,
      },
      {
        name: 'Холст 30x40',
        category: 'Холст',
        price: 500,
      },
      {
        name: 'Кружка с фото',
        category: 'Кружки',
        price: 200,
      },
    ],
  });

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password: '$2b$10$ysMrPS/I.zIeAEBA9ykaxO8wxFLmLPVh84wdrTms2cijstqoiAM8a',
      role: 'admin',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });