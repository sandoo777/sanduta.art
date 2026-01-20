'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { FinishingCard } from './_components/FinishingCard';
import { FinishingForm } from './_components/FinishingForm';
import { useFinishing } from '@/modules/finishing/useFinishing';
import type { FinishingOperation } from '@/modules/finishing/types';
import { FINISHING_OPERATION_TYPES } from '@/modules/finishing/types';

export default function FinishingPage() {
  const {
    loading,
    getFinishingOperations,
    createFinishingOperation,
    updateFinishingOperation,
    deleteFinishingOperation,
    searchFinishingOperations,
    filterFinishingOperations,
  } = useFinishing();

  const [operations, setOperations] = useState<FinishingOperation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOperation, setEditingOperation] = useState<FinishingOperation | undefined>();
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    try {
      setLoadingData(true);
      const data = await getFinishingOperations();
      setOperations(data);
    } catch (_error) {
      console.error('Error loading operations:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredOperations = useMemo(() => {
    let result = searchFinishingOperations(operations, searchTerm);
    result = filterFinishingOperations(result, { type: typeFilter, activeOnly });
    return result;
  }, [operations, searchTerm, typeFilter, activeOnly]);

  const stats = useMemo(() => {
    const active = operations.filter((op) => op.active).length;
    const inactive = operations.length - active;
    const types = new Set(operations.map((op) => op.type)).size;

    return {
      total: operations.length,
      active,
      inactive,
      types,
    };
  }, [operations]);

  const handleCreate = async (data: Partial<FinishingOperation>) => {
    await createFinishingOperation(data);
    await loadOperations();
  };

  const handleUpdate = async (data: Partial<FinishingOperation>) => {
    if (editingOperation) {
      await updateFinishingOperation(editingOperation.id, data);
      await loadOperations();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteFinishingOperation(id);
    await loadOperations();
  };

  const handleEdit = (operation: FinishingOperation) => {
    setEditingOperation(operation);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOperation(undefined);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Se încarcă operațiunile de finisare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Finishing Operations</h1>
        <p className="text-gray-600 mt-2">
          Gestionează operațiunile de finisare disponibile în producție
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Operațiuni</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Inactive</div>
          <div className="text-2xl font-bold text-gray-400 mt-1">{stats.inactive}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tipuri</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.types}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caută după nume..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:w-48">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toate tipurile</option>
            {FINISHING_OPERATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Only */}
        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Doar active</span>
        </label>

        {/* Add Button */}
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Adaugă Operațiune</span>
        </button>
      </div>

      {/* Operations Grid */}
      {filteredOperations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-2">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600">
            {searchTerm || typeFilter !== 'all' || activeOnly
              ? 'Nu s-au găsit operațiuni cu filtrele aplicate'
              : 'Nu există operațiuni de finisare'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOperations.map((operation) => (
            <FinishingCard
              key={operation.id}
              operation={operation}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <FinishingForm
          operation={editingOperation}
          onSubmit={editingOperation ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
