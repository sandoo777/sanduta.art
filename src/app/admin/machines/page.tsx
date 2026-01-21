'use client';

import { useState, useEffect, useMemo } from 'react';
import { LoadingState } from '@/components/ui';
import { Plus, Search, Filter } from 'lucide-react';
import { MachineCard } from './_components/MachineCard';
import { MachineForm } from './_components/MachineForm';
import { useMachines } from '@/modules/machines/useMachines';
import type { Machine } from '@/modules/machines/types';
import { MACHINE_TYPES } from '@/modules/machines/types';

export default function MachinesPage() {
  const {
    loading,
    getMachines,
    createMachine,
    updateMachine,
    deleteMachine,
    searchMachines,
    filterMachines,
  } = useMachines();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | undefined>();
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      setLoadingData(true);
      const data = await getMachines();
      setMachines(data);
    } catch (_error) {
      console.error('Error loading machines:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredMachines = useMemo(() => {
    let result = searchMachines(machines, searchTerm);
    result = filterMachines(result, { type: typeFilter, activeOnly });
    return result;
  }, [machines, searchTerm, typeFilter, activeOnly]);

  const stats = useMemo(() => {
    const active = machines.filter((m) => m.active).length;
    const inactive = machines.length - active;
    const types = new Set(machines.map((m) => m.type)).size;

    return {
      total: machines.length,
      active,
      inactive,
      types,
    };
  }, [machines]);

  const handleCreate = async (data: any) => {
    await createMachine(data);
    await loadMachines();
  };

  const handleUpdate = async (data: any) => {
    if (editingMachine) {
      await updateMachine(editingMachine.id, data);
      await loadMachines();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMachine(id);
    await loadMachines();
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMachine(undefined);
  };

  if (loadingData) {
    return <LoadingState text="Se încarcă echipamentele..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Machines & Equipment</h1>
        <p className="text-gray-600 mt-2">
          Gestionează echipamentele utilizate în producție
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Echipamente</div>
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
            {MACHINE_TYPES.map((type) => (
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
          <span className="hidden sm:inline">Adaugă Echipament</span>
        </button>
      </div>

      {/* Machines Grid */}
      {filteredMachines.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-2">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600">
            {searchTerm || typeFilter !== 'all' || activeOnly
              ? 'Nu s-au găsit echipamente cu filtrele aplicate'
              : 'Nu există echipamente'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMachines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <MachineForm
          machine={editingMachine}
          onSubmit={editingMachine ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
