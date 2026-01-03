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
];

export let orders: Order[] = [];