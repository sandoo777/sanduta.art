import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactează-ne pentru comenzi, întrebări sau suport. Email: contact@sanduta.art, Telefon: +40 123 456 789',
  openGraph: {
    title: 'Contact | Sanduta.Art',
    description: 'Contactează-ne pentru comenzi și suport.',
    url: 'https://sanduta.art/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-secondary">Contact</h1>
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-secondary">Email</h2>
            <p className="text-gray-600">contact@sanduta.art</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary">Telefon</h2>
            <p className="text-gray-600">+40 123 456 789</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary">Adresă</h2>
            <p className="text-gray-600">București, România</p>
          </div>
        </div>
      </div>
    </div>
  );
}
