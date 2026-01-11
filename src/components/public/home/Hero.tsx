'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { useEffect, useState } from 'react';

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-20 lg:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div
            className={`flex flex-col justify-center transition-all duration-1000 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Calitate premium garantată</span>
            </div>

            {/* Heading */}
            <h1 className="mb-6 text-4xl font-bold leading-tight text-secondary sm:text-5xl lg:text-6xl">
              Tipărim <span className="text-primary">calitate</span>.
              <br />
              Rapid. Profesional.
            </h1>

            {/* Subtitle */}
            <p className="mb-8 text-lg text-gray-600 sm:text-xl">
              Transformăm fotografiile tale în opere de artă durabile. 
              Tablouri canvas, fotografii pe hârtie premium, cadouri personalizate și multe altele.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/products">
                <Button size="lg" className="group w-full sm:w-auto">
                  Comandă acum
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white sm:w-auto"
                >
                  Vezi produsele
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-primary to-blue-600"
                    />
                  ))}
                </div>
                <span className="font-medium">1000+ clienți mulțumiți</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 fill-accent text-accent"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 font-medium">5.0 rating</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div
            className={`relative transition-all duration-1000 delay-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-2xl">
              {/* Placeholder for product showcase */}
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-32 w-32 rounded-full bg-gradient-to-br from-primary to-blue-600" />
                  <p className="text-lg font-semibold text-secondary">
                    Sanduta.Art
                  </p>
                  <p className="text-sm text-gray-600">
                    Exemplu de produs premium
                  </p>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute left-4 top-4 rounded-lg bg-white px-3 py-2 shadow-lg">
                <p className="text-xs font-medium text-gray-600">Livrare rapidă</p>
                <p className="text-lg font-bold text-primary">2-3 zile</p>
              </div>
              <div className="absolute bottom-4 right-4 rounded-lg bg-white px-3 py-2 shadow-lg">
                <p className="text-xs font-medium text-gray-600">Starting from</p>
                <p className="text-lg font-bold text-accent">49 RON</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
