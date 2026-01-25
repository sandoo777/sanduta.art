'use client';

import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Clock, Package, CreditCard, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface OrderTimelineProps {
  createdAt: string | Date;
  updatedAt: string | Date;
  status: string;
  paymentStatus?: string;
  itemsCount?: number;
  filesCount?: number;
}

interface TimelineEvent {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  timestamp: Date;
  color: string;
}

export function OrderTimeline({
  createdAt,
  updatedAt,
  status,
  paymentStatus = 'PENDING',
  itemsCount = 0,
  filesCount = 0,
}: OrderTimelineProps) {
  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const updatedDate = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;

  // Build timeline events
  const events: TimelineEvent[] = [
    {
      id: '1',
      icon: Package,
      title: 'Comandă creată',
      description: `Comandă cu ${itemsCount} produse`,
      timestamp: createdDate,
      color: 'bg-blue-500',
    },
  ];

  if (filesCount > 0) {
    events.push({
      id: '2',
      icon: FileText,
      title: 'Fișiere încărcate',
      description: `${filesCount} fișiere atașate`,
      timestamp: createdDate,
      color: 'bg-purple-500',
    });
  }

  if (paymentStatus === 'PAID') {
    events.push({
      id: '3',
      icon: CreditCard,
      title: 'Plată confirmată',
      description: 'Plata a fost procesată cu succes',
      timestamp: updatedDate,
      color: 'bg-green-500',
    });
  }

  if (status === 'IN_PRODUCTION') {
    events.push({
      id: '4',
      icon: Clock,
      title: 'În producție',
      description: 'Comanda este în procesare',
      timestamp: updatedDate,
      color: 'bg-yellow-500',
    });
  }

  if (status === 'DELIVERED') {
    events.push({
      id: '5',
      icon: CheckCircle,
      title: 'Livrată',
      description: 'Comanda a fost livrată cu succes',
      timestamp: updatedDate,
      color: 'bg-green-600',
    });
  }

  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Istoric comandă
        </h3>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          {/* Events */}
          <div className="space-y-6">
            {sortedEvents.map((event, index) => {
              const Icon = event.icon;
              const isLast = index === sortedEvents.length - 1;
              
              return (
                <div key={event.id} className="relative flex items-start">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${event.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className={`ml-4 flex-1 ${!isLast ? 'pb-6' : ''}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {event.title}
                      </h4>
                      <time className="text-xs text-gray-500">
                        {format(event.timestamp, 'dd MMM yyyy, HH:mm', { locale: ro })}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last updated */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Ultima actualizare: {format(updatedDate, 'dd MMMM yyyy, HH:mm', { locale: ro })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
