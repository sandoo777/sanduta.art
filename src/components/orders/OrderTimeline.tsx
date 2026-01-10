import React from 'react';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/lib/orders/orderStatus';

export interface TimelineEntry {
  status: OrderStatus;
  date: string;
  user: string;
  note?: string;
}

interface OrderTimelineProps {
  timeline: TimelineEntry[];
}

const statusIcons: Record<OrderStatus, JSX.Element> = {
  [OrderStatus.Pending]: <span>🕓</span>,
  [OrderStatus.AwaitingPayment]: <span>💳</span>,
  [OrderStatus.Processing]: <span>⚙️</span>,
  [OrderStatus.InProduction]: <span>🏭</span>,
  [OrderStatus.ReadyForPickup]: <span>📦</span>,
  [OrderStatus.Shipped]: <span>🚚</span>,
  [OrderStatus.Completed]: <span>✅</span>,
  [OrderStatus.Cancelled]: <span>❌</span>,
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ timeline }) => (
  <ol className="relative border-l-2 border-slate-200">
    {timeline.map((entry, idx) => (
      <li key={idx} className="mb-8 ml-4">
        <div className="absolute -left-5 flex h-8 w-8 items-center justify-center rounded-full bg-white ring-2 ring-slate-300">
          {statusIcons[entry.status]}
        </div>
        <div className="pl-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{ORDER_STATUS_LABELS[entry.status]}</span>
            <span className="text-xs text-slate-500">{entry.date}</span>
          </div>
          <div className="text-xs text-slate-500">{entry.user}</div>
          {entry.note && <div className="mt-1 text-xs text-amber-700">{entry.note}</div>}
        </div>
      </li>
    ))}
  </ol>
);
