import { Footer } from '@/components/public/Footer';
import { generateMetadata } from './seo';

export const metadata = generateMetadata();

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
