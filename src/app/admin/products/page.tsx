'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { LoadingState, EmptyState, EmptySearch, Button, Card, CardContent } from '@/components/ui';
import { Plus, Package } from 'lucide-react';
import { ProductCard } from '@/components/admin/products/ProductCard';
import { ProductSearch } from '@/components/admin/products/ProductSearch';
import { CategoryFilter } from '@/components/admin/products/CategoryFilter';
import { ProductTypeFilter } from '@/components/admin/products/ProductTypeFilter';
import { StatusFilter } from '@/components/admin/products/StatusFilter';
import { useProducts } from '@/modules/products/useProducts';
import type { Product, ProductType } from '@/modules/products/types';

export default function ProductsPage() {
  const {
    loading,
    getProducts,
    duplicateProduct,
    toggleProductStatus,
    filterProducts,
  } = useProducts();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all');
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingData(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return filterProducts(products, {
      search: searchTerm,
      categoryId: categoryFilter,
      type: typeFilter,
      activeOnly,
    });
  }, [products, searchTerm, categoryFilter, typeFilter, activeOnly]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.active).length;
    const inactive = products.length - active;
    const standard = products.filter((p) => p.type === 'STANDARD').length;
    const configurable = products.filter((p) => p.type === 'CONFIGURABLE').length;
    const custom = products.filter((p) => p.type === 'CUSTOM').length;

    return {
      total: products.length,
      active,
      inactive,
      standard,
      configurable,
      custom,
    };
  }, [products]);

  const handleEdit = (product: Product) => {
    // Navigate to edit page
    window.location.href = `/admin/products/${product.id}/edit`;
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProduct(id);
      await loadProducts();
    } catch (error) {
      console.error('Error duplicating product:', error);
    }
  };

  const handleToggleStatus = async (id: string, active: boolean) => {
    try {
      await toggleProductStatus(id, active);
      await loadProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  if (loadingData) {
    return <LoadingState text="Se încarcă produsele..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-2">
          Gestionează produsele disponibile în platformă
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card padding="sm">
          <CardContent>
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </div>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <div className="text-sm text-gray-600">Inactive</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <div className="text-sm text-gray-600">Standard</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.standard}
            </div>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <div className="text-sm text-gray-600">Configurabil</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {stats.configurable}
            </div>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent>
            <div className="text-sm text-gray-600">Custom</div>
            <div className="text-2xl font-bold text-gray-600 mt-1">
              {stats.custom}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-gray-50 -mx-6 px-6 py-4 border-y border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <ProductSearch onSearch={setSearchTerm} />

          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
          </div>

          {/* Type Filter */}
          <div className="w-full lg:w-48">
            <ProductTypeFilter value={typeFilter} onChange={setTypeFilter} />
          </div>

          {/* Status Filter */}
          <StatusFilter checked={activeOnly} onChange={setActiveOnly} />

          {/* Add Button */}
          <Link href="/admin/products/new">
            <Button variant="primary">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        searchTerm ? (
          <EmptySearch query={searchTerm} />
        ) : (
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="Nu există produse"
            description="Adaugă primul produs pentru a începe"
            action={{
              label: "Adaugă primul produs",
              onClick: () => window.location.href = '/admin/products/new'
            }}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
