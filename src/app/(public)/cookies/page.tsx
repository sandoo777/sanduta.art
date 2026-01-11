import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de Cookies',
  description: 'Politica de utilizare a cookies pe platforma Sanduta.Art',
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesPage() {
  const lastUpdated = '11 Ianuarie 2026';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Politica de Cookies
          </h1>
          <p className="text-sm text-gray-500">
            Ultima actualizare: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              1. Ce sunt cookie-urile
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Cookie-urile sunt fișiere mici stocate pe dispozitivul utilizatorului pentru 
              a îmbunătăți experiența de navigare.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              2. Tipuri de cookie-uri utilizate
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li><strong>Cookie-uri necesare</strong> (autentificare, sesiune)</li>
              <li><strong>Cookie-uri de performanță</strong> (analytics)</li>
              <li><strong>Cookie-uri funcționale</strong> (preferințe)</li>
              <li><strong>Cookie-uri de marketing</strong> (remarketing)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              3. Cum folosim cookie-urile
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Utilizăm cookie-uri pentru:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>funcționarea corectă a platformei</li>
              <li>analiză trafic</li>
              <li>personalizarea experienței</li>
              <li>campanii de marketing</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              4. Gestionarea cookie-urilor
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Utilizatorii pot dezactiva cookie-urile din setările browserului, însă anumite 
              funcționalități pot deveni indisponibile.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              5. Contact
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Pentru întrebări: <a href="mailto:contact@sanduta.art" className="text-primary hover:underline">contact@sanduta.art</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
