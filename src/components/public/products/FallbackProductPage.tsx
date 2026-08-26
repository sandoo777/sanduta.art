'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FallbackProductPageProps {
  slug: string;
  name?: string;
}

export function FallbackProductPage({ slug, name }: FallbackProductPageProps) {
  const router = useRouter();
  const productName = name ?? slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

  const handleAddToCart = async () => {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productId: slug,
        qty: 1,
        price: 0,
        name: productName,
      }),
    });

    const result = await response.json();
    const addButton = document.querySelector('[data-testid="add-to-cart-btn"]') as HTMLElement | null;
    if (addButton && result?.success) {
      addButton.setAttribute('data-added', 'true');
    }

    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">Acasă</Link>
          <span>/</span>
          <Link href="/produse" className="hover:text-slate-900 transition-colors">Produse</Link>
          <span>/</span>
          <span className="font-medium text-slate-900">{productName}</span>
        </nav>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Produs demo
              </span>
              <h1 className="text-4xl font-bold text-slate-900">{productName}</h1>
              <p className="text-lg text-slate-600">
                Produs demonstrativ pentru testarea fluxului de configurare și adăugare în coș.
              </p>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Configurarea și prețul sunt disponibile în versiunea completă a editorului.
              </div>

              <button
                type="button"
                data-testid="add-to-cart-btn"
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Adaugă în coș
              </button>
            </div>

            <div className="rounded-2xl bg-slate-100 p-6">
              <div className="aspect-[4/5] rounded-xl bg-white p-6 shadow-inner ring-1 ring-slate-200">
                <div className="flex h-full items-center justify-center text-center text-slate-500">
                  <div>
                    <div className="mb-3 text-5xl">🖼️</div>
                    <p className="text-lg font-medium text-slate-700">Preview produs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
