'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { Plus, Search, Filter } from 'lucide-react';
import { MachineCard } from './_components/MachineCard';
import { MachineForm } from './_components/MachineForm';
import { useMachines, searchMachines, filterMachines } from '@/modules/machines/useMachines';
import type { Machine } from '@/modules/machines/types';
import { MACHINE_TYPES, MACHINE_STATUS_CONFIG } from '@/modules/machines/types';

export default function MachinesPage() {
  const {
    getMachines,
    createMachine,
    updateMachine,
    deleteMachine,
  } = useMachines();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | undefined>();
  const [loadingData, setLoadingData] = useState(true);

  const getMachinesRef = useRef(getMachines);
  getMachinesRef.current = getMachines;

  useEffect(() => {
    let cancelled = false;
    setLoadingData(true);
    getMachinesRef.current()
      .then((data) => { if (!cancelled) setMachines(data); })
      .catch((err) => console.error('Error loading machines:', err))
      .finally(() => { if (!cancelled) setLoadingData(false); });
    return () => { cancelled = true; };
  }, []); // empty deps — runs exactly once on mount

  const loadMachines = () => {
    setLoadingData(true);
    getMachinesRef.current()
      .then((data) => setMachines(data))
      .catch((err) => console.error('Error loading machines:', err))
      .finally(() => setLoadingData(false));
  };

  const filteredMachines = useMemo(() => {
    let result = searchMachines(machines, searchTerm);
    result = filterMachines(result, { type: typeFilter, status: statusFilter, activeOnly });
    return result;
  }, [machines, searchTerm, typeFilter, statusFilter, activeOnly]);

  const stats = useMemo(() => {
    const available = machines.filter((m) => m.status === 'AVAILABLE').length;
    const busy = machines.filter((m) => m.status === 'BUSY').length;
    const maintenance = machines.filter((m) => m.status === 'MAINTENANCE').length;
    const types = new Set(machines.map((m) => m.type)).size;
    return { total: machines.length, available, busy, maintenance, types };
  }, [machines]);

  const handleCreate = async (data: Parameters<typeof createMachine>[0]) => {
    await createMachine(data);
    await loadMachines();
  };

  const handleUpdate = async (data: Parameters<typeof updateMachine>[1]) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Echipamente</h1>
          <p className="text-gray-600 mt-1">Gestionează echipamentele utilizate în producție</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Adaugă Echipament</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card padding="sm">
          <CardContent>
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-xs text-green-700">Libere</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{stats.available}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="text-xs text-yellow-700">Ocupate</div>
          <div className="text-2xl font-bold text-yellow-700 mt-1">{stats.busy}</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="text-xs text-red-700">Mentenanță</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{stats.maintenance}</div>
        </div>
        <Card padding="sm">
          <CardContent>
            <div className="text-xs text-gray-500">Tipuri</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{stats.types}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caută după nume..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="all">Toate statusurile</option>
          {(Object.entries(MACHINE_STATUS_CONFIG) as [string, { label: string }][]).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="all">Toate tipurile</option>
          {MACHINE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        {/* Active Only */}
        <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="font-medium text-gray-700">Doar active</span>
        </label>
      </div>

      {/* Machines Grid */}
      {filteredMachines.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Filter className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || activeOnly
              ? 'Nu s-au găsit echipamente cu filtrele aplicate'
              : 'Nu există echipamente. Adaugă primul echipament.'}
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
