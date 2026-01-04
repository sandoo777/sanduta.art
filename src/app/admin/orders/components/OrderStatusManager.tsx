'use client';

import { useState } from 'react';
import { useOrders } from '@/modules/orders/useOrders';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'În așteptare' },
  { value: 'CONFIRMED', label: 'Confirmat' },
  { value: 'IN_PROGRESS', label: 'În progres' },
  { value: 'READY', label: 'Gata' },
  { value: 'SHIPPED', label: 'Livrat' },
  { value: 'DELIVERED', label: 'Entregat' },
  { value: 'CANCELLED', label: 'Anulat' },
];

interface OrderStatusManagerProps {
  orderId: string;
  currentStatus: string;
  onStatusChanged?: (status: string) => void;
}

export function OrderStatusManager({
  orderId,
  currentStatus,
  onStatusChanged,
}: OrderStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateStatus } = useOrders();

  const handleStatusChange = async (newStatus: string) => {
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
        onChange={(e) => handleStatusChange(e.target.value)}
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
