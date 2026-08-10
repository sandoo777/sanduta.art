'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { FinishingOperation, CreateFinishingOperationInput, UpdateFinishingOperationInput } from './types';

// Pure utility functions — defined outside hook so they never change reference
export function searchFinishingOperations(
  operations: FinishingOperation[],
  searchTerm: string
): FinishingOperation[] {
  if (!searchTerm.trim()) return operations;
  const term = searchTerm.toLowerCase();
  return operations.filter(
    (op) =>
      op.name.toLowerCase().includes(term) ||
      op.type.toLowerCase().includes(term) ||
      op.description?.toLowerCase().includes(term)
  );
}

export function filterFinishingOperations(
  operations: FinishingOperation[],
  filters: { type?: string; activeOnly?: boolean }
): FinishingOperation[] {
  let filtered = [...operations];
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter((op) => op.type === filters.type);
  }
  if (filters.activeOnly) {
    filtered = filtered.filter((op) => op.active);
  }
  return filtered;
}

export function useFinishing() {
  const [loading, setLoading] = useState(false);

  const getFinishingOperations = useCallback(async (): Promise<FinishingOperation[]> => {
    try {
      const response = await fetch('/api/admin/finishing', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch finishing operations');
      return await response.json();
    } catch (error) {
      toast.error('Eroare la încărcarea operațiunilor de finisare');
      throw error;
    }
  }, []);

  const createFinishingOperation = useCallback(async (data: CreateFinishingOperationInput): Promise<FinishingOperation> => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/finishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create finishing operation');
      }
      const operation = await response.json();
      toast.success('Operațiune de finisare creată cu succes!');
      return operation;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Eroare la crearea operațiunii');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFinishingOperation = useCallback(async (
    id: string,
    data: UpdateFinishingOperationInput
  ): Promise<FinishingOperation> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/finishing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update finishing operation');
      }
      const operation = await response.json();
      toast.success('Operațiune actualizată cu succes!');
      return operation;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Eroare la actualizare');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFinishingOperation = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/finishing/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete finishing operation');
      }
      toast.success('Operațiune ștearsă cu succes!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Eroare la ștergere');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getFinishingOperations,
    createFinishingOperation,
    updateFinishingOperation,
    deleteFinishingOperation,
    searchFinishingOperations,
    filterFinishingOperations,
  };
}
