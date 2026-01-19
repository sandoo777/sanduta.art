import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Configurator } from '@/components/configurator/Configurator';

// ISR: Revalidate product pages every 5 minutes
export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { name: true, metaTitle: true, metaDescription: true, ogImage: true },
  });

  if (!product) {
    return { title: 'Produs negăsit' };
  }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || undefined,
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || undefined,
      images: product.ogImage ? [{ url: product.ogImage }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: { id: true, slug: true, name: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Acasă
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-900 transition-colors">
            Produse
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-900">{product.name}</span>
        </nav>

        {/* Main Product Configurator */}
        <Configurator productId={product.id} />
      </div>
    </div>
  );
}
