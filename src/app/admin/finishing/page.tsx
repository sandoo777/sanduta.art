'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptySearch, EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingState } from '@/components/ui/LoadingState';
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
    } catch (error) {
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
    return <LoadingState text="Se încarcă operațiunile de finisare..." />;
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
        <Card padding="sm">
          <CardContent>
            <div className="text-sm text-gray-600">Total Operațiuni</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Inactive</div>
          <div className="text-2xl font-bold text-gray-400 mt-1">{stats.inactive}</div>
        </div>
        <Card padding="sm">
          <CardContent>
            <div className="text-sm text-gray-600">Tipuri</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{stats.types}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caută după nume..."
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:w-48">
          <Select
            options={[
              { value: "all", label: "Toate tipurile" },
              ...FINISHING_OPERATION_TYPES
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            fullWidth={true}
          />
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
        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Adaugă Operațiune</span>
        </Button>
      </div>

      {/* Operations Grid */}
      {filteredOperations.length === 0 ? (
        searchTerm ? (
          <EmptySearch query={searchTerm} />
        ) : (
          <EmptyState
            icon={<Filter className="h-12 w-12" />}
            title="Nu există operațiuni de finisare"
            description="Adaugă prima operațiune pentru a începe"
            action={{
              label: "Adaugă operațiune",
              onClick: () => setShowForm(true)
            }}
          />
        )
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
