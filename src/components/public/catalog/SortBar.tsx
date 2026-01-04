'use client';

interface SortBarProps {
  onSortChange: (sortBy: SortOption) => void;
  currentSort: SortOption;
  totalProducts: number;
}

export type SortOption =
  | 'popular'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Cele mai populare' },
  { value: 'newest', label: 'Cele mai noi' },
  { value: 'price-asc', label: 'Preț crescător' },
  { value: 'price-desc', label: 'Preț descrescător' },
  { value: 'name-asc', label: 'Nume (A-Z)' },
];

export function SortBar({ onSortChange, currentSort, totalProducts }: SortBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Results Count */}
      <div className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{totalProducts}</span>{' '}
        {totalProducts === 1 ? 'produs găsit' : 'produse găsite'}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Sortează după:
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="flex-1 sm:flex-initial px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white min-w-[200px]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* View Toggle (Optional - Grid/List) */}
      <div className="hidden md:flex items-center gap-2">
        <button
          className="p-2 text-blue-600 bg-blue-50 rounded-lg"
          title="Grid view"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4 5h4v4H4V5zm6 0h4v4h-4V5zm6 0h4v4h-4V5zM4 11h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 17h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
          </svg>
        </button>
        <button
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          title="List view"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
