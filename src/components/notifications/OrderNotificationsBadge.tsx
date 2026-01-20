'use client';

import { useOrderNotifications } from '@/lib/socket/socket-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';

export function OrderNotificationsBadge() {
  const user = useCurrentUser();
  const { notifications, isConnected } = useOrderNotifications(user?.role || 'VIEWER');
  const [isOpen, setIsOpen] = useState(false);

  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
        <span className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Notificări Comenzi</h3>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Conectat la server' : 'Deconectat'}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nu există notificări noi
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{notification.customerName}</p>
                      <p className="text-sm text-gray-600">
                        Comandă #{notification.orderId}
                      </p>
                      <p className="text-sm font-semibold text-purple-600">
                        {notification.total} RON
                      </p>
                    </div>
                    <Badge value={notification.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.timestamp).toLocaleString('ro-RO')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
