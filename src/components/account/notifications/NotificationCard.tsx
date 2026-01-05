'use client';

import { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { 
  BellIcon, 
  CheckIcon, 
  ArchiveBoxIcon, 
  TrashIcon,
  ShoppingCartIcon,
  FolderIcon,
  DocumentIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Notification, useNotificationsStore } from '@/modules/notifications/notificationsStore';
import { NotificationType } from '@prisma/client';

interface NotificationCardProps {
  notification: Notification;
}

export default function NotificationCard({ notification }: NotificationCardProps) {
  const { markAsRead, archiveNotification, deleteNotification } = useNotificationsStore();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingCartIcon className="w-5 h-5" />;
      case 'PROJECT':
        return <FolderIcon className="w-5 h-5" />;
      case 'FILE':
        return <DocumentIcon className="w-5 h-5" />;
      case 'SYSTEM':
        return <InformationCircleIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'ORDER':
        return 'bg-blue-100 text-blue-600';
      case 'PROJECT':
        return 'bg-purple-100 text-purple-600';
      case 'FILE':
        return 'bg-yellow-100 text-yellow-600';
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'ORDER':
        return 'Comandă';
      case 'PROJECT':
        return 'Proiect';
      case 'FILE':
        return 'Fișier';
      case 'SYSTEM':
        return 'Sistem';
      default:
        return type;
    }
  };

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await archiveNotification(notification.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Sigur doriți să ștergeți această notificare?')) {
      await deleteNotification(notification.id);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 rounded-lg border transition-all duration-200
        ${notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}
        ${notification.link ? 'cursor-pointer hover:shadow-md' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded ${getTypeColor(notification.type)}`}>
                {getTypeLabel(notification.type)}
              </span>
              {!notification.read && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ro })}
            </span>
          </div>

          <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{notification.message}</p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!notification.read && (
              <button
                onClick={handleMarkAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <CheckIcon className="w-4 h-4" />
                Marchează citit
              </button>
            )}
            <button
              onClick={handleArchive}
              className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
            >
              <ArchiveBoxIcon className="w-4 h-4" />
              Arhivează
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <TrashIcon className="w-4 h-4" />
              Șterge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
