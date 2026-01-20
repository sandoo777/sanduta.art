// Orders Hook - React Hook pentru UI
// Interfață între componente UI și serviciul de comenzi

'use client';

import { useState, useCallback } from 'react';
import { ordersService } from '../services/OrdersService';
import {
  OrdersQueryParams,
  OrdersListResponse,
  OrderWithRelations,
  CreateOrderDTO,
  UpdateOrderItemDTO,
  OrderServiceResult,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useOrders() {
  const [loading, setLoading] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // QUERIES
  // ───────────────────────────────────────────────────────────────────────────

  const getOrders = useCallback(
    async (params?: OrdersQueryParams): Promise<OrderServiceResult<OrdersListResponse>> => {
      setLoading(true);
      try {
        return await ordersService.getOrders(params);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getOrder = useCallback(
    async (id: string): Promise<OrderServiceResult<OrderWithRelations>> => {
      setLoading(true);
      try {
        return await ordersService.getOrderById(id);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ───────────────────────────────────────────────────────────────────────────
  // MUTATIONS
  // ───────────────────────────────────────────────────────────────────────────

  const updateStatus = useCallback(
    async (id: string, status: string): Promise<OrderServiceResult> => {
      setLoading(true);
      try {
        // Note: userId should be obtained from session/context
        // For now we pass empty string, to be replaced with actual userId
        return await ordersService.updateOrderStatus(id, status, '');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updatePaymentStatus = useCallback(
    async (id: string, paymentStatus: string): Promise<OrderServiceResult> => {
      setLoading(true);
      try {
        return await ordersService.updatePaymentStatus(id, paymentStatus, '');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const assignOperator = useCallback(
    async (id: string, assignedToUserId: string | null): Promise<OrderServiceResult> => {
      setLoading(true);
      try {
        return await ordersService.assignOperator(id, assignedToUserId, '');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ───────────────────────────────────────────────────────────────────────────
  // ITEMS
  // ───────────────────────────────────────────────────────────────────────────

  const addItem = useCallback(
    async (orderId: string, item: any): Promise<OrderServiceResult> => {
      setLoading(true);
      try {
        return await ordersService.addItem(orderId, item, '');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateItem = useCallback(
    async (
      orderId: string,
      itemId: string,
      updates: UpdateOrderItemDTO
    ): Promise<OrderServiceResult> => {
      setLoading(true);
      try {
        return await ordersService.updateItem(orderId, itemId, updates, '');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteItem = useCallback(
    async (orderId: string, itemId: string): Promise<OrderServiceResult> => {
      setLoading(true);
      try {
        return await ordersService.deleteItem(orderId, itemId, '');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ───────────────────────────────────────────────────────────────────────────
  // FILES (TO BE IMPLEMENTED)
  // ───────────────────────────────────────────────────────────────────────────

  const addFile = useCallback(
    async (orderId: string, file: { url: string; name: string }): Promise<OrderServiceResult> => {
      setLoading(true);
      try {
        // TODO: Implement file service
        const response = await fetch(`/api/admin/orders/${orderId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(file),
        });
        if (!response.ok) throw new Error('Failed to add file');
        const data = await response.json();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteFile = useCallback(
    async (orderId: string, fileId: string): Promise<OrderServiceResult> => {
      setLoading(true);
      try {
        // TODO: Implement file service
        const response = await fetch(`/api/admin/orders/${orderId}/files/${fileId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete file');
        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ───────────────────────────────────────────────────────────────────────────
  // RETURN
  // ───────────────────────────────────────────────────────────────────────────

  return {
    loading,
    // Queries
    getOrders,
    getOrder,
    // Mutations
    updateStatus,
    updatePaymentStatus,
    assignOperator,
    // Items
    addItem,
    updateItem,
    deleteItem,
    // Files
    addFile,
    deleteFile,
  };
}
