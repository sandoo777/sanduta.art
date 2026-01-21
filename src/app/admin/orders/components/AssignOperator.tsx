'use client';

import { useState, useEffect } from 'react';
import { useOrders } from '@/modules/orders/useOrders';
import { fetchUsers } from '@/lib/api';
import { toast } from 'sonner';

interface Operator {
  id: string;
  name: string;
  email: string;
}

interface AssignOperatorProps {
  orderId: string;
  assignedToUserId?: string | null;
  assignedOperatorName?: string;
  onOperatorAssigned?: (operatorId: string | null, operatorName?: string) => void;
}

export function AssignOperator({
  orderId,
  assignedToUserId,
  assignedOperatorName,
  onOperatorAssigned,
}: AssignOperatorProps) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { assignOperator } = useOrders();

  useEffect(() => {
    // Fetch operators list
    const fetchOperators = async () => {
      try {
        const response = await fetchUsers({ role: 'OPERATOR' });
        if (response.success && response.data) {
          setOperators(Array.isArray(response.data) ? response.data : []);
        } else {
          toast.error('Eroare la încărcarea operatorilor');
        }
      } catch (error) {
        console.error('Failed to fetch operators:', error);
        toast.error('Eroare la încărcarea operatorilor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperators();
  }, []);

  const handleAssign = async (operatorId: string | null) => {
    setIsUpdating(true);
    const result = await assignOperator(orderId, operatorId);

    if (result.success) {
      toast.success('Operator alocat cu succes');
      onOperatorAssigned?.(operatorId);
    } else {
      toast.error('Eroare la alocare: ' + result.error);
    }
    setIsUpdating(false);
  };

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500">Se încarcă operatorii...</div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Operator:</label>
      <select
        value={assignedToUserId || ''}
        onChange={(e) => handleAssign(e.target.value || null)}
        disabled={isUpdating}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm
          bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed
          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">- Nicio alocare -</option>
        {operators.map((op) => (
          <option key={op.id} value={op.id}>
            {op.name} ({op.email})
          </option>
        ))}
      </select>
      {assignedOperatorName && (
        <span className="text-xs text-gray-500">
          Actual: {assignedOperatorName}
        </span>
      )}
    </div>
  );
}
