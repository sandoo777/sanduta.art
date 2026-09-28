'use client';

import { FormLabel } from '@/components/ui/FormLabel';
import type { SupplierLinkState, SupplierOption } from './types';

type SuppliersSectionProps = {
  suppliers: SupplierOption[];
  primarySupplierId: string | null;
  onPrimarySupplierChange: (supplierId: string | null) => void;
  supplierLinks: SupplierLinkState[];
  onSupplierLinksChange: (next: SupplierLinkState[]) => void;
};

export function SuppliersSection({
  suppliers,
  primarySupplierId,
  onPrimarySupplierChange,
  supplierLinks,
  onSupplierLinksChange,
}: SuppliersSectionProps) {
  return (
    <div className="space-y-5" aria-label="Suppliers section">
      <div>
        <FormLabel>Furnizor principal</FormLabel>
        <select
          aria-label="Primary supplier"
          value={primarySupplierId ?? ''}
          onChange={(event) => onPrimarySupplierChange(event.target.value || null)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Fără furnizor principal</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Furnizori asociați</p>
          <button
            type="button"
            aria-label="Add supplier"
            onClick={() => onSupplierLinksChange([...supplierLinks, { supplierId: '' }])}
            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs hover:bg-gray-50"
          >
            Add supplier
          </button>
        </div>

        {supplierLinks.map((link, index) => (
          <div key={`supplier-link-${index}`} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-3 md:grid-cols-2">
            <div>
              <FormLabel>Supplier</FormLabel>
              <select
                aria-label={`Supplier ${index + 1}`}
                value={link.supplierId}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  onSupplierLinksChange(supplierLinks.map((item, itemIndex) => itemIndex === index ? { ...item, supplierId: nextValue } : item));
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={`${supplier.id}-${index}`} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                aria-label={`Remove supplier ${index + 1}`}
                onClick={() => {
                  onSupplierLinksChange(
                    supplierLinks.length === 1
                      ? [{ supplierId: '' }]
                      : supplierLinks.filter((_, itemIndex) => itemIndex !== index)
                  );
                }}
                className="h-[42px] w-full rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
