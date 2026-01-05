import { create } from 'zustand';
import { NotificationType } from '@prisma/client';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  archived: boolean;
  link: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  category: 'all' | 'ORDER' | 'PROJECT' | 'FILE' | 'SYSTEM';
  unreadOnly: boolean;
  
  // Actions
  fetchNotifications: (reset?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  setCategory: (category: 'all' | 'ORDER' | 'PROJECT' | 'FILE' | 'SYSTEM') => void;
  setUnreadOnly: (unreadOnly: boolean) => void;
  addNotification: (notification: Notification) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  hasMore: false,
  loading: false,
  category: 'all',
  unreadOnly: false,

  fetchNotifications: async (reset = false) => {
    const { notifications, category, unreadOnly } = get();
    const offset = reset ? 0 : notifications.length;
    
    set({ loading: true });

    try {
      const params = new URLSearchParams({
        category,
        unreadOnly: unreadOnly.toString(),
        limit: '20',
        offset: offset.toString()
      });

      const response = await fetch(`/api/account/notifications?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      set({
        notifications: reset ? data.notifications : [...notifications, ...data.notifications],
        totalCount: data.totalCount,
        unreadCount: data.unreadCount,
        hasMore: data.hasMore,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await fetch('/api/account/notifications/unread-count');
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      set({ unreadCount: data.unreadCount });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await fetch(`/api/account/notifications/${notificationId}`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const { notifications, unreadCount } = get();
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );

      set({
        notifications: updated,
        unreadCount: Math.max(0, unreadCount - 1)
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await fetch('/api/account/notifications/mark-all-read', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, read: true }));

      set({
        notifications: updated,
        unreadCount: 0
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  archiveNotification: async (notificationId: string) => {
    try {
      const response = await fetch(`/api/account/notifications/${notificationId}/archive`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to archive notification');
      }

      const { notifications } = get();
      const filtered = notifications.filter(n => n.id !== notificationId);

      set({ notifications: filtered });
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      const response = await fetch(`/api/account/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      const { notifications, unreadCount } = get();
      const notification = notifications.find(n => n.id === notificationId);
      const filtered = notifications.filter(n => n.id !== notificationId);

      set({
        notifications: filtered,
        unreadCount: notification && !notification.read ? Math.max(0, unreadCount - 1) : unreadCount
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  setCategory: (category) => {
    set({ category });
    get().fetchNotifications(true);
  },

  setUnreadOnly: (unreadOnly) => {
    set({ unreadOnly });
    get().fetchNotifications(true);
  },

  addNotification: (notification) => {
    const { notifications, unreadCount } = get();
    set({
      notifications: [notification, ...notifications],
      unreadCount: unreadCount + 1
    });
  }
}));
