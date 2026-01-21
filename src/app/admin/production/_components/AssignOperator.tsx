"use client";

import { useState, useEffect } from "react";
import { LoadingState } from '@/components/ui';
import { fetchUsers } from '@/lib/api';
import { User } from '@/types/models';

interface AssignOperatorProps {
  currentOperatorId?: string;
  currentOperator?: {
    id: string;
    name: string;
    email: string;
  };
  onAssign: (userId: string | null) => Promise<void>;
  loading?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AssignOperator({ 
  currentOperatorId, 
  currentOperator, 
  onAssign, 
  loading 
}: AssignOperatorProps) {
  const [operators, setOperators] = useState<User[]>([]);
  const [loadingOperators, setLoadingOperators] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoadingOperators(true);
      const response = await fetchUsers({ role: 'MANAGER' });
      const response2 = await fetchUsers({ role: 'OPERATOR' });
      
      if (!response.success || !response2.success) {
        throw new Error("Failed to fetch operators");
      }

      const combined = [...(response.data || []), ...(response2.data || [])];
      setOperators(combined);
    } catch (err) {
      console.error("Error fetching operators:", err);
      setError("Failed to load operators");
    } finally {
      setLoadingOperators(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newOperatorId = value === "" ? null : value;
    
    if (newOperatorId !== currentOperatorId) {
      await onAssign(newOperatorId);
    }
  };

  if (loadingOperators) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <LoadingState size="sm" text="Loading operators..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Current Operator Display */}
      {currentOperator && (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">
            {getInitials(currentOperator.name)}
          </div>
          <div>
            <div className="font-medium">{currentOperator.name}</div>
            <div className="text-xs text-gray-500">{currentOperator.email}</div>
          </div>
        </div>
      )}

      {/* Operator Selector */}
      <div className="relative">
        <select
          value={currentOperatorId || ""}
          onChange={handleChange}
          disabled={loading || loadingOperators}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-8"
        >
          <option value="">Unassigned</option>
          {operators.map((operator) => (
            <option key={operator.id} value={operator.id}>
              {operator.name} ({operator.role})
            </option>
          ))}
        </select>
        
        {/* Dropdown Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
