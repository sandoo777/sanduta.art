import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/lib/logger';

export interface ServerToClientEvents {
  'order:created': (data: OrderNotification) => void;
  'order:updated': (data: OrderNotification) => void;
  'order:status-changed': (data: OrderStatusNotification) => void;
  'production:updated': (data: ProductionNotification) => void;
  'notification': (data: Notification) => void;
  'inventory:low-stock': (data: InventoryNotification) => void;
}

export interface ClientToServerEvents {
  'subscribe:orders': (role: string) => void;
  'subscribe:production': () => void;
  'subscribe:inventory': () => void;
  'unsubscribe:orders': () => void;
  'unsubscribe:production': () => void;
  'unsubscribe:inventory': () => void;
}

export interface OrderNotification {
  orderId: string;
  customerName: string;
  total: number;
  status: string;
  timestamp: Date;
}

export interface OrderStatusNotification {
  orderId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: Date;
}

export interface ProductionNotification {
  orderId: string;
  status: string;
  progress: number;
  estimatedCompletion?: Date;
  timestamp: Date;
}

export interface InventoryNotification {
  productId: string;
  productName: string;
  stock: number;
  threshold: number;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  if (io) {
    logger.info('Socket.IO', 'Already initialized');
    return io;
  }

  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    path: '/api/socket',
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    logger.info('Socket.IO', 'Client connected', { socketId: socket.id });

    // Subscribe to orders channel
    socket.on('subscribe:orders', (role: string) => {
      socket.join('orders');
      logger.info('Socket.IO', 'Client subscribed to orders', { socketId: socket.id, role });
      
      // If admin/manager, join admin orders room for all notifications
      if (['ADMIN', 'MANAGER'].includes(role)) {
        socket.join('orders:admin');
      }
    });

    // Subscribe to production channel
    socket.on('subscribe:production', () => {
      socket.join('production');
      logger.info('Socket.IO', 'Client subscribed to production', { socketId: socket.id });
    });

    // Subscribe to inventory channel
    socket.on('subscribe:inventory', () => {
      socket.join('inventory');
      logger.info('Socket.IO', 'Client subscribed to inventory', { socketId: socket.id });
    });

    // Unsubscribe handlers
    socket.on('unsubscribe:orders', () => {
      socket.leave('orders');
      socket.leave('orders:admin');
      logger.info('Socket.IO', 'Client unsubscribed from orders', { socketId: socket.id });
    });

    socket.on('unsubscribe:production', () => {
      socket.leave('production');
      logger.info('Socket.IO', 'Client unsubscribed from production', { socketId: socket.id });
    });

    socket.on('unsubscribe:inventory', () => {
      socket.leave('inventory');
      logger.info('Socket.IO', 'Client unsubscribed from inventory', { socketId: socket.id });
    });

    socket.on('disconnect', () => {
      logger.info('Socket.IO', 'Client disconnected', { socketId: socket.id });
    });
  });

  logger.info('Socket.IO', 'Initialized successfully');
  return io;
}

export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null {
  return io;
}

// Emit order notifications
export function emitOrderCreated(data: OrderNotification) {
  io?.to('orders:admin').emit('order:created', data);
  logger.info('Socket.IO', 'Emitted order:created', { orderId: data.orderId });
}

export function emitOrderUpdated(data: OrderNotification) {
  io?.to('orders:admin').emit('order:updated', data);
  logger.info('Socket.IO', 'Emitted order:updated', { orderId: data.orderId });
}

export function emitOrderStatusChanged(data: OrderStatusNotification) {
  io?.to('orders').emit('order:status-changed', data);
  logger.info('Socket.IO', 'Emitted order:status-changed', { orderId: data.orderId });
}

// Emit production notifications
export function emitProductionUpdated(data: ProductionNotification) {
  io?.to('production').emit('production:updated', data);
  logger.info('Socket.IO', 'Emitted production:updated', { orderId: data.orderId });
}

// Emit inventory notifications
export function emitLowStock(data: InventoryNotification) {
  io?.to('inventory').emit('inventory:low-stock', data);
  logger.info('Socket.IO', 'Emitted inventory:low-stock', { productId: data.productId });
}

// Emit general notifications
export function emitNotification(room: string, data: Notification) {
  io?.to(room).emit('notification', data);
  logger.info('Socket.IO', 'Emitted notification', { room, type: data.type });
}
