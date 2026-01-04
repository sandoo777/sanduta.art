import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-blue-700 py-16 lg:py-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-1/4 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-1/4 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <span>🎨</span>
            <span>Începe acum să creezi</span>
          </div>

          {/* Heading */}
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Gata să începi comanda?
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 sm:text-xl">
            Transformă-ți ideile în realitate. Procesul este simplu, rapid și rezultatul va fi uimitor!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/products">
              <Button
                size="lg"
                className="w-full bg-white text-primary hover:bg-gray-100 sm:w-auto"
              >
                Vezi produsele
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-white bg-transparent text-white hover:bg-white/10 sm:w-auto"
              >
                <Phone className="mr-2 h-5 w-5" />
                Contactează-ne
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Livrare în 2-3 zile</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Calitate garantată</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Suport 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
