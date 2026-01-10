/**
 * I18N USAGE EXAMPLES
 * Exemple complete de utilizare a sistemului multilingv
 */

// ============================================
// 1. CLIENT COMPONENT - Utilizare Basic
// ============================================

'use client';
import { useT, useTranslations } from '@/context/TranslationContext';

export function ProductCard() {
  const t = useT();
  
  return (
    <div className="product-card">
      <h3>{t('product.title')}</h3>
      <p>{t('product.description')}</p>
      <button>{t('product.addToCart')}</button>
    </div>
  );
}

// ============================================
// 2. CLIENT COMPONENT - Cu Parametri
// ============================================

export function ValidationMessage({ min, max }: { min: number; max: number }) {
  const t = useT();
  
  return (
    <p className="error">
      {t('validation.min', { min })}
    </p>
  );
}

// ============================================
// 3. SERVER COMPONENT - Async
// ============================================

import { loadTranslations, createTranslateFunction } from '@/lib/i18n/translations';
import type { Locale } from '@/i18n/config';

export default async function HomePage({ params }: { params: { lang: Locale } }) {
  const translations = await loadTranslations(params.lang);
  const t = createTranslateFunction(params.lang, translations);
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('common.welcome')}</p>
    </div>
  );
}

// ============================================
// 4. API ROUTE - Cu Traduceri
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getLocalizedProduct } from '@/lib/i18n/product-translations';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Obține limba din cookie sau URL
  const locale = req.cookies.get('NEXT_LOCALE')?.value || 'ro';
  
  // Fetch produs
  const product = await prisma.product.findUnique({
    where: { id: 'prod-1' },
  });
  
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  
  // Localizează produsul
  const localizedProduct = getLocalizedProduct(product, locale as any);
  
  return NextResponse.json(localizedProduct);
}

// ============================================
// 5. PRODUCT TRANSLATIONS - Complete
// ============================================

import { getProductName, getProductDescription, getLocalizedProduct } from '@/lib/i18n/product-translations';

// Produs cu traduceri
const product = {
  id: 'prod-1',
  name: 'Default Name',
  description: 'Default Description',
  translations: {
    ro: {
      name: 'Cană personalizată',
      description: 'Cană ceramică cu design personalizat',
      descriptionShort: 'Cană personalizată premium',
    },
    en: {
      name: 'Custom Mug',
      description: 'Ceramic mug with custom design',
      descriptionShort: 'Premium custom mug',
    },
    ru: {
      name: 'Персонализированная кружка',
      description: 'Керамическая кружка с индивидуальным дизайном',
      descriptionShort: 'Премиум персонализированная кружка',
    },
  },
};

// Utilizare
const nameRo = getProductName(product, 'ro'); // "Cană personalizată"
const nameEn = getProductName(product, 'en'); // "Custom Mug"
const descRu = getProductDescription(product, 'ru'); // "Керамическая кружка..."

// Sau complet
const localizedRo = getLocalizedProduct(product, 'ro');
// { ...product, name: "Cană personalizată", description: "..." }

// ============================================
// 6. CMS TRANSLATIONS - Pages & Blog
// ============================================

import { getPageTitle, getPageContent, getLocalizedPage } from '@/lib/i18n/cms-translations';

const page = {
  id: 'page-1',
  translations: {
    ro: {
      title: 'Despre noi',
      slug: 'despre-noi',
      content: 'Conținut în română...',
    },
    en: {
      title: 'About Us',
      slug: 'about-us',
      content: 'Content in English...',
    },
    ru: {
      title: 'О нас',
      slug: 'o-nas',
      content: 'Содержание на русском...',
    },
  },
};

// Utilizare
const titleEn = getPageTitle(page, 'en'); // "About Us"
const contentRo = getPageContent(page, 'ro'); // "Conținut în română..."

// Sau complet
const localizedPage = getLocalizedPage(page, 'ru');

// ============================================
// 7. EMAIL TEMPLATES - Multilingve
// ============================================

import { getEmailTemplate, interpolateEmailTemplate } from '@/lib/email/templates-i18n';
import { sendEmail } from '@/lib/email';

async function sendOrderConfirmation(orderId: string, locale: Locale) {
  // Obține template
  const template = getEmailTemplate('orderConfirmation', locale);
  
  if (!template) {
    throw new Error('Template not found');
  }
  
  // Interpolează variabile
  const email = interpolateEmailTemplate(template, {
    customerName: 'Ion Popescu',
    orderId: orderId,
    total: '500',
    status: 'PENDING',
    productionTime: '3-5',
  });
  
  // Trimite email
  await sendEmail({
    to: 'customer@example.com',
    subject: email.subject,
    html: `
      <html>
        <body>
          ${email.greeting}
          ${email.body}
          ${email.footer}
        </body>
      </html>
    `,
  });
}

