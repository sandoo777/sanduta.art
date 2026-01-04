import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de confidențialitate',
  description: 'Politica de confidențialitate și protecție a datelor personale Sanduta.Art',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-secondary">Politica de confidențialitate</h1>
        <div className="prose max-w-none">
          <p className="text-gray-600">
            Aici va fi politica de confidențialitate a serviciului.
          </p>
        </div>
      </div>
    </div>
  );
}
