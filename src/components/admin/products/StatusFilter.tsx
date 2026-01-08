'use client';

interface StatusFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function StatusFilter({ checked, onChange }: StatusFilterProps) {
  return (
    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="text-sm font-medium text-gray-700">Doar active</span>
    </label>
  );
}