// ============================================
// 8. SEO TAGS - Multilingual
// ============================================

import { generateSeoTags, generateHreflangTags } from '@/lib/seo/generateSeoTags';

export async function generateMetadata({ params }: { params: { lang: Locale } }) {
  const meta = {
    title: {
      ro: 'Produse personalizate',
      en: 'Custom Products',
      ru: 'Индивидуальные продукты',
    }[params.lang],
    description: {
      ro: 'Creează și comandă produse personalizate',
      en: 'Create and order custom products',
      ru: 'Создавайте индивидуальные продукты',
    }[params.lang],
  };
  
  const seoTags = generateSeoTags(
    {
      title: meta.title,
      description: meta.description,
    },
    params.lang,
    '/products'
  );
  
  return seoTags;
}

// ============================================
// 9. LANGUAGE SWITCHER - Implementare
// ============================================

import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

export function Header({ locale }: { locale: Locale }) {
  return (
    <header>
      <nav>
        {/* Logo, menu, etc. */}
      </nav>
      
      {/* Desktop */}
      <div className="hidden md:block">
        <LanguageSwitcher currentLocale={locale} variant="dropdown" />
      </div>
      
      {/* Mobile */}
      <div className="md:hidden">
        <LanguageSwitcher currentLocale={locale} variant="compact" />
      </div>
    </header>
  );
}

// ============================================
// 10. CONFIGURATOR - Cu Traduceri
// ============================================

import configuratorTranslations from '@/i18n/configurator.json';

export function ConfiguratorStep({ locale }: { locale: Locale }) {
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = configuratorTranslations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value?.[locale] || key;
  };
  
  return (
    <div>
      <h2>{t('steps.configure')}</h2>
      <label>{t('options.material')}</label>
      <button>{t('actions.continue')}</button>
      <p>{t('pricing.estimatedPrice')}: 500 RON</p>
    </div>
  );
}

// ============================================
// 11. EDITOR - Cu Traduceri
// ============================================

import editorTranslations from '@/i18n/editor.json';

export function EditorToolbar({ locale }: { locale: Locale }) {
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = editorTranslations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value?.[locale] || key;
  };
  
  return (
    <div className="toolbar">
      <button title={t('toolbar.text')}>{t('toolbar.text')}</button>
      <button title={t('toolbar.image')}>{t('toolbar.image')}</button>
      <button title={t('toolbar.shape')}>{t('toolbar.shape')}</button>
      <button title={t('actions.undo')}>{t('actions.undo')}</button>
      <button title={t('actions.redo')}>{t('actions.redo')}</button>
    </div>
  );
}

// ============================================
// 12. PRISMA - Query cu Traduceri
// ============================================

import { prisma } from '@/lib/prisma';
import { getLocalizedProduct } from '@/lib/i18n/product-translations';

async function getProducts(locale: Locale) {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true,
      images: true,
    },
  });
  
  // Localizează toate produsele
  return products.map(product => getLocalizedProduct(product, locale));
}

// ============================================
// 13. MIDDLEWARE - Custom Logic
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getLocaleFromPath, addLocaleToPath } from '@/lib/i18n/middleware';

export function customMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const locale = getLocaleFromPath(pathname);
  
  // Custom logic bazată pe limbă
  if (locale === 'ru' && pathname.includes('/checkout')) {
    // Redirect către pagină specială pentru RU
    return NextResponse.redirect(new URL('/ru/checkout-ru', req.url));
  }
  
  return NextResponse.next();
}

// ============================================
// 14. FORM VALIDATION - Multilingv
// ============================================

import { useT } from '@/context/TranslationContext';

export function ContactForm() {
  const t = useT();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (data: any) => {
    const newErrors: Record<string, string> = {};
    
    if (!data.email) {
      newErrors.email = t('validation.required');
    } else if (!isValidEmail(data.email)) {
      newErrors.email = t('validation.email');
    }
    
    if (data.message?.length < 10) {
      newErrors.message = t('validation.min', { min: 10 });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // ...
}

// ============================================
// 15. ADMIN - Editare Traduceri
// ============================================

async function updateTranslation(key: string, locale: Locale, value: string) {
  const response = await fetch('/api/admin/translations', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, locale, value }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update translation');
  }
  
  return response.json();
}

// Utilizare
await updateTranslation('product.addToCart', 'ro', 'Adaugă în coș');
await updateTranslation('product.addToCart', 'en', 'Add to Cart');
await updateTranslation('product.addToCart', 'ru', 'В корзину');
