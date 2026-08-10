'use client';

import { useState } from 'react';
import type { OrderStatus } from '@prisma/client';
import { useOrders } from '@/modules/orders/useOrders';
import { toast } from 'sonner';

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'PENDING', label: 'În așteptare' },
  { value: 'IN_PREPRODUCTION', label: 'În preproducție' },
  { value: 'IN_DESIGN', label: 'În design' },
  { value: 'IN_PRODUCTION', label: 'În producție' },
  { value: 'IN_PRINTING', label: 'În tipar' },
  { value: 'QUALITY_CHECK', label: 'Control calitate' },
  { value: 'READY_FOR_DELIVERY', label: 'Gata de livrare' },
  { value: 'DELIVERED', label: 'Entregat' },
  { value: 'CANCELLED', label: 'Anulat' },
];

interface OrderStatusManagerProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChanged?: (status: OrderStatus) => void;
}

export function OrderStatusManager({
  orderId,
  currentStatus,
  onStatusChanged,
}: OrderStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateStatus } = useOrders();

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    const result = await updateStatus(orderId, newStatus);

    if (result.success) {
      toast.success('Status actualizat cu succes');
      onStatusChanged?.(newStatus);
    } else {
      toast.error('Eroare la actualizare: ' + result.error);
    }
    setIsUpdating(false);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Status:</label>
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        disabled={isUpdating}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium
          bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
