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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });