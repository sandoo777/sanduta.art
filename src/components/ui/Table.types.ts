/**
 * Table Component Types
 * Tipuri pentru componenta Table reutilizabilă
 */

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T = any> {
  /** Identificator unic pentru coloană */
  key: string;
  /** Label afișat în header */
  label: string;
  /** Dacă coloana poate fi sortată */
  sortable?: boolean;
  /** Funcție custom pentru sortare */
  sortFn?: (a: T, b: T, direction: 'asc' | 'desc') => number;
  /** Funcție custom pentru rendering celulă */
  render?: (row: T, rowIndex: number) => React.ReactNode;
  /** Accessor pentru valoarea din rând (poate fi string sau funcție) */
  accessor?: string | ((row: T) => unknown);
  /** Lățime coloană (CSS width value) */
  width?: string;
  /** Alinierea conținutului */
  align?: 'left' | 'center' | 'right';
  /** Class CSS custom pentru coloană */
  className?: string;
  /** Class CSS custom pentru celule */
  cellClassName?: string;
}

export interface PaginationOptions {
  /** Număr pagină curentă (1-based) */
  currentPage: number;
  /** Total pagini */
  totalPages: number;
  /** Total înregistrări */
  totalCount?: number;
  /** Înregistrări per pagină */
  pageSize: number;
  /** Callback la schimbarea paginii */
  onPageChange: (page: number) => void;
  /** Opțiuni pentru mărimea paginii */
  pageSizeOptions?: number[];
  /** Callback la schimbarea mărimii paginii */
  onPageSizeChange?: (pageSize: number) => void;
}

export interface SortState {
  /** Coloana curent sortată */
  column: string | null;
  /** Direcția sortării */
  direction: SortDirection;
}

export interface TableProps<T = any> {
  /** Coloanele tabelului */
  columns: Column<T>[];
  /** Datele pentru rânduri */
  data: T[];
  /** Cheie unică pentru fiecare rând (din obiectul de date) */
  rowKey?: string | ((row: T, index: number) => string | number);
  /** Callback la click pe rând */
  onRowClick?: (row: T, index: number) => void;
  /** Class CSS pentru rânduri clickabile */
  rowClassName?: string | ((row: T, index: number) => string);
  
  // Sorting
  /** State sortare (controlled) */
  sortState?: SortState;
  /** Callback la schimbarea sortării */
  onSortChange?: (column: string, direction: SortDirection) => void;
  /** Sortare pe client (default: true dacă sortState nu e furnizat) */
  clientSideSort?: boolean;
  
  // Pagination
  /** Configurare paginare */
  pagination?: PaginationOptions;
  
  // States
  /** Indicator de încărcare */
  loading?: boolean;
  /** Mesaj custom pentru loading */
  loadingMessage?: string;
  /** Număr de rânduri skeleton în loading */
  loadingRows?: number;
  /** Mesaj când nu sunt date */
  emptyMessage?: string;
  /** Component custom pentru empty state */
  emptyComponent?: React.ReactNode;
  
  // Styling
  /** Class CSS custom pentru container */
  className?: string;
  /** Class CSS custom pentru tabel */
  tableClassName?: string;
  /** Afișare în stil compact */
  compact?: boolean;
  /** Afișare striped rows */
  striped?: boolean;
  /** Afișare bordered */
  bordered?: boolean;
  /** Responsive behavior */
  responsive?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Înălțime maximă (pentru sticky header) */
  maxHeight?: string;
  
  // Accessibility
  /** ARIA label pentru tabel */
  ariaLabel?: string;
  /** Caption pentru tabel */
  caption?: string;
  
  // Selection (optional, pentru viitor)
  /** Array cu chei rânduri selectate */
  selectedRows?: (string | number)[];
  /** Callback la schimbarea selecției */
  onSelectionChange?: (selectedRows: (string | number)[]) => void;
  /** Permite selecție multiplă */
  multiSelect?: boolean;
}

export interface TableContextValue {
  sortState?: SortState;
  onSort?: (column: string) => void;
  compact?: boolean;
  striped?: boolean;
}
