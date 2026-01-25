"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Card, CardContent } from '@/components/ui/Card';
import { usePrintMethods } from "@/modules/print-methods/usePrintMethods";
import type { PrintMethod, PrintMethodFilters, CreatePrintMethodInput } from "@/modules/print-methods/types";
import { PRINT_METHOD_TYPES } from "@/modules/print-methods/types";
import { PrintMethodCard } from "./_components/PrintMethodCard";
import { PrintMethodForm } from "./_components/PrintMethodForm";

export default function PrintMethodsPage() {
  const [printMethods, setPrintMethods] = useState<PrintMethod[]>([]);
  const [filters, setFilters] = useState<PrintMethodFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PrintMethod | null>(null);
  const { getPrintMethods, createPrintMethod, updatePrintMethod, deletePrintMethod, isLoading } = usePrintMethods();

  useEffect(() => {
    loadPrintMethods();
  }, []);

  const loadPrintMethods = async () => {
    const data = await getPrintMethods();
    setPrintMethods(data);
  };

  // Filter print methods
  const filteredMethods = useMemo(() => {
    return printMethods.filter((method) => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesName = method.name.toLowerCase().includes(search);
        const matchesType = method.type.toLowerCase().includes(search);
        if (!matchesName && !matchesType) return false;
      }

      // Type filter
      if (filters.type && method.type !== filters.type) {
        return false;
      }

      // Active filter
      if (filters.active !== undefined && method.active !== filters.active) {
        return false;
      }

      return true;
    });
  }, [printMethods, filters]);

  // Get unique types for filter
  const types = useMemo(() => {
    return PRINT_METHOD_TYPES;
  }, []);

  const handleSave = async (data: CreatePrintMethodInput) => {
    if (editingMethod) {
      await updatePrintMethod(editingMethod.id, data);
    } else {
      await createPrintMethod(data);
    }
    loadPrintMethods();
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  const handleEdit = (method: PrintMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deletePrintMethod(id);
    if (success) {
      loadPrintMethods();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Print Methods</h1>
            <p className="text-gray-600 mt-1">
              Gestionează metodele de tipărire disponibile în producție
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Add Print Method</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card padding="sm">
            <CardContent>
              <div className="text-sm text-gray-600">Total Metode</div>
              <div className="text-2xl font-bold text-gray-900">{printMethods.length}</div>
            </CardContent>
          </Card>
          <Card padding="sm">
            <CardContent>
              <div className="text-sm text-gray-600">Active</div>
              <div className="text-2xl font-bold text-green-600">
                {printMethods.filter((m) => m.active).length}
              </div>
            </CardContent>
          </Card>
          <Card padding="sm">
            <CardContent>
              <div className="text-sm text-gray-600">Inactive</div>
              <div className="text-2xl font-bold text-gray-400">
                {printMethods.filter((m) => !m.active).length}
              </div>
            </CardContent>
          </Card>
          <Card padding="sm">
            <CardContent>
              <div className="text-sm text-gray-600">Tipuri</div>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(printMethods.map((m) => m.type)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Caută după nume..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="md:w-48">
            <select
              value={filters.type || ""}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value || undefined })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toate tipurile</option>
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filter */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activeOnly"
              checked={filters.active === true}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  active: e.target.checked ? true : undefined,
                })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="activeOnly" className="text-sm text-gray-700 whitespace-nowrap">
              Doar active
            </label>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="text-gray-600">Se încarcă...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMethods.length === 0 && (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">🖨️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filters.search || filters.type
              ? "Nicio metodă găsită"
              : "Nicio metodă de tipărire"}
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.type
              ? "Încearcă să modifici filtrele de căutare"
              : "Adaugă prima metodă de tipărire pentru a începe"}
          </p>
          {!filters.search && !filters.type && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Adaugă metodă
            </button>
          )}
        </div>
      )}

      {/* Print Methods Grid */}
      {!isLoading && filteredMethods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => (
            <PrintMethodCard
              key={method.id}
              printMethod={method}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <PrintMethodForm
          printMethod={editingMethod}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
