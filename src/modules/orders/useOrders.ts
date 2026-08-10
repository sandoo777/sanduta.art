'use client';

import { useState, useCallback } from 'react';
import type { OrderStatus, PaymentStatus } from '@prisma/client';

export function useOrders() {
  const [loading, setLoading] = useState(false);

  const getOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrder = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePaymentStatus = useCallback(async (id: string, paymentStatus: PaymentStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (!response.ok) throw new Error('Failed to update payment status');
      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const assignOperator = useCallback(async (id: string, assignedToUserId: string | null) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToUserId }),
      });
      if (!response.ok) throw new Error('Failed to assign operator');
      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (orderId: string, item: unknown) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (orderId: string, itemId: string, updates: unknown) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update item');
      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (orderId: string, itemId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const addFile = useCallback(async (orderId: string, file: { url: string; name: string }) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(file),
      });
      if (!response.ok) throw new Error('Failed to add file');
      const data = await response.json();
      return { success: true, data };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (orderId: string, fileId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete file');
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getOrders,
    getOrder,
    updateStatus,
    updatePaymentStatus,
    assignOperator,
    addItem,
    updateItem,
    deleteItem,
    addFile,
    deleteFile,
  };
}
