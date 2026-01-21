'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNotifications } from '@/modules/notifications/useNotifications';
import { useSession } from 'next-auth/react';
import { InAppNotification } from '@/lib/notifications/notificationTypes';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  ShoppingCart,
  CreditCard,
  Cog,
  CheckCircle,
  Truck,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import Link from 'next/link';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadNotifications,
    getReadNotifications,
  } = useNotifications(userId);

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [filteredNotifications, setFilteredNotifications] = useState<InAppNotification[]>([]);

  // Memoize callbacks to prevent recreation
  const unreadNotifications = useMemo(() => getUnreadNotifications(), [getUnreadNotifications]);
  const readNotifications = useMemo(() => getReadNotifications(), [getReadNotifications]);

  useEffect(() => {
    if (filter === 'unread') {
      setFilteredNotifications(unreadNotifications);
    } else if (filter === 'read') {
      setFilteredNotifications(readNotifications);
    } else {
      setFilteredNotifications(notifications);
    }
     
  }, [filter, notifications, unreadNotifications, readNotifications]);

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
    };
    
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingState text="Se încarcă notificările..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notificări
          </h1>
          <p className="text-gray-600">
            Toate notificările tale despre comenzi și proiecte
          </p>
        </div>

        {/* Actions Bar */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Toate ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Necitite ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'read'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Citite ({notifications.length - unreadCount})
              </button>
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marchează toate ca citite
              </Button>
            )}
          </div>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread'
                ? 'Nu ai notificări necitite'
                : filter === 'read'
                ? 'Nu ai notificări citite'
                : 'Nu ai notificări'}
            </h3>
            <p className="text-sm text-gray-500">
              {filter === 'all' && 'Vei primi notificări despre comenzile tale aici'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-6 transition-all ${
                  !notification.read ? 'border-l-4 border-l-indigo-600 bg-indigo-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-full ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <Badge value="Nou" className="bg-indigo-100 text-indigo-800" />
                      )}
                    </div>

                    <p className="text-gray-700 mb-4">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {notification.actionUrl && notification.actionLabel && (
                        <Link href={notification.actionUrl}>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            {notification.actionLabel}
                          </Button>
                        </Link>
                      )}

                      {!notification.read && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Marchează ca citit
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Șterge
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
