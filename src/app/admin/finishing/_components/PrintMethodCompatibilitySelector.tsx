'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';

interface PrintMethod {
  id: string;
  name: string;
  type: string;
}

interface PrintMethodCompatibilitySelectorProps {
  selectedPrintMethodIds: string[];
  onChange: (ids: string[]) => void;
}

export function PrintMethodCompatibilitySelector({
  selectedPrintMethodIds,
  onChange,
}: PrintMethodCompatibilitySelectorProps) {
  const [printMethods, setPrintMethods] = useState<PrintMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrintMethods();
  }, []);

  const fetchPrintMethods = async () => {
    try {
      const response = await fetch('/api/admin/print-methods', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPrintMethods(data);
      }
    } catch (error) {
      console.error('Error fetching print methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePrintMethod = (methodId: string) => {
    if (selectedPrintMethodIds.includes(methodId)) {
      onChange(selectedPrintMethodIds.filter((id) => id !== methodId));
    } else {
      onChange([...selectedPrintMethodIds, methodId]);
    }
  };

  const removePrintMethod = (methodId: string) => {
    onChange(selectedPrintMethodIds.filter((id) => id !== methodId));
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Se încarcă metodele de tipărire...</div>;
  }

  const selectedMethods = printMethods.filter((m) =>
    selectedPrintMethodIds.includes(m.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 rounded-lg bg-gray-50">
        {selectedMethods.length === 0 ? (
          <span className="text-sm text-gray-400">Selectează metode de tipărire compatibile</span>
        ) : (
          selectedMethods.map((method) => (
            <Badge
              key={method.id}
              variant="secondary"
              className="gap-1 pr-1 bg-green-50 text-green-700 hover:bg-green-100"
            >
              {method.name}
              <button
                type="button"
                onClick={() => removePrintMethod(method.id)}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
        {printMethods.map((method) => (
          <label
            key={method.id}
            className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedPrintMethodIds.includes(method.id)}
              onChange={() => togglePrintMethod(method.id)}
              className="mt-0.5 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {method.name}
              </div>
              <div className="text-xs text-gray-500">{method.type}</div>
            </div>
          </label>
        ))}
      </div>

      {selectedPrintMethodIds.length === 0 && (
        <p className="text-xs text-red-500">
          * Selectează cel puțin o metodă de tipărire compatibilă
        </p>
      )}
    </div>
  );
}
