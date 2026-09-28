import Link from 'next/link';
import { SuppliersManager } from '@/components/purchasing/SuppliersManager';

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin" className="hover:text-slate-700">Admin</Link>
          <span>/</span>
          <Link href="/suppliers" className="hover:text-slate-700">Depozit</Link>
          <span>/</span>
          <span className="font-medium text-slate-700">Furnizori</span>
        </nav>

        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">Suppliers</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Supplier directory</h1>
        </div>
        <SuppliersManager />
      </div>
    </div>
  );
}
