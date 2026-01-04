'use client';

import { useState } from 'react';
import { useOrders } from '@/modules/orders/useOrders';
import { toast } from 'sonner';

const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'În așteptare' },
  { value: 'PAID', label: 'Plătit' },
  { value: 'PARTIAL', label: 'Parțial plătit' },
  { value: 'REFUNDED', label: 'Returnat' },
];

interface PaymentStatusManagerProps {
  orderId: string;
  currentPaymentStatus: string;
  onPaymentStatusChanged?: (status: string) => void;
}

export function PaymentStatusManager({
  orderId,
  currentPaymentStatus,
  onPaymentStatusChanged,
}: PaymentStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updatePaymentStatus } = useOrders();

  const handlePaymentStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const result = await updatePaymentStatus(orderId, newStatus);

    if (result.success) {
      toast.success('Status de plată actualizat cu succes');
      onPaymentStatusChanged?.(newStatus);
    } else {
      toast.error('Eroare la actualizare: ' + result.error);
    }
    setIsUpdating(false);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Plată:</label>
      <select
        value={currentPaymentStatus}
        onChange={(e) => handlePaymentStatusChange(e.target.value)}
        disabled={isUpdating}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium
          bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {PAYMENT_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
