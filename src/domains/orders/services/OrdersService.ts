// Orders Service - Business Logic Layer
// Orchestrează operațiunile de business pentru comenzi

import { ordersRepository } from '../repositories/OrdersRepository';
import {
  OrdersQueryParams,
  OrdersListResponse,
  CreateOrderDTO,
  UpdateOrderDTO,
  CreateOrderItemDTO,
  UpdateOrderItemDTO,
  OrderServiceResult,
  OrderWithRelations,
} from '../types';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class OrdersService {
  /**
   * Obține lista de comenzi cu paginare și filtre
   */
  async getOrders(
    params: OrdersQueryParams = {}
  ): Promise<OrderServiceResult<OrdersListResponse>> {
    try {
      logger.info('OrdersService', 'Fetching orders', { params });

      const { orders, total } = await ordersRepository.findMany(params);
      const page = params.page || 1;
      const limit = params.limit || 20;

      return {
        success: true,
        data: {
          orders,
          total,
          page,
          limit,
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to fetch orders', { error, params });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      };
    }
  }

  /**
   * Obține o comandă specifică după ID
   */
  async getOrderById(
    id: string
  ): Promise<OrderServiceResult<OrderWithRelations>> {
    try {
      logger.info('OrdersService', 'Fetching order by ID', { orderId: id });

      const order = await ordersRepository.findById(id);

      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to fetch order', { error, orderId: id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch order',
      };
    }
  }

  /**
   * Creează o comandă nouă
   */
  async createOrder(
    data: CreateOrderDTO,
    createdByUserId: string
  ): Promise<OrderServiceResult> {
    try {
      logger.info('OrdersService', 'Creating new order', {
        customerId: data.customerId,
        itemsCount: data.items.length,
      });

      // Validare business rules
      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          error: 'Order must have at least one item',
        };
      }

      const order = await ordersRepository.create(data, createdByUserId);

      logger.info('OrdersService', 'Order created successfully', {
        orderId: order.id,
      });

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to create order', { error, data });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      };
    }
  }

  /**
   * Actualizează statusul comenzii
   */
  async updateOrderStatus(
    id: string,
    status: string,
    updatedByUserId: string
  ): Promise<OrderServiceResult> {
    try {
      logger.info('OrdersService', 'Updating order status', {
        orderId: id,
        status,
      });

      // Validare status transitions (business rules)
      const currentOrder = await ordersRepository.findById(id);
      if (!currentOrder) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // TODO: Add status transition validation logic

      const order = await ordersRepository.update(
        id,
        { status: status as any },
        updatedByUserId
      );

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to update order status', {
        error,
        orderId: id,
        status,
      });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update order status',
      };
    }
  }

  /**
   * Actualizează statusul plății
   */
  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    updatedByUserId: string
  ): Promise<OrderServiceResult> {
    try {
      logger.info('OrdersService', 'Updating payment status', {
        orderId: id,
        paymentStatus,
      });

      const order = await ordersRepository.update(
        id,
        { paymentStatus },
        updatedByUserId
      );

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to update payment status', {
        error,
        orderId: id,
        paymentStatus,
      });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update payment status',
      };
    }
  }

  /**
   * Atribuie un operator comenzii
   */
  async assignOperator(
    id: string,
    assignedToUserId: string | null,
    assignedByUserId: string
  ): Promise<OrderServiceResult> {
    try {
      logger.info('OrdersService', 'Assigning operator', {
        orderId: id,
        assignedToUserId,
      });

      const order = await ordersRepository.update(
        id,
        { assignedToUserId },
        assignedByUserId
      );

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to assign operator', {
        error,
        orderId: id,
        assignedToUserId,
      });
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to assign operator',
      };
    }
  }

  /**
   * Adaugă un item la comandă
   */
  async addItem(
    orderId: string,
    item: CreateOrderItemDTO,
    createdByUserId: string
  ): Promise<OrderServiceResult> {
    try {
      logger.info('OrdersService', 'Adding item to order', {
        orderId,
        productId: item.productId,
      });

      const orderItem = await ordersRepository.addItem(
        orderId,
        item,
        createdByUserId
      );

      return {
        success: true,
        data: orderItem,
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to add item', {
        error,
        orderId,
        item,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item',
      };
    }
  }

  /**
   * Actualizează un item din comandă
   */
  async updateItem(
    orderId: string,
    itemId: string,
    updates: UpdateOrderItemDTO,
    updatedByUserId: string
  ): Promise<OrderServiceResult> {
    try {
      logger.info('OrdersService', 'Updating order item', {
        orderId,
        itemId,
      });

      const orderItem = await ordersRepository.updateItem(
        orderId,
        itemId,
        updates,
        updatedByUserId
      );

      return {
        success: true,
        data: orderItem,
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to update item', {
        error,
        orderId,
        itemId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update item',
      };
    }
  }

  /**
   * Șterge un item din comandă
   */
  async deleteItem(
    orderId: string,
    itemId: string,
    deletedByUserId: string
  ): Promise<OrderServiceResult> {
    try {
      logger.info('OrdersService', 'Deleting order item', {
        orderId,
        itemId,
      });

      await ordersRepository.deleteItem(orderId, itemId, deletedByUserId);

      return {
        success: true,
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to delete item', {
        error,
        orderId,
        itemId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete item',
      };
    }
  }

  /**
   * Șterge o comandă
   */
  async deleteOrder(id: string): Promise<OrderServiceResult> {
    try {
      logger.info('OrdersService', 'Deleting order', { orderId: id });

      // Business rule: Check if order can be deleted
      const order = await ordersRepository.findById(id);
      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // Don't delete delivered orders
      if (order.status === 'DELIVERED') {
        return {
          success: false,
          error: 'Cannot delete delivered orders',
        };
      }

      await ordersRepository.delete(id);

      return {
        success: true,
      };
    } catch (error) {
      logger.error('OrdersService', 'Failed to delete order', {
        error,
        orderId: id,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete order',
      };
    }
  }
}

// Export singleton instance
export const ordersService = new OrdersService();
