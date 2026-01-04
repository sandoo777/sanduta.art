'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  productsCount: number;
  image: string;
}

const categories: Category[] = [
  {
    id: 'canvas',
    name: 'Tablouri Canvas',
    description: 'Transformă fotografiile în artă',
    productsCount: 12,
    image: '/categories/canvas.jpg',
  },
  {
    id: 'photos',
    name: 'Fotografii Premium',
    description: 'Calitate profesională',
    productsCount: 8,
    image: '/categories/photos.jpg',
  },
  {
    id: 'gifts',
    name: 'Cadouri Personalizate',
    description: 'Idei unice pentru cei dragi',
    productsCount: 24,
    image: '/categories/gifts.jpg',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Materiale promoționale',
    productsCount: 15,
    image: '/categories/business.jpg',
  },
  {
    id: 'home-decor',
    name: 'Decorațiuni',
    description: 'Înfrumusețează-ți casa',
    productsCount: 18,
    image: '/categories/decor.jpg',
  },
  {
    id: 'special',
    name: 'Evenimente Speciale',
    description: 'Produse pentru ocazii unice',
    productsCount: 10,
    image: '/categories/events.jpg',
  },
];

export function FeaturedCategories() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            Categorii recomandate
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Explorează colecțiile noastre și găsește produsul perfect
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-2xl bg-gray-100 shadow-md transition-all hover:shadow-2xl"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                {/* Placeholder - replace with actual image */}
                <div className="flex h-full items-center justify-center transition-transform duration-500 group-hover:scale-110">
                  <div className="text-center">
                    <div className="mx-auto mb-3 h-24 w-24 rounded-full bg-gradient-to-br from-primary to-blue-600" />
                    <p className="text-sm font-medium text-gray-600">
                      {category.name}
                    </p>
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                {/* Products count badge */}
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-secondary shadow-lg backdrop-blur-sm">
                  {category.productsCount} produse
                </div>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="mb-2 text-2xl font-bold">
                  {category.name}
                </h3>
                <p className="mb-4 text-sm text-white/90">
                  {category.description}
                </p>
                
                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3">
                  <span>Explorează</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Hover border effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors group-hover:border-primary" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
