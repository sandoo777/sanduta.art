'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Machine, CreateMachineInput, UpdateMachineInput } from './types';

export function useMachines() {
  const [loading, setLoading] = useState(false);

  const getMachines = async (): Promise<Machine[]> => {
    try {
      const response = await fetch('/api/admin/machines', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch machines');
      return await response.json();
    } catch (error) {
      toast.error('Eroare la încărcarea echipamentelor');
      throw error;
    }
  };

  const createMachine = async (data: CreateMachineInput): Promise<Machine> => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create machine');
      }

      const machine = await response.json();
      toast.success('Echipament creat cu succes!');
      return machine;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Eroare la creare');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMachine = async (
    id: string,
    data: UpdateMachineInput
  ): Promise<Machine> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/machines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update machine');
      }

      const machine = await response.json();
      toast.success('Echipament actualizat cu succes!');
      return machine;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Eroare la actualizare');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMachine = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/machines/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete machine');
      }

      toast.success('Echipament șters cu succes!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Eroare la ștergere');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchMachines = (
    machines: Machine[],
    searchTerm: string
  ): Machine[] => {
    if (!searchTerm.trim()) return machines;

    const term = searchTerm.toLowerCase();
    return machines.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.type.toLowerCase().includes(term) ||
        m.description?.toLowerCase().includes(term)
    );
  };

  const filterMachines = (
    machines: Machine[],
    filters: {
      type?: string;
      activeOnly?: boolean;
    }
  ): Machine[] => {
    let filtered = [...machines];

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((m) => m.type === filters.type);
    }

    if (filters.activeOnly) {
      filtered = filtered.filter((m) => m.active);
    }

    return filtered;
  };

  return {
    loading,
    getMachines,
    createMachine,
    updateMachine,
    deleteMachine,
    searchMachines,
    filterMachines,
  };
}
