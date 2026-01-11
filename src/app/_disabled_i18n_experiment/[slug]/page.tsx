/**
 * Dynamic Page - Public (Multilingual)
 * Renders CMS pages like /ro/despre-noi, /en/about, /ru/o-nas, etc.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Locale } from '@/i18n/config';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
}

async function getPage(slug: string, lang: Locale): Promise<PageData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/cms/pages/${slug}?lang=${lang}`, {
      cache: 'no-store', // TODO: Change to revalidate in production
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error('Failed to fetch page:', err);
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string; lang: Locale }> 
}): Promise<Metadata> {
  const { slug, lang } = await params;
  const page = await getPage(slug, lang);

  if (!page) {
    const titles = {
      ro: 'Pagină Negăsită',
      en: 'Page Not Found',
      ru: 'Страница не найдена',
    };

    return {
      title: titles[lang] || titles.ro,
    };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription,
      ...(page.ogImage && { images: [page.ogImage] }),
    },
  };
}

export default async function DynamicPage({ 
  params 
}: { 
  params: Promise<{ slug: string; lang: Locale }> 
}) {
  const { slug, lang } = await params;
  const page = await getPage(slug, lang);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
