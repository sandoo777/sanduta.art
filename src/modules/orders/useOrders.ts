'use client';

import { useState, useCallback } from 'react';

interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  customDescription?: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

interface OrderFile {
  id: string;
  url: string;
  name: string;
  createdAt: string;
}

interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  source: 'ONLINE' | 'OFFLINE';
  channel: 'WEB' | 'PHONE' | 'WALK_IN' | 'EMAIL';
  status: string;
  paymentStatus: string;
  totalPrice: number;
  currency: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  files: OrderFile[];
  _count?: {
    orderItems: number;
    files: number;
  };
}

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
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
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
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePaymentStatus = useCallback(async (id: string, paymentStatus: string) => {
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
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (orderId: string, item: any) => {
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
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (orderId: string, itemId: string, updates: any) => {
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
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
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
