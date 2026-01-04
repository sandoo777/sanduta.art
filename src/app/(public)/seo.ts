import type { Metadata } from 'next';

export const seoConfig = {
  title: 'Sanduta.Art - Tipărire foto online | Tablouri canvas, cadouri personalizate',
  description: 'Comandă online tipărire foto premium: tablouri canvas, fotografii pe hârtie, cadouri personalizate. Livrare rapidă în 2-3 zile, calitate garantată, prețuri competitive.',
  keywords: [
    'tipărire foto online',
    'tablouri canvas',
    'fotografii premium',
    'cadouri personalizate',
    'tipografie online',
    'print foto',
    'canvas personalizat',
    'căni personalizate',
    'tricouri custom',
    'calendare personalizate',
    'livrare rapidă',
    'calitate premium',
  ] as string[],
  authors: [{ name: 'Sanduta.Art' }],
  creator: 'Sanduta.Art',
  publisher: 'Sanduta.Art',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sanduta.art'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website' as const,
    locale: 'ro_RO',
    url: 'https://sanduta.art',
    title: 'Sanduta.Art - Tipărire foto online premium',
    description: 'Tipărire foto profesională: tablouri canvas, fotografii pe hârtie, cadouri personalizate. Calitate garantată, livrare rapidă.',
    siteName: 'Sanduta.Art',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sanduta.Art - Tipărire foto online premium',
      },
    ] as Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>,
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Sanduta.Art - Tipărire foto online premium',
    description: 'Tipărire foto profesională: tablouri canvas, fotografii pe hârtie, cadouri personalizate.',
    images: ['/og-image.jpg'] as string[],
    creator: '@sandutaart',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export function generateMetadata(): Metadata {
  return {
    title: {
      default: seoConfig.title,
      template: '%s | Sanduta.Art',
    },
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    authors: seoConfig.authors,
    creator: seoConfig.creator,
    publisher: seoConfig.publisher,
    formatDetection: seoConfig.formatDetection,
    metadataBase: seoConfig.metadataBase,
    alternates: seoConfig.alternates,
    openGraph: seoConfig.openGraph,
    twitter: seoConfig.twitter,
    robots: seoConfig.robots,
    icons: seoConfig.icons,
    manifest: seoConfig.manifest,
  };
}
