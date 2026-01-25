"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, AlertCircle } from "lucide-react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { Material, MaterialFilters } from "@/modules/materials/types";
import { MaterialCard } from "./_components/MaterialCard";
import { MaterialModal } from "./_components/MaterialModal";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filters, setFilters] = useState<MaterialFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getMaterials, isLoading } = useMaterials();

  useEffect(() => {
    getMaterials().then(setMaterials);
  }, [getMaterials]);

  const loadMaterials = async () => {
    const data = await getMaterials();
    setMaterials(data);
  };

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesName = material.name.toLowerCase().includes(search);
        const matchesSku = material.sku?.toLowerCase().includes(search);
        if (!matchesName && !matchesSku) return false;
      }

      // Low stock filter
      if (filters.lowStock && !material.lowStock) {
        return false;
      }

      // Unit filter
      if (filters.unit && material.unit !== filters.unit) {
        return false;
      }

      return true;
    });
  }, [materials, filters]);

  // Get unique units for filter
  const units = useMemo(() => {
    const uniqueUnits = new Set(materials.map((m) => m.unit));
    return Array.from(uniqueUnits).sort();
  }, [materials]);

  // Count low stock materials
  const lowStockCount = materials.filter((m) => m.lowStock).length;

  const handleModalClose = () => {
    setIsModalOpen(false);
    loadMaterials();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Materials & Inventory</h1>
            <p className="text-gray-600 mt-1">
              Gestionează stocurile de materiale pentru producție
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Add Material</span>
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">
                {lowStockCount} {lowStockCount === 1 ? "material are" : "materiale au"} stoc
                scăzut
              </p>
              <button
                onClick={() => setFilters({ ...filters, lowStock: true })}
                className="text-red-600 text-sm hover:underline"
              >
                Vezi materialele cu stoc scăzut
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Caută după nume sau SKU..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Unit Filter */}
            <select
              value={filters.unit || ""}
              onChange={(e) => setFilters({ ...filters, unit: e.target.value || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toate unitățile</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>

            {/* Low Stock Filter */}
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={filters.lowStock || false}
                onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">Doar stoc scăzut</span>
          </label>
        </div>

        {/* Active Filters */}
        {(filters.search || filters.unit || filters.lowStock) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filtre active:</span>
            {filters.search && (
              <Badge variant="primary" size="sm">
                {filters.search}
                <button
                  onClick={() => setFilters({ ...filters, search: undefined })}
                  className="hover:text-blue-900 ml-1"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.unit && (
              <Badge variant="primary" size="sm">
                {filters.unit}
                <button
                  onClick={() => setFilters({ ...filters, unit: undefined })}
                  className="hover:text-blue-900 ml-1"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.lowStock && (
              <Badge variant="danger" size="sm">
                Stoc scăzut
                <button
                  onClick={() => setFilters({ ...filters, lowStock: false })}
                  className="hover:text-red-900 ml-1"
                >
                  ×
                </button>
              </Badge>
            )}
            <button
              onClick={() => setFilters({})}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Resetează filtre
            </button>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Materials Grid - Desktop Table */}
      <div className="hidden md:block">
        <Table
          columns={[
            {
              key: 'name',
              label: 'Material',
              sortable: true,
              render: (material) => (
                <div className="font-medium text-gray-900">{material.name}</div>
              ),
            },
            {
              key: 'sku',
              label: 'SKU',
              render: (material) => (
                <span className="text-gray-600">{material.sku || "—"}</span>
              ),
            },
            {
              key: 'stock',
              label: 'Stoc',
              sortable: true,
              render: (material) => (
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      material.stock === 0
                        ? "text-black"
                        : material.lowStock
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {material.stock}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">{material.minStock}</span>
                </div>
              ),
            },
            {
              key: 'unit',
              label: 'Unitate',
              render: (material) => (
                <span className="text-gray-600">{material.unit}</span>
              ),
            },
            {
              key: 'costPerUnit',
              label: 'Cost/Unitate',
              sortable: true,
              render: (material) => (
                <span className="text-gray-900">
                  {Number(material.costPerUnit).toFixed(2)} MDL
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (material) => {
                if (material.stock === 0) {
                  return (
                    <Badge variant="default" size="sm" className="bg-black text-white">
                      Stoc epuizat
                    </Badge>
                  );
                }
                if (material.lowStock) {
                  return (
                    <Badge variant="danger" size="sm">
                      Stoc scăzut
                    </Badge>
                  );
                }
                return (
                  <Badge variant="success" size="sm">
                    OK
                  </Badge>
                );
              },
            },
            {
              key: 'actions',
              label: 'Acțiuni',
              render: (material) => (
                <AuthLink
                  href={`/admin/materials/${material.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Vezi detalii
                </AuthLink>
              ),
            },
          ]}
          data={filteredMaterials}
          rowKey="id"
          loading={isLoading}
          emptyMessage={
            filters.search || filters.unit || filters.lowStock
              ? "Nu s-au găsit materiale cu filtrele selectate"
              : "Nu există materiale. Creează primul material."
          }
          clientSideSort={true}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        />
      </div>

      {/* Materials Grid - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            Se încarcă...
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            {filters.search || filters.unit || filters.lowStock
              ? "Nu s-au găsit materiale"
              : "Nu există materiale"}
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <MaterialModal onClose={handleModalClose} onSuccess={handleModalClose} />
      )}
    </div>
  );
}
