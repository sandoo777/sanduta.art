/**
 * Models Types
 * Tipuri Prisma comune și extensii pentru modele
 */

import {
  User,
  Order,
  OrderItem,
  OrderFile,
  OrderNote,
  OrderTimeline,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Customer,
  CustomerNote,
  Material,
  MaterialUsage,
  ProductionJob,
  UserRole,
  OrderStatus,
  OrderSource,
  OrderChannel,
  PaymentStatus,
  ProductionStatus,
  ProductionPriority,
  CustomerSource,
  NotificationType,
  ActivityType,
  ProductType,
} from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════════════
// PRISMA MODEL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export type {
  User,
  Order,
  OrderItem,
  OrderFile,
  OrderNote,
  OrderTimeline,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Customer,
  CustomerNote,
  Material,
  MaterialUsage,
  ProductionJob,
};

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export {
  UserRole,
  OrderStatus,
  OrderSource,
  OrderChannel,
  PaymentStatus,
  ProductionStatus,
  ProductionPriority,
  CustomerSource,
  NotificationType,
  ActivityType,
  ProductType,
};

// ═══════════════════════════════════════════════════════════════════════════
// MODEL EXTENSIONS (cu relații)
// ═══════════════════════════════════════════════════════════════════════════

export interface UserWithRelations extends User {
  orders?: Order[];
  productionJobs?: ProductionJob[];
  assignedOrders?: Order[];
  _count?: {
    orders: number;
    productionJobs: number;
    assignedOrders: number;
  };
}

export interface OrderWithRelations extends Order {
  customer?: Customer | null;
  orderItems?: OrderItemWithProduct[];
  payment?: Payment | null;
  delivery?: Delivery | null;
  timeline?: OrderTimeline[];
  assignedTo?: User | null;
  productionJobs?: ProductionJob[];
  files?: OrderFile[];
  _count?: {
    orderItems: number;
    files: number;
  };
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
  variant?: ProductVariant | null;
}

export interface ProductWithRelations extends Product {
  category: Category | null;
  variants?: ProductVariant[];
  printMethod?: PrintMethod | null;
  finishingOperations?: FinishingOperation[];
  _count?: {
    variants: number;
    orderItems: number;
  };
}

export interface CategoryWithRelations extends Category {
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
  _count?: {
    products: number;
    children: number;
  };
}

export interface ProductionJobWithRelations extends ProductionJob {
  order: Order;
  assignedTo?: User | null;
  machine?: Machine | null;
  materials?: MaterialConsumption[];
}

export interface MaterialWithRelations extends Material {
  consumptions?: MaterialConsumption[];
  _count?: {
    consumptions: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface OrderFile {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface MaterialConsumption {
  id: string;
  materialId: string;
  material?: Material;
  quantity: number;
  jobId: string;
  job?: ProductionJob;
  createdAt: Date;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  alternativePhone?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'În așteptare',
  IN_PREPRODUCTION: 'În pre-producție',
  IN_DESIGN: 'În design',
  IN_PRODUCTION: 'În producție',
  IN_PRINTING: 'În print',
  QUALITY_CHECK: 'Control calitate',
  READY_FOR_DELIVERY: 'Gata pentru livrare',
  DELIVERED: 'Livrată',
  CANCELLED: 'Anulată',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Neplatită',
  PAID: 'Platită',
  FAILED: 'Eșuată',
  REFUNDED: 'Rambursată',
};

export const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  PENDING: 'Planificată',
  IN_PROGRESS: 'În lucru',
  ON_HOLD: 'În așteptare',
  COMPLETED: 'Finalizată',
  CANCELED: 'Anulată',
};


// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════

export function isOrderWithRelations(order: Order | OrderWithRelations): order is OrderWithRelations {
  return 'orderItems' in order || 'customer' in order;
}

export function isProductWithRelations(product: Product | ProductWithRelations): product is ProductWithRelations {
  return 'category' in product || 'variants' in product;
}

export function hasOrderItems(order: Order | OrderWithRelations): order is OrderWithRelations {
  return 'orderItems' in order && Array.isArray(order.orderItems);
}
