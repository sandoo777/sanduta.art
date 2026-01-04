import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termeni și condiții',
  description: 'Termenii și condițiile de utilizare a serviciilor Sanduta.Art',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-secondary">Termeni și condiții</h1>
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Aici vor fi termenii și condițiile de utilizare a serviciului.
          </p>
        </div>
      </div>
    </div>
  );
}
