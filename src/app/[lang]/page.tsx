/**
 * Home Page (Multilingual)
 */

import { Locale } from '@/i18n/config';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

interface HomePageProps {
  params: {
    lang: Locale;
  };
}

export default function HomePage({ params }: HomePageProps) {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sanduta.art</h1>
          <LanguageSwitcher currentLocale={params.lang} />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {params.lang === 'ro' && 'Bine ai venit!'}
            {params.lang === 'en' && 'Welcome!'}
            {params.lang === 'ru' && 'Добро пожаловать!'}
          </h2>
          <p className="text-xl text-gray-600">
            {params.lang === 'ro' && 'Sistemul multilingv este funcțional'}
            {params.lang === 'en' && 'The multilingual system is functional'}
            {params.lang === 'ru' && 'Многоязычная система работает'}
          </p>
        </div>
      </main>
    </div>
  );
}
