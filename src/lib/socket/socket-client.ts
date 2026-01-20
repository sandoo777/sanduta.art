'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  OrderNotification,
  OrderStatusNotification,
  ProductionNotification,
  InventoryNotification,
  Notification
} from './socket-server';

type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket() {
  const socketRef = useRef<SocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socket',
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', socketRef.current?.id);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected
  };
}

// Hook for order notifications
export function useOrderNotifications(role: string) {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit('subscribe:orders', role);

    socket.on('order:created', (data: OrderNotification) => {
      setNotifications(prev => [data, ...prev].slice(0, 50)); // Keep last 50
    });

    socket.on('order:updated', (data: OrderNotification) => {
      setNotifications(prev => [data, ...prev].slice(0, 50));
    });

    return () => {
      socket.emit('unsubscribe:orders');
      socket.off('order:created');
      socket.off('order:updated');
    };
  }, [socket, isConnected, role]);

  return { notifications, isConnected };
}

// Hook for order status changes
export function useOrderStatusUpdates(orderId?: string) {
  const { socket, isConnected } = useSocket();
  const [statusUpdate, setStatusUpdate] = useState<OrderStatusNotification | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit('subscribe:orders', 'VIEWER');

    socket.on('order:status-changed', (data: OrderStatusNotification) => {
      if (!orderId || data.orderId === orderId) {
        setStatusUpdate(data);
      }
    });

    return () => {
      socket.emit('unsubscribe:orders');
      socket.off('order:status-changed');
    };
  }, [socket, isConnected, orderId]);

  return { statusUpdate, isConnected };
}

// Hook for production updates
export function useProductionUpdates() {
  const { socket, isConnected } = useSocket();
  const [updates, setUpdates] = useState<ProductionNotification[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit('subscribe:production');

    socket.on('production:updated', (data: ProductionNotification) => {
      setUpdates(prev => [data, ...prev].slice(0, 50));
    });

    return () => {
      socket.emit('unsubscribe:production');
      socket.off('production:updated');
    };
  }, [socket, isConnected]);

  return { updates, isConnected };
}

// Hook for inventory alerts
export function useInventoryAlerts() {
  const { socket, isConnected } = useSocket();
  const [alerts, setAlerts] = useState<InventoryNotification[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit('subscribe:inventory');

    socket.on('inventory:low-stock', (data: InventoryNotification) => {
      setAlerts(prev => [data, ...prev].slice(0, 50));
    });

    return () => {
      socket.emit('unsubscribe:inventory');
      socket.off('inventory:low-stock');
    };
  }, [socket, isConnected]);

  return { alerts, isConnected };
}

// Hook for general notifications
export function useNotifications() {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('notification', (data: Notification) => {
      setNotifications(prev => [data, ...prev].slice(0, 100));
    });

    return () => {
      socket.off('notification');
    };
  }, [socket, isConnected]);

  const clearNotifications = () => setNotifications([]);
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    isConnected,
    clearNotifications,
    removeNotification
  };
}
