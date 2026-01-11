import dynamic from 'next/dynamic';
import { Hero, PopularProducts } from '@/components/public/home';

// ISR: Revalidate homepage every 60 seconds
export const revalidate = 60;

// Lazy load heavy components for better performance
const WhyChooseUs = dynamic(
  () => import('@/components/public/home').then((mod) => ({ default: mod.WhyChooseUs })),
  {
    loading: () => <div className="min-h-[400px] bg-gradient-to-br from-gray-50 to-blue-50/30" />,
  }
);

const FeaturedCategories = dynamic(
  () => import('@/components/public/home').then((mod) => ({ default: mod.FeaturedCategories })),
  {
    loading: () => <div className="min-h-[400px] bg-white" />,
  }
);

const Testimonials = dynamic(
  () => import('@/components/public/home').then((mod) => ({ default: mod.Testimonials })),
  {
    loading: () => <div className="min-h-[400px] bg-gradient-to-br from-primary/5 to-blue-50" />,
  }
);

const FinalCTA = dynamic(
  () => import('@/components/public/home').then((mod) => ({ default: mod.FinalCTA })),
  {
    loading: () => <div className="min-h-[300px] bg-gradient-to-br from-primary via-blue-600 to-blue-700" />,
  }
);

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://sanduta.art/#website',
      url: 'https://sanduta.art',
      name: 'Sanduta.Art',
      description: 'Tipărire foto online premium - Tablouri canvas, fotografii pe hârtie, cadouri personalizate',
      inLanguage: 'ro-RO',
      publisher: {
        '@id': 'https://sanduta.art/#organization',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://sanduta.art/#organization',
      name: 'Sanduta.Art',
      url: 'https://sanduta.art',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sanduta.art/logo.png',
        width: 512,
        height: 512,
      },
      image: {
        '@type': 'ImageObject',
        url: 'https://sanduta.art/og-image.jpg',
        width: 1200,
        height: 630,
      },
      description: 'Serviciu profesional de tipărire foto online cu livrare rapidă în toată țara',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'RO',
        addressLocality: 'București',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+40-123-456-789',
        contactType: 'customer service',
        email: 'contact@sanduta.art',
        availableLanguage: ['ro', 'ru'],
      },
      sameAs: [
        'https://facebook.com/sandutaart',
        'https://instagram.com/sandutaart',
        'https://youtube.com/@sandutaart',
      ],
    },
    {
      '@type': 'WebPage',
      '@id': 'https://sanduta.art/#webpage',
      url: 'https://sanduta.art',
      name: 'Tipărire foto online premium | Sanduta.Art',
      description: 'Comandă online tipărire foto premium: tablouri canvas, fotografii pe hârtie, cadouri personalizate. Livrare rapidă, calitate garantată.',
      inLanguage: 'ro-RO',
      isPartOf: {
        '@id': 'https://sanduta.art/#website',
      },
      about: {
        '@id': 'https://sanduta.art/#organization',
      },
      breadcrumb: {
        '@id': 'https://sanduta.art/#breadcrumb',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://sanduta.art/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Acasă',
          item: 'https://sanduta.art',
        },
      ],
    },
    {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '1000',
      bestRating: '5',
      worstRating: '1',
    },
  ],
};

export default function PublicHomePage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Page Content */}
      <Hero />
      <PopularProducts />
      <WhyChooseUs />
      <FeaturedCategories />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
