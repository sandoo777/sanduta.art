/**
 * Root Layout for Multilingual Routes
 * Layout-ul principal pentru rutele multilingve: /[lang]/...
 */

import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { isValidLocale, type Locale } from '@/i18n/config';
import { loadTranslations } from '@/lib/i18n/translations';
import { TranslationProvider } from '@/context/TranslationContext';
import '../globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

interface RootLayoutProps {
  children: ReactNode;
  params: {
    lang: string;
  };
}

export async function generateStaticParams() {
  return [
    { lang: 'ro' },
    { lang: 'en' },
    { lang: 'ru' },
  ];
}

export async function generateMetadata({ params }: RootLayoutProps) {
  const locale = params.lang as Locale;
  
  const titles = {
    ro: 'Sanduta.art - Produse personalizate tipărite',
    en: 'Sanduta.art - Custom printed products',
    ru: 'Sanduta.art - Индивидуальная печать продуктов',
  };

  const descriptions = {
    ro: 'Creează și comandă produse personalizate cu design unic. Configurator online simplu și rapid.',
    en: 'Create and order custom products with unique designs. Simple and fast online configurator.',
    ru: 'Создавайте и заказывайте индивидуальные продукты с уникальным дизайном. Простой онлайн-конфигуратор.',
  };

  return {
    title: titles[locale] || titles.ro,
    description: descriptions[locale] || descriptions.ro,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ro': '/ro',
        'en': '/en',
        'ru': '/ru',
      },
    },
  };
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  // Validare locale
  if (!isValidLocale(params.lang)) {
    notFound();
  }

  const locale = params.lang as Locale;
  
  // Încarcă traducerile pentru limba curentă
  const translations = await loadTranslations(locale);

  return (
    <html lang={locale} dir="ltr">
      <body className={inter.className}>
        <TranslationProvider locale={locale} translations={translations}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
