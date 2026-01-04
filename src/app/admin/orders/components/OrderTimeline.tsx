'use client';

import { Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  type: 'created' | 'status_changed' | 'payment_updated' | 'item_added' | 'item_removed' | 'file_added';
}

interface OrderTimelineProps {
  createdAt: string;
  updatedAt: string;
  status: string;
  paymentStatus: string;
  itemsCount: number;
  filesCount: number;
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'În așteptare',
    CONFIRMED: 'Confirmat',
    IN_PROGRESS: 'În progres',
    READY: 'Gata',
    SHIPPED: 'Livrat',
    DELIVERED: 'Entregat',
    CANCELLED: 'Anulat',
  };
  return labels[status] || status;
};

const getPaymentLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'În așteptare',
    PAID: 'Plătit',
    PARTIAL: 'Parțial plătit',
    REFUNDED: 'Returnat',
  };
  return labels[status] || status;
};

export function OrderTimeline({
  createdAt,
  updatedAt,
  status,
  paymentStatus,
  itemsCount,
  filesCount,
}: OrderTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const events: TimelineEvent[] = [
    {
      id: 'created',
      timestamp: createdAt,
      title: 'Comandă creată',
      type: 'created',
    },
    {
      id: 'status',
      timestamp: updatedAt,
      title: `Status: ${getStatusLabel(status)}`,
      type: 'status_changed',
    },
    {
      id: 'payment',
      timestamp: updatedAt,
      title: `Plată: ${getPaymentLabel(paymentStatus)}`,
      type: 'payment_updated',
    },
  ];

  if (itemsCount > 0) {
    events.push({
      id: 'items',
      timestamp: updatedAt,
      title: `${itemsCount} articole adăugate`,
      type: 'item_added',
    });
  }

  if (filesCount > 0) {
    events.push({
      id: 'files',
      timestamp: updatedAt,
      title: `${filesCount} fișiere atașate`,
      type: 'file_added',
    });
  }

  const getTypeColor = (type: TimelineEvent['type']) => {
    const colors: Record<TimelineEvent['type'], string> = {
      created: 'bg-green-100 text-green-700',
      status_changed: 'bg-blue-100 text-blue-700',
      payment_updated: 'bg-purple-100 text-purple-700',
      item_added: 'bg-yellow-100 text-yellow-700',
      item_removed: 'bg-red-100 text-red-700',
      file_added: 'bg-indigo-100 text-indigo-700',
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Timeline</h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${getTypeColor(event.type)} flex items-center justify-center flex-shrink-0 border-2 border-white`}>
                <Clock size={18} />
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-300 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="pt-1 pb-4">
              <p className="font-semibold text-gray-900">{event.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(event.timestamp)}
              </p>
              {event.description && (
                <p className="text-sm text-gray-600 mt-2">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
