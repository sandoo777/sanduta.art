'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/modules/notifications/useNotifications';
import { InAppNotification } from '@/lib/notifications/notificationTypes';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2,
  ShoppingCart,
  CreditCard,
  Cog,
  CheckCircle,
  Truck,
  Upload,
  AlertTriangle,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import Link from 'next/link';

interface InAppNotificationsProps {
  userId: string;
  position?: 'header' | 'sidebar';
}

export default function InAppNotifications({ 
  userId, 
  position = 'header' 
}: InAppNotificationsProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(userId);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      order_placed: <ShoppingCart className="w-5 h-5" />,
      order_paid: <CreditCard className="w-5 h-5" />,
      order_in_production: <Cog className="w-5 h-5" />,
      order_ready: <CheckCircle className="w-5 h-5" />,
      order_shipped: <Truck className="w-5 h-5" />,
      project_uploaded: <Upload className="w-5 h-5" />,
      admin_new_order: <Bell className="w-5 h-5" />,
      admin_order_issue: <AlertTriangle className="w-5 h-5" />,
      production_operation_assigned: <UserCheck className="w-5 h-5" />,
      production_machine_maintenance: <Wrench className="w-5 h-5" />,
    };
    
    return icons[type] || <Bell className="w-5 h-5" />;
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      order_placed: 'bg-indigo-100 text-indigo-600',
      order_paid: 'bg-green-100 text-green-600',
      order_in_production: 'bg-blue-100 text-blue-600',
      order_ready: 'bg-green-100 text-green-600',
      order_shipped: 'bg-blue-100 text-blue-600',
      project_uploaded: 'bg-purple-100 text-purple-600',
      admin_new_order: 'bg-red-100 text-red-600',
      admin_order_issue: 'bg-orange-100 text-orange-600',
      production_operation_assigned: 'bg-cyan-100 text-cyan-600',
      production_machine_maintenance: 'bg-yellow-100 text-yellow-600',
    };
    
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Acum';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}z`;
    return new Date(date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  };

  const handleNotificationClick = (notification: InAppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      setIsOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <Bell className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificări
              {unreadCount > 0 && (
                <Badge value={unreadCount} className="ml-2 bg-red-100 text-red-800" />
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                  title="Marchează toate ca citite"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  Nu ai notificări
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Vei primi notificări despre comenzile tale aici
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full" />
                    )}

                    <div className="flex items-start gap-3 pl-3">
                      {/* Icon */}
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                title="Marchează ca citit"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Șterge"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        {notification.actionUrl && notification.actionLabel && (
                          <Link
                            href={notification.actionUrl}
                            onClick={() => handleNotificationClick(notification)}
                            className="inline-flex items-center text-sm text-indigo-600 font-medium mt-2 hover:text-indigo-700"
                          >
                            {notification.actionLabel}
                            <span className="ml-1">→</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3">
              <Link
                href="/account/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Vezi toate notificările
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// NOTIFICATION TOAST COMPONENT
// ==========================================

interface NotificationToastProps {
  notification: InAppNotification;
  onClose: () => void;
  onAction?: () => void;
}

export function NotificationToast({ 
  notification, 
  onClose, 
  onAction 
}: NotificationToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getNotificationIcon = (type: string) => {
    // Same as above
    return <Bell className="w-5 h-5" />;
  };

  const getNotificationColor = (type: string) => {
    // Same as above
    return 'bg-indigo-100 text-indigo-600';
  };

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
            {getNotificationIcon(notification.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-900">
                {notification.title}
              </h4>
              <button
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>

            {notification.actionLabel && (
              <button
                onClick={() => {
                  onAction?.();
                  handleClose();
                }}
                className="text-sm text-indigo-600 font-medium mt-2 hover:text-indigo-700"
              >
                {notification.actionLabel} →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-indigo-600 animate-[shrink_5s_linear]"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
