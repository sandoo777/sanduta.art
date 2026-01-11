import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termeni și condiții',
  description: 'Termenii și condițiile de utilizare a serviciilor Sanduta.Art',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  const lastUpdated = '11 Ianuarie 2026';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Termeni și Condiții de Utilizare
          </h1>
          <p className="text-sm text-gray-500">
            Ultima actualizare: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              1. Acceptarea termenilor
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Prin accesarea și utilizarea platformei, sunteți de acord cu acești Termeni și 
              Condiții. Dacă nu sunteți de acord, vă rugăm să nu utilizați platforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              2. Descrierea serviciilor
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Platforma oferă servicii de configurare, comandă și gestionare a produselor 
              tipografice, atât online cât și offline.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              3. Contul utilizatorului
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Utilizatorii sunt responsabili pentru:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>păstrarea confidențialității datelor de autentificare</li>
              <li>acuratețea informațiilor furnizate</li>
              <li>activitatea desfășurată în cont</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              4. Comenzi și plăți
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Prin plasarea unei comenzi, confirmați că:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>toate datele furnizate sunt corecte</li>
              <li>aveți dreptul de a utiliza metoda de plată selectată</li>
              <li>înțelegeți că unele produse sunt personalizate și nu pot fi returnate</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              5. Politica de anulare
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Comenzile personalizate pot fi anulate doar înainte de intrarea în producție.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              6. Proprietate intelectuală
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Toate materialele, designurile și conținutul platformei sunt protejate prin 
              drepturi de autor.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              7. Limitarea răspunderii
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Platforma nu este responsabilă pentru:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>erori cauzate de fișiere încărcate greșit</li>
              <li>întârzieri cauzate de furnizori externi</li>
              <li>utilizarea incorectă a produselor</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              8. Modificări
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ne rezervăm dreptul de a modifica acești termeni oricând.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              9. Contact
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
