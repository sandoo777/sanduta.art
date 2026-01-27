import { PublicFooter } from '@/components/common/footers/PublicFooter';

/**
 * ProductsLayout - Layout pentru catalogul de produse
 * 
 * IMPORTANT: Nu include PublicHeader aici!
 * Header-ul este gestionat de ConditionalHeader din root layout
 * (src/app/layout.tsx) pentru consistență în întreaga aplicație.
 */
export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
