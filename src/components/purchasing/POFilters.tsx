type FilterState = {
  status: string;
  supplierId: string;
  search: string;
  fromDate: string;
  toDate: string;
};

interface POFiltersProps {
  filters: FilterState;
  suppliers: Array<{ id: string; name: string }>;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

export function POFilters({ filters, suppliers, onChange, onReset }: POFiltersProps) {
  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-5">
      <label className="text-sm font-medium text-slate-700">
        Search
        <input
          value={filters.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="PO number"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-500"
        />
      </label>

      <label className="text-sm font-medium text-slate-700">
        Status
        <select
          value={filters.status}
          onChange={(event) => update('status', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">All</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
          <option value="SENT">SENT</option>
          <option value="RECEIVED">RECEIVED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </label>

      <label className="text-sm font-medium text-slate-700">
        Supplier
        <select
          value={filters.supplierId}
          onChange={(event) => update('supplierId', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">All</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-slate-700">
        From
        <input
          type="date"
          value={filters.fromDate}
          onChange={(event) => update('fromDate', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
      </label>

      <div className="flex items-end gap-2">
        <label className="w-full text-sm font-medium text-slate-700">
          To
          <input
            type="date"
            value={filters.toDate}
            onChange={(event) => update('toDate', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </label>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export type { FilterState };
