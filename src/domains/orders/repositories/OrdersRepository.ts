// Orders Repository - Data Access Layer
// Gestiunea accesului la baza de date pentru comenzi

import { prisma } from '@/lib/prisma';
import {
  Order,
  OrderWithRelations,
  OrdersQueryParams,
  CreateOrderDTO,
  UpdateOrderDTO,
  CreateOrderItemDTO,
  UpdateOrderItemDTO,
  OrderFileDTO,
} from '../types';
import { Prisma } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS CRUD
// ═══════════════════════════════════════════════════════════════════════════

export class OrdersRepository {
  /**
   * Găsește comenzi cu filtre și paginare
   */
  async findMany(params: OrdersQueryParams = {}): Promise<{
    orders: OrderWithRelations[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      customerId,
      assignedToUserId,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};
    
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (customerId) where.customerId = customerId;
    if (assignedToUserId) where.assignedToUserId = assignedToUserId;
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true,
                },
              },
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              items: true,
              timeline: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  /**
   * Găsește o comandă după ID cu toate relațiile
   */
  async findById(id: string): Promise<OrderWithRelations | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                images: true,
              },
            },
          },
        },
        timeline: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        payment: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Creează o comandă nouă
   */
  async create(data: CreateOrderDTO, createdByUserId: string): Promise<Order> {
    const { items, ...orderData } = data;

    return prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            customDescription: item.customDescription,
            unitPrice: item.price || '0',
            lineTotal: item.price ? String(Number(item.price) * item.quantity) : '0',
          })),
        },
        timeline: {
          create: {
            action: 'ORDER_CREATED',
            description: 'Comandă creată',
            createdByUserId,
          },
        },
      },
      include: {
        items: true,
      },
    });
  }

  /**
   * Actualizează o comandă
   */
  async update(
    id: string,
    data: UpdateOrderDTO,
    updatedByUserId: string
  ): Promise<Order> {
    const { status, paymentStatus, ...updates } = data;

    // Build timeline entry
    const timelineEntries: Prisma.OrderTimelineCreateManyInput[] = [];

    if (status) {
      timelineEntries.push({
        orderId: id,
        action: 'STATUS_UPDATED',
        description: `Status schimbat în ${status}`,
        createdByUserId: updatedByUserId,
      });
    }

    if (paymentStatus) {
      timelineEntries.push({
        orderId: id,
        action: 'PAYMENT_STATUS_UPDATED',
        description: `Status plată schimbat în ${paymentStatus}`,
        createdByUserId: updatedByUserId,
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...updates,
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
    });

    // Add timeline entries
    if (timelineEntries.length > 0) {
      await prisma.orderTimeline.createMany({
        data: timelineEntries,
      });
    }

    return order;
  }

  /**
   * Șterge o comandă
   */
  async delete(id: string): Promise<void> {
    await prisma.order.delete({
      where: { id },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ORDER ITEMS
  // ═══════════════════════════════════════════════════════════════════════════

  async addItem(
    orderId: string,
    item: CreateOrderItemDTO,
    createdByUserId: string
  ) {
    const createdItem = await prisma.orderItem.create({
      data: {
        orderId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        customDescription: item.customDescription,
        unitPrice: item.price || '0',
        lineTotal: item.price ? String(Number(item.price) * item.quantity) : '0',
      },
      include: {
        product: true,
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId,
        action: 'ITEM_ADDED',
        description: `Produs adăugat: ${createdItem.product.name}`,
        createdByUserId,
      },
    });

    // Recalculate order total
    await this.recalculateOrderTotal(orderId);

    return createdItem;
  }

  async updateItem(
    orderId: string,
    itemId: string,
    updates: UpdateOrderItemDTO,
    updatedByUserId: string
  ) {
    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: {
        ...updates,
        ...(updates.quantity &&
          updates.price && {
            lineTotal: String(updates.quantity * Number(updates.price)),
          }),
      },
      include: {
        product: true,
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId,
        action: 'ITEM_UPDATED',
        description: `Produs actualizat: ${updatedItem.product.name}`,
        createdByUserId: updatedByUserId,
      },
    });

    // Recalculate order total
    await this.recalculateOrderTotal(orderId);

    return updatedItem;
  }

  async deleteItem(orderId: string, itemId: string, deletedByUserId: string) {
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Add timeline entry
    if (item) {
      await prisma.orderTimeline.create({
        data: {
          orderId,
          action: 'ITEM_DELETED',
          description: `Produs șters: ${item.product.name}`,
          createdByUserId: deletedByUserId,
        },
      });
    }

    // Recalculate order total
    await this.recalculateOrderTotal(orderId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private async recalculateOrderTotal(orderId: string): Promise<void> {
    const items = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.lineTotal),
      0
    );

    await prisma.order.update({
      where: { id: orderId },
      data: { totalPrice: String(totalPrice) },
    });
  }
}

// Export singleton instance
export const ordersRepository = new OrdersRepository();
