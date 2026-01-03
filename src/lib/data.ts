import { Product, Order } from './types';

export const products: Product[] = [
  {
    id: 1,
    name: 'Фото на бумаге 10x15',
    price: 50,
    category: 'Фото на бумаге',
    image_url: '/images/photo-print.jpg',
  },
  {
    id: 2,
    name: 'Холст 30x40',
    price: 500,
    category: 'Холст',
    image_url: '/images/canvas.jpg',
  },
  {
    id: 3,
    name: 'Кружка с фото',
    price: 200,
    category: 'Кружки',
    image_url: '/images/mug.jpg',
  },
  {
    id: 4,
    name: 'Футболка с принтом',
    price: 300,
    category: 'Футболки',
    image_url: '/images/tshirt.jpg',
  },
  {
    id: 5,
    name: 'Чехол для iPhone',
    price: 150,
    category: 'Чехлы для телефона',
    image_url: '/images/phone-case.jpg',
  },
  {
    id: 6,
    name: 'Календарь',
    price: 250,
    category: 'Календари',
    image_url: '/images/calendar.jpg',
  },
  {
    id: 7,
    name: 'Фотокнига',
    price: 800,
    category: 'Книги',
    image_url: '/images/photo-book.jpg',
  },
  {
    id: 8,
    name: 'Пазл 500 элементов',
    price: 400,
    category: 'Пазлы',
    image_url: '/images/puzzle.jpg',
  },
];

export let orders: Order[] = [];