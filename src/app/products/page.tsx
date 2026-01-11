import { Metadata } from 'next';
import CatalogClient from '../(public)/produse/CatalogClient';

export const metadata: Metadata = {
  title: 'Products | Complete Catalog - Sanduta Art',
  description:
    'Discover all our premium printing products: flyers, business cards, banners, posters and more. Competitive prices, fast delivery in Moldova.',
  keywords:
    'printing, printing products, flyers, business cards, banners, posters, brochures, catalogs, print, Moldova',
  openGraph: {
    title: 'Products Catalog - Sanduta Art',
    description:
      'Discover all our premium printing products. Competitive prices, fast delivery.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function ProductsPage() {
  return <CatalogClient />;
}
