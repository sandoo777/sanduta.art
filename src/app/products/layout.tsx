import { PublicHeader } from '@/components/common/headers/PublicHeader';
import { PublicFooter } from '@/components/common/footers/PublicFooter';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
