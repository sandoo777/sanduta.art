'use client';

import { useState, useCallback } from 'react';

export interface ProductionOperation {
  id: string;
  jobId: string;
  type: 'print' | 'cut' | 'laminate' | 'binding' | 'packaging' | 'delivery';
  status: 'pending' | 'in_progress' | 'paused' | 'completed' | 'delayed';
  machineId?: string;
  operatorId?: string;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeTracking {
  startTime?: Date;
  pauseTime?: Date;
  resumeTime?: Date;
  endTime?: Date;
  totalPausedTime: number; // milliseconds
  totalActiveTime: number; // milliseconds
}

export function useProductionOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOperations = useCallback(async (jobId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = jobId 
        ? `/api/production/operations?jobId=${jobId}`
        : '/api/production/operations';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch operations');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startOperation = useCallback(async (operationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/production/operations/${operationId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startedAt: new Date().toISOString(),
          status: 'in_progress',
        }),
      });
      if (!response.ok) throw new Error('Failed to start operation');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pauseOperation = useCallback(async (operationId: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/production/operations/${operationId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pausedAt: new Date().toISOString(),
          status: 'paused',
          notes: reason,
        }),
      });
      if (!response.ok) throw new Error('Failed to pause operation');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resumeOperation = useCallback(async (operationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/production/operations/${operationId}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumedAt: new Date().toISOString(),
          status: 'in_progress',
        }),
      });
      if (!response.ok) throw new Error('Failed to resume operation');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeOperation = useCallback(async (operationId: string, actualDuration?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/production/operations/${operationId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedAt: new Date().toISOString(),
          status: 'completed',
          actualDuration,
        }),
      });
      if (!response.ok) throw new Error('Failed to complete operation');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reassignOperator = useCallback(async (operationId: string, operatorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/production/operations/${operationId}/reassign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId }),
      });
      if (!response.ok) throw new Error('Failed to reassign operator');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reassignMachine = useCallback(async (operationId: string, machineId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/production/operations/${operationId}/reassign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId }),
      });
      if (!response.ok) throw new Error('Failed to reassign machine');
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateDelays = useCallback((operations: ProductionOperation[]) => {
    return operations.filter(op => {
      if (op.status === 'completed') return false;
      if (!op.startedAt) return false;
      
      const elapsed = Date.now() - new Date(op.startedAt).getTime();
      const expectedDuration = op.estimatedDuration * 60 * 1000; // convert to ms
      
      return elapsed > expectedDuration;
    });
  }, []);

  const updateTimeTracking = useCallback((operation: ProductionOperation): TimeTracking => {
    const tracking: TimeTracking = {
      totalPausedTime: 0,
      totalActiveTime: 0,
    };

    if (operation.startedAt) {
      tracking.startTime = new Date(operation.startedAt);
    }

    if (operation.pausedAt) {
      tracking.pauseTime = new Date(operation.pausedAt);
    }

    if (operation.completedAt) {
      tracking.endTime = new Date(operation.completedAt);
    }

    // Calculate total active time
    if (tracking.startTime) {
      const endPoint = tracking.endTime || new Date();
      tracking.totalActiveTime = endPoint.getTime() - tracking.startTime.getTime();
      
      // Subtract paused time if applicable
      if (tracking.pauseTime) {
        const pausedUntil = tracking.endTime || new Date();
        tracking.totalPausedTime = pausedUntil.getTime() - tracking.pauseTime.getTime();
        tracking.totalActiveTime -= tracking.totalPausedTime;
      }
    }

    return tracking;
  }, []);

  return {
    loading,
    error,
    fetchOperations,
    startOperation,
    pauseOperation,
    resumeOperation,
    completeOperation,
    reassignOperator,
    reassignMachine,
    calculateDelays,
    updateTimeTracking,
  };
}
