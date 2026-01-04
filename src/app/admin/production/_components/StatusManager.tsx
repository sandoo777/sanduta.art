"use client";

import { ProductionStatus } from "@/modules/production/useProduction";

interface StatusManagerProps {
  currentStatus: ProductionStatus;
  onStatusChange: (status: ProductionStatus) => Promise<void>;
  loading?: boolean;
}

const statusOptions: Array<{
  value: ProductionStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = [
  {
    value: "PENDING",
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    value: "ON_HOLD",
    label: "On Hold",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  {
    value: "CANCELED",
    label: "Canceled",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
  },
];

export default function StatusManager({ currentStatus, onStatusChange, loading }: StatusManagerProps) {
  const currentOption = statusOptions.find((opt) => opt.value === currentStatus);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ProductionStatus;
    if (newStatus !== currentStatus) {
      await onStatusChange(newStatus);
    }
  };

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={loading}
        className={`
          w-full px-3 py-2 rounded-lg border font-medium text-sm
          ${currentOption?.color} ${currentOption?.bgColor} ${currentOption?.borderColor}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer appearance-none pr-8
        `}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Dropdown Icon */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: ProductionStatus }) {
  const option = statusOptions.find((opt) => opt.value === status);
  
  if (!option) return null;

  return (
    <span className={`
      px-3 py-1 rounded-full text-xs font-medium border
      ${option.color} ${option.bgColor} ${option.borderColor}
    `}>
      {option.label}
    </span>
  );
}
