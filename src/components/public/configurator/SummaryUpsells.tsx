"use client";

interface UpsellItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  quantity?: number;
}

interface SummaryUpsellsProps {
  items: UpsellItem[];
  currency?: string;
  onRemove?: (id: string) => void;
}

function formatMoney(value: number, currency = 'RON') {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(value);
}

export function SummaryUpsells({ items, currency = 'RON', onRemove }: SummaryUpsellsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Extra opțiuni</h3>
          <p className="text-sm text-gray-600">Servicii suplimentare adăugate.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Nu ai adăugat extra servicii.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 border border-gray-100 rounded-md p-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.title}</p>
                {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                {item.quantity && <p className="text-xs text-gray-500">x{item.quantity}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{formatMoney(item.price * (item.quantity || 1), currency)}</span>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Elimină
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
