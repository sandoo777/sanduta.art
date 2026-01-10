/**
 * Notifications State Management Hook
 * Manages in-app notifications, reads, and real-time updates
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  InAppNotification, 
  NotificationType,
  NotificationPriority 
} from '@/lib/notifications/notificationTypes';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: InAppNotification) => !n.read).length);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ==========================================
  // MARK AS READ
  // ==========================================

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      if (!res.ok) throw new Error('Failed to mark as read');
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (!res.ok) throw new Error('Failed to mark all as read');
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    }
  }, [userId]);

  // ==========================================
  // SEND NOTIFICATION
  // ==========================================

  const sendNotification = useCallback(async (
    type: NotificationType,
    targetUserId: string,
    data: {
      title: string;
      message: string;
      icon?: string;
      iconColor?: string;
      actionUrl?: string;
      actionLabel?: string;
      priority?: NotificationPriority;
    }
  ) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          type,
          ...data,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to send notification');
      
      const newNotification = await res.json();
      
      // If sending to current user, add to list
      if (targetUserId === userId) {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
      
      return { success: true, notification: newNotification };
    } catch (err: any) {
      console.error('Failed to send notification:', err);
      return { success: false, error: err.message };
    }
  }, [userId]);

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete notification');
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  // ==========================================
  // HELPERS
  // ==========================================

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const getReadNotifications = useCallback(() => {
    return notifications.filter(n => n.read);
  }, [notifications]);

  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification,
    deleteNotification,
    
    // Helpers
    getUnreadNotifications,
    getReadNotifications,
    getNotificationsByType,
  };
}

// ==========================================
// NOTIFICATION TEMPLATES HOOK
// ==========================================

export function useNotificationTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async (type?: NotificationType, channel?: string) => {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (channel) params.append('channel', channel);
      
      const res = await fetch(`/api/notifications/templates?${params}`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      
      const data = await res.json();
      setTemplates(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch templates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback(async (type: NotificationType, channel: string) => {
    try {
      const res = await fetch(`/api/notifications/templates?type=${type}&channel=${channel}`);
      if (!res.ok) return null;
      
      const data = await res.json();
      return data.find((t: any) => t.enabled) || null;
    } catch (err) {
      console.error('Failed to get template:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplate,
  };
}

// ==========================================
// NOTIFICATION HISTORY HOOK
// ==========================================

export function useNotificationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: undefined as NotificationType | undefined,
    userId: undefined as string | undefined,
    status: undefined as string | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const fetchHistory = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      
      const res = await fetch(`/api/notifications/history?${params}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      
      const data = await res.json();
      setHistory(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    filters,
    setFilters,
    fetchHistory,
  };
}
