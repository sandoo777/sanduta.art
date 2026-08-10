'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLink } from '@/components/common/links/AuthLink';
import { Button } from '@/components/ui/Button';
import { EmptySearch, EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { Table } from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table.types';
import { Plus, Package } from 'lucide-react';
import { useProducts } from '@/modules/products/useProducts';
import type { Product } from '@/modules/products/types';

type ProductRow = Product & {
  defaultPrintMethod?: {
    id: string;
    name: string;
    isOutsourced?: boolean;
    costFurnizorPerM2?: number | null;
    costFurnizorPerUnit?: number | null;
    markup?: number | null;
  } | null;
};

function formatMoney(value: number) {
  return value.toLocaleString('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getSalePrice(product: ProductRow) {
  const isOutsource = Boolean(product.defaultPrintMethod?.isOutsourced ?? product.isOutsourced);
  if (isOutsource) {
    const base = product.saleUnit === 'M2'
      ? Number(product.defaultPrintMethod?.costFurnizorPerM2 ?? 0)
      : Number(product.defaultPrintMethod?.costFurnizorPerUnit ?? 0);
    const markup = Number(product.defaultPrintMethod?.markup ?? 0);
    return base + (base * markup / 100);
  }

  return product.saleUnit === 'M2'
    ? Number(product.pricePerM2 ?? 0)
    : Number(product.pricePerUnit ?? 0);
}

export default function ProductsPage() {
  const router = useRouter();
  const { getProducts, toggleProductStatus, filterProducts } = useProducts();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [printMethodFilter, setPrintMethodFilter] = useState('all');
  const [sourcingFilter, setSourcingFilter] = useState<'all' | 'INTERNAL' | 'OUTSOURCE'>('all');
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingData(true);
        const data = await getProducts();
        setProducts(data as ProductRow[]);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadProducts();
  }, [getProducts]);

  const printMethodOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) => {
      if (product.defaultPrintMethod?.id) {
        map.set(product.defaultPrintMethod.id, product.defaultPrintMethod.name);
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return filterProducts(products, {
      search: searchTerm,
      printMethodId: printMethodFilter,
      sourcing: sourcingFilter,
      activeOnly,
    });
  }, [products, searchTerm, printMethodFilter, sourcingFilter, activeOnly, filterProducts]);

  const columns: Column<ProductRow>[] = [
    {
      key: 'name',
      label: 'Nume produs',
      sortable: true,
      accessor: 'name',
      render: (product) => (
        <div className="min-w-[180px]">
          <p className="font-semibold text-gray-900">{product.name}</p>
          {product.sku && <p className="text-xs text-gray-500">SKU: {product.sku}</p>}
        </div>
      ),
    },
    {
      key: 'method',
      label: 'Metoda printare',
      render: (product) => (
        <span className="text-sm text-gray-700">
          {product.defaultPrintMethod?.name ?? 'Neconfigurat'}
        </span>
      ),
    },
    {
      key: 'saleUnit',
      label: 'Tip produs',
      render: (product) => (
        <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
          {product.saleUnit === 'M2' ? 'm²' : 'bucată'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Preț vânzare',
      render: (product) => (
        <span className="text-sm font-medium text-gray-900">
          {formatMoney(getSalePrice(product))} RON
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (product) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
          product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {product.active ? 'Activ' : 'Inactiv'}
        </span>
      ),
    },
    {
      key: 'sourcing',
      label: 'Tip producție',
      render: (product) => {
        const outsource = Boolean(product.defaultPrintMethod?.isOutsourced ?? product.isOutsourced);
        return (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
            outsource ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {outsource ? 'Outsource' : 'Intern'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Acțiuni',
      render: (product) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              await toggleProductStatus(product.id, false);
              setProducts((prev) =>
                prev.map((item) => (item.id === product.id ? { ...item, active: false } : item))
              );
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loadingData) {
    return <LoadingState text="Se încarcă produsele..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produse</h1>
          <p className="text-gray-600 mt-1">Listă produse + configurare intern/outsource</p>
        </div>
        <AuthLink href="/admin/products/new">
          <Button variant="primary">
            <Plus className="h-5 w-5" />
            Adaugă Produs
          </Button>
        </AuthLink>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          placeholder="Caută după nume..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={printMethodFilter}
          onChange={(event) => setPrintMethodFilter(event.target.value)}
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toate metodele</option>
          {printMethodOptions.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>

        <select
          value={sourcingFilter}
          onChange={(event) => setSourcingFilter(event.target.value as 'all' | 'INTERNAL' | 'OUTSOURCE')}
          className="h-10 rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Intern + Outsource</option>
          <option value="INTERNAL">Doar Intern</option>
          <option value="OUTSOURCE">Doar Outsource</option>
        </select>

        <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(event) => setActiveOnly(event.target.checked)}
          />
          Doar active
        </label>
      </div>

      {filteredProducts.length === 0 ? (
        searchTerm ? (
          <EmptySearch query={searchTerm} />
        ) : (
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="Nu există produse"
            description="Adaugă primul produs pentru a începe"
          />
        )
      ) : (
        <Table
          columns={columns}
          data={filteredProducts}
          rowKey="id"
          clientSideSort
          emptyMessage="Nu există produse pentru filtrele selectate"
        />
      )}
    </div>
  );
}
