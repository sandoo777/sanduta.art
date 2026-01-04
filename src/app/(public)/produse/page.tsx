import { Metadata } from 'next';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = {
  title: 'Produse Tipografice | Catalog Complet - Sanduta Art',
  description:
    'Descoperă toate produsele noastre tipografice premium: flyere, cărți de vizită, bannere, postere și multe altele. Prețuri competitive, livrare rapidă în Moldova.',
  keywords:
    'tipografie, produse tipografice, flyere, cărți de vizită, bannere, postere, broșuri, cataloage, imprimare, Moldova',
  openGraph: {
    title: 'Catalog Produse Tipografice - Sanduta Art',
    description:
      'Descoperă toate produsele noastre tipografice premium. Prețuri competitive, livrare rapidă.',
    type: 'website',
    locale: 'ro_RO',
  },
};

export default function ProductsPage() {
  return <CatalogClient />;
}
