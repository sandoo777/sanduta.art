'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNotificationsStore } from '@/modules/notifications/notificationsStore';
import NotificationCard from './NotificationCard';
import { CheckIcon, FunnelIcon } from '@heroicons/react/24/outline';

const categories = [
  { value: 'all', label: 'Toate' },
  { value: 'ORDER', label: 'Comenzi' },
  { value: 'PROJECT', label: 'Proiecte' },
  { value: 'FILE', label: 'Fișiere' },
  { value: 'SYSTEM', label: 'Sistem' }
] as const;

export default function NotificationsList() {
  const {
    notifications,
    loading,
    hasMore,
    category,
    unreadOnly,
    fetchNotifications,
    markAllAsRead,
    setCategory,
    setUnreadOnly
  } = useNotificationsStore();

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  // Infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading) {
      fetchNotifications(false);
    }
  }, [hasMore, loading, fetchNotifications]);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  const handleCategoryChange = (newCategory: typeof categories[number]['value']) => {
    setCategory(newCategory);
  };

  const handleUnreadToggle = () => {
    setUnreadOnly(!unreadOnly);
  };

  const handleMarkAllAsRead = async () => {
    if (confirm('Marchezi toate notificările ca citite?')) {
      await markAllAsRead();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${category === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUnreadToggle}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${unreadOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <FunnelIcon className="w-4 h-4" />
            Doar necitite
          </button>

          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
          >
            <CheckIcon className="w-4 h-4" />
            Marchează toate
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Se încarcă notificările...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nu există notificări</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}

            {/* Infinite scroll target */}
            {hasMore && (
              <div ref={observerTarget} className="py-4 text-center">
                {loading && (
                  <div className="inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
