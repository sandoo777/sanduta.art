'use client';

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  priceFrom: number;
  image: string;
  badge?: string;
  rating: number;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Tablou Canvas',
    priceFrom: 89,
    image: '/products/canvas.jpg',
    badge: 'Best Seller',
    rating: 5,
  },
  {
    id: '2',
    name: 'Fotografii Premium',
    priceFrom: 49,
    image: '/products/photos.jpg',
    badge: 'Popular',
    rating: 5,
  },
  {
    id: '3',
    name: 'Căni Personalizate',
    priceFrom: 39,
    image: '/products/mugs.jpg',
    rating: 5,
  },
  {
    id: '4',
    name: 'Calendare 2026',
    priceFrom: 59,
    image: '/products/calendar.jpg',
    rating: 5,
  },
  {
    id: '5',
    name: 'Tricouri Custom',
    priceFrom: 69,
    image: '/products/tshirts.jpg',
    rating: 5,
  },
  {
    id: '6',
    name: 'Puzzle Foto',
    priceFrom: 79,
    image: '/products/puzzle.jpg',
    rating: 5,
  },
  {
    id: '7',
    name: 'Cărți de vizită',
    priceFrom: 29,
    image: '/products/cards.jpg',
    rating: 5,
  },
  {
    id: '8',
    name: 'Postere XXL',
    priceFrom: 55,
    image: '/products/posters.jpg',
    rating: 5,
  },
];

export function PopularProducts() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            Produse populare
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Descoperă cele mai apreciate produse ale clienților noștri
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative overflow-hidden rounded-xl bg-gray-50 shadow-sm transition-all hover:shadow-xl"
            >
              {/* Badge */}
              {product.badge && (
                <div className="absolute left-3 top-3 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  {product.badge}
                </div>
              )}

              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Placeholder - replace with actual image */}
                <div className="flex h-full items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-20 w-20 rounded-lg bg-gradient-to-br from-primary to-blue-600" />
                    <p className="text-sm font-medium text-gray-600">{product.name}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="mb-2 text-lg font-semibold text-secondary group-hover:text-primary">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="mb-3 flex items-center gap-1">
                  {Array.from({ length: product.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                  <span className="ml-1 text-sm text-gray-600">(5.0)</span>
                </div>

                {/* Price */}
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="text-xs text-gray-500">De la</span>
                  <span className="text-2xl font-bold text-primary">
                    {product.priceFrom} RON
                  </span>
                </div>

                {/* Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-2 border-gray-200 group-hover:border-primary group-hover:text-primary"
                >
                  Configurează
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link href="/products">
            <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
              Vezi toate produsele
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
