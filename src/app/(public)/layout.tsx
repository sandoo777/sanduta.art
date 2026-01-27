import { Footer } from '@/components/public/Footer';
import { generateMetadata } from './seo';

export const metadata = generateMetadata();

/**
 * PublicLayout - Layout pentru paginile publice
 * 
 * IMPORTANT: Nu include Header aici!
 * Header-ul pentru paginile publice este gestionat de ConditionalHeader
 * din root layout (src/app/layout.tsx) pentru a permite control unificat
 * al afișării header-ului în întreaga aplicație.
 */
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
