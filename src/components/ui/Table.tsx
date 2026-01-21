"use client";

import React, { useState, useMemo, createContext } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';
import { SkeletonTable } from './LoadingState';
import type {
  TableProps,
  Column,
  SortState,
  SortDirection,
  TableContextValue,
} from './Table.types';

// Context pentru sharing state între componente
const TableContext = createContext<TableContextValue>({});

/**
 * Table Component
 * 
 * Componentă tabel reutilizabilă cu funcționalități complete:
 * - Sortare (client-side sau server-side)
 * - Paginare integrată
 * - Loading și empty states
 * - Responsive design
 * - Dark mode support
 * - Sticky header
 * - Row selection (opțional)
 * 
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'email', label: 'Email' },
 *     { 
 *       key: 'actions', 
 *       label: 'Actions',
 *       render: (row) => <Button>Edit</Button>
 *     }
 *   ]}
 *   data={users}
 *   rowKey="id"
 *   onRowClick={(user) => console.log(user)}
 *   pagination={{
 *     currentPage: 1,
 *     totalPages: 10,
 *     pageSize: 20,
 *     onPageChange: setPage
 *   }}
 * />
 * ```
 */
export function Table<T = any>({
  columns,
  data,
  rowKey = 'id',
  onRowClick,
  rowClassName,
  
  // Sorting
  sortState: controlledSortState,
  onSortChange,
  clientSideSort = !controlledSortState,
  
  // Pagination
  pagination,
  
  // States
  loading = false,
  loadingMessage,
  loadingRows = 5,
  emptyMessage = 'Nu există date de afișat',
  emptyComponent,
  
  // Styling
  className = '',
  tableClassName = '',
  compact = false,
  striped = true,
  bordered = false,
  responsive = true,
  stickyHeader = false,
  maxHeight,
  
  // Accessibility
  ariaLabel,
  caption,
  
  // Selection (placeholder pentru viitor)
  selectedRows: _selectedRows,
  onSelectionChange: _onSelectionChange,
  multiSelect: _multiSelect,
}: TableProps<T>) {
  // Internal sort state (uncontrolled)
  const [internalSortState, setInternalSortState] = useState<SortState>({
    column: null,
    direction: null,
  });

  const sortState = controlledSortState || internalSortState;

  // Handle sort
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    let newDirection: SortDirection = 'asc';
    
    if (sortState.column === columnKey) {
      if (sortState.direction === 'asc') newDirection = 'desc';
      else if (sortState.direction === 'desc') newDirection = null;
    }

    if (onSortChange) {
      onSortChange(columnKey, newDirection);
    } else {
      setInternalSortState({ column: newDirection ? columnKey : null, direction: newDirection });
    }
  };

  // Client-side sort
  const sortedData = useMemo(() => {
    if (!clientSideSort || !sortState.column || !sortState.direction) {
      return data;
    }

    const column = columns.find((col) => col.key === sortState.column);
    if (!column) return data;

    const sorted = [...data].sort((a, b) => {
      // Use custom sort function if provided
      if (column.sortFn) {
        return column.sortFn(a, b, sortState.direction!);
      }

      // Default sort by accessor or key
      let aVal: unknown;
      let bVal: unknown;

      if (column.accessor) {
        if (typeof column.accessor === 'function') {
          aVal = column.accessor(a);
          bVal = column.accessor(b);
        } else {
          aVal = (a as Record<string, unknown>)[column.accessor];
          bVal = (b as Record<string, unknown>)[column.accessor];
        }
      } else {
        aVal = (a as Record<string, unknown>)[column.key];
        bVal = (b as Record<string, unknown>)[column.key];
      }

      // Handle null/undefined
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortState.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      // Number/Date comparison
      return sortState.direction === 'asc' 
        ? (aVal > bVal ? 1 : -1) 
        : (bVal > aVal ? 1 : -1);
    });

    return sorted;
  }, [data, sortState, columns, clientSideSort]);

  // Get row key
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row, index);
    }
    return (row as Record<string, string | number>)[rowKey] || index;
  };

  // Get cell value
  const getCellValue = (row: T, column: Column<T>, rowIndex: number): React.ReactNode => {
    if (column.render) {
      return column.render(row, rowIndex);
    }

    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        return column.accessor(row) as React.ReactNode;
      }
      return (row as Record<string, unknown>)[column.accessor] as React.ReactNode;
    }

    return (row as Record<string, unknown>)[column.key] as React.ReactNode;
  };

  // Get row class
  const getRowClassName = (row: T, index: number): string => {
    const baseClass = onRowClick 
      ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
      : '';
    const stripedClass = striped && index % 2 === 1 
      ? 'bg-gray-50 dark:bg-gray-800/50' 
      : '';
    
    const customClass = typeof rowClassName === 'function' 
      ? rowClassName(row, index) 
      : rowClassName || '';

    return `${baseClass} ${stripedClass} ${customClass}`.trim();
  };

  // Context value
  const contextValue: TableContextValue = {
    sortState,
    onSort: handleSort,
    compact,
    striped,
  };

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <SkeletonTable rows={loadingRows} />
        {loadingMessage && (
          <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
            {loadingMessage}
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    if (emptyComponent) {
      return <div className={className}>{emptyComponent}</div>;
    }
    return (
      <div className={className}>
        <EmptyState 
          title={emptyMessage}
        />
      </div>
    );
  }

  // Table styles
  const containerClass = `
    ${responsive ? 'overflow-x-auto' : ''}
    ${stickyHeader && maxHeight ? 'overflow-y-auto' : ''}
    ${bordered ? 'border border-gray-200 dark:border-gray-700 rounded-lg' : ''}
    ${className}
  `.trim();

  const tableClass = `
    min-w-full divide-y divide-gray-200 dark:divide-gray-700
    ${tableClassName}
  `.trim();

  const containerStyle = maxHeight && stickyHeader ? { maxHeight } : undefined;

  return (
    <TableContext.Provider value={contextValue}>
      <div className={containerClass} style={containerStyle}>
        <table 
          className={tableClass}
          aria-label={ariaLabel}
        >
          {caption && <caption className="sr-only">{caption}</caption>}
          
          {/* Header */}
          <thead className={`
            bg-gray-50 dark:bg-gray-800
            ${stickyHeader ? 'sticky top-0 z-10' : ''}
          `}>
            <tr>
              {columns.map((column) => (
                <TableHeader
                  key={column.key}
                  column={column}
                  sortState={sortState}
                  onSort={handleSort}
                  compact={compact}
                />
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={getRowClassName(row, rowIndex)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    column={column}
                    row={row}
                    rowIndex={rowIndex}
                    value={getCellValue(row, column, rowIndex)}
                    compact={compact}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
          />
        </div>
      )}
    </TableContext.Provider>
  );
}

/**
 * Table Header Cell Component
 */
interface TableHeaderProps<T = unknown> {
  column: Column<T>;
  sortState: SortState;
  onSort: (columnKey: string) => void;
  compact?: boolean;
}

function TableHeader<T>({ column, sortState, onSort, compact }: TableHeaderProps<T>) {
  const isSorted = sortState.column === column.key;
  const sortDirection = isSorted ? sortState.direction : null;

  const handleClick = () => {
    if (column.sortable) {
      onSort(column.key);
    }
  };

  const headerClass = `
    px-${compact ? '3' : '6'} py-${compact ? '2' : '3'}
    text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
    ${column.sortable ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''}
    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
    ${column.className || ''}
  `.trim();

  const headerStyle = column.width ? { width: column.width } : undefined;

  return (
    <th
      onClick={handleClick}
      className={headerClass}
      style={headerStyle}
      scope="col"
    >
      <div className="flex items-center gap-2">
        <span>{column.label}</span>
        {column.sortable && (
          <span className="inline-flex">
            {sortDirection === 'asc' && <ChevronUp className="w-4 h-4" />}
            {sortDirection === 'desc' && <ChevronDown className="w-4 h-4" />}
            {!sortDirection && <ChevronsUpDown className="w-4 h-4 opacity-40" />}
          </span>
        )}
      </div>
    </th>
  );
}

/**
 * Table Cell Component
 */
interface TableCellProps<T = unknown> {
  column: Column<T>;
  row: T;
  rowIndex: number;
  value: React.ReactNode;
  compact?: boolean;
}

function TableCell<T>({ column, value, compact }: TableCellProps<T>) {
  const cellClass = `
    px-${compact ? '3' : '6'} py-${compact ? '2' : '4'}
    text-sm text-gray-900 dark:text-gray-100
    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
    ${column.cellClassName || ''}
  `.trim();

  const cellStyle = column.width ? { width: column.width } : undefined;

  return (
    <td className={cellClass} style={cellStyle}>
      {value}
    </td>
  );
}

// Export types
export type { TableProps, Column, SortState, SortDirection } from './Table.types';
