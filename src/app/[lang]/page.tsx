/**
 * Home Page (Multilingual)
 */

import { Locale } from '@/i18n/config';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

// ISR: Revalidate multilingual homepage every 60 seconds
export const revalidate = 60;

interface HomePageProps {
  params: Promise<{
    lang: Locale;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sanduta.art</h1>
          <LanguageSwitcher currentLocale={lang} />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {lang === 'ro' && 'Bine ai venit!'}
            {lang === 'en' && 'Welcome!'}
            {lang === 'ru' && 'Добро пожаловать!'}
          </h2>
          <p className="text-xl text-gray-600">
            {lang === 'ro' && 'Sistemul multilingv este funcțional'}
            {lang === 'en' && 'The multilingual system is functional'}
            {lang === 'ru' && 'Многоязычная система работает'}
          </p>
        </div>
      </main>
    </div>
  );
}
