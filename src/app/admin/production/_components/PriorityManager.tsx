"use client";

import { ProductionPriority } from "@/modules/production/useProduction";

interface PriorityManagerProps {
  currentPriority: ProductionPriority;
  onPriorityChange: (priority: ProductionPriority) => Promise<void>;
  loading?: boolean;
}

const priorityOptions: Array<{
  value: ProductionPriority;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = [
  {
    value: "LOW",
    label: "Low",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    value: "NORMAL",
    label: "Normal",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  {
    value: "HIGH",
    label: "High",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    value: "URGENT",
    label: "Urgent",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

export default function PriorityManager({ currentPriority, onPriorityChange, loading }: PriorityManagerProps) {
  const currentOption = priorityOptions.find((opt) => opt.value === currentPriority);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as ProductionPriority;
    if (newPriority !== currentPriority) {
      await onPriorityChange(newPriority);
    }
  };

  return (
    <div className="relative">
      <select
        value={currentPriority}
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
        {priorityOptions.map((option) => (
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

export function PriorityBadge({ priority }: { priority: ProductionPriority }) {
  const option = priorityOptions.find((opt) => opt.value === priority);
  
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
