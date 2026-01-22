import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de confidențialitate',
  description: 'Politica de confidențialitate și protecție a datelor personale Sanduta.Art',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  const lastUpdated = '11 Ianuarie 2026';

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary mb-4">
            Politica de Confidențialitate
          </h1>
          <p className="text-sm text-gray-500">
            Ultima actualizare: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              1. Introducere
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Această politică explică modul în care colectăm, utilizăm și protejăm datele 
              personale ale utilizatorilor.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              2. Date colectate
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Colectăm:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>date de cont (nume, email, telefon)</li>
              <li>date de comandă</li>
              <li>fișiere încărcate pentru producție</li>
              <li>date tehnice (IP, device, cookies)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              3. Scopul colectării
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Datele sunt utilizate pentru:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>procesarea comenzilor</li>
              <li>comunicări legate de comenzi</li>
              <li>îmbunătățirea platformei</li>
              <li>securitate și prevenirea fraudelor</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              4. Partajarea datelor
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Datele pot fi partajate doar cu:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>furnizori de servicii (curieri, procesatori de plăți)</li>
              <li>autorități, dacă este necesar legal</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              5. Stocarea datelor
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Datele sunt stocate în medii securizate și nu sunt vândute către terți.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              6. Drepturile utilizatorilor
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Utilizatorii pot solicita:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
              <li>acces la date</li>
              <li>corectarea datelor</li>
              <li>ștergerea datelor</li>
              <li>exportul datelor</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              7. Securitate
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Aplicăm măsuri tehnice și organizaționale pentru protejarea datelor.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-secondary mt-8">
              8. Contact
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Pentru solicitări GDPR: <a href="mailto:contact@sanduta.art" className="text-primary hover:underline">contact@sanduta.art</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
