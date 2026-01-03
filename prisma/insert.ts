import "dotenv/config";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    { name: 'Фото на бумаге 10x15', category: 'Фото на бумаге', price: 50, image_url: '/images/photo-print.jpg' },
    { name: 'Холст 30x40', category: 'Холст', price: 500, image_url: '/images/canvas.jpg' },
    { name: 'Кружка с фото', category: 'Кружки', price: 200, image_url: '/images/mug.jpg' },
    { name: 'Футболка с принтом', category: 'Футболки', price: 300, image_url: '/images/tshirt.jpg' },
    { name: 'Чехол для iPhone', category: 'Чехлы для телефона', price: 150, image_url: '/images/phone-case.jpg' },
    { name: 'Календарь', category: 'Календари', price: 250, image_url: '/images/calendar.jpg' },
    { name: 'Фотокнига', category: 'Книги', price: 800, image_url: '/images/photo-book.jpg' },
    { name: 'Пазл 500 элементов', category: 'Пазлы', price: 400, image_url: '/images/puzzle.jpg' },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Products inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });