import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui';
import { prisma } from '@/lib/prisma';

export async function PopularProducts() {
  // Fetch real products from database
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      descriptionShort: true,
      images: {
        take: 1,
        orderBy: {
          order: 'asc',
        },
        select: {
          url: true,
        },
      },
    },
    take: 8,
    orderBy: {
      createdAt: 'desc',
    },
  });
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
          {products.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-lg text-gray-500">Nu există produse disponibile momentan.</p>
            </div>
          ) : (
            products.map((product) => {
              const imageUrl = product.images[0]?.url || '/placeholder-product.jpg';
              const price = Number(product.price);

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group relative overflow-hidden rounded-xl bg-gray-50 shadow-sm transition-all hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold text-secondary group-hover:text-primary">
                      {product.name}
                    </h3>

                    {/* Description */}
                    {product.descriptionShort && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {product.descriptionShort}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="mb-3 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">(5.0)</span>
                    </div>

                    {/* Price */}
                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="text-xs text-gray-500">De la</span>
                      <span className="text-2xl font-bold text-primary">
                        {price.toFixed(2)} RON
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
              );
            })
          )}
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
