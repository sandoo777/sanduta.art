import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Despre noi',
  description: 'Sanduta.Art este serviciul tău de încredere pentru imprimare foto profesională. Transformăm amintirile tale în opere de artă durabile și de calitate superioară.',
  openGraph: {
    title: 'Despre noi | Sanduta.Art',
    description: 'Serviciu profesional de tipărire foto cu peste 10.000 de comenzi livrate.',
    url: 'https://sanduta.art/about',
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-secondary">Despre noi</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600">
            Sanduta.Art este serviciul tău de încredere pentru imprimare foto profesională.
            Transformăm amintirile tale în opere de artă durabile și de calitate superioară.
          </p>
        </div>
      </div>
    </div>
  );
}
