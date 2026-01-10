/**
 * Export Engine Module
 * 
 * Handles data export in multiple formats:
 * - CSV (Comma-Separated Values)
 * - XLSX (Excel Spreadsheet)
 * - PDF (Formatted Reports)
 * 
 * Supports all report types:
 * - Sales, Orders, Production, Costs, Profitability
 * - Machines, Operators, Customers
 */

'use client';

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export type ExportType =
  | 'sales'
  | 'orders'
  | 'production'
  | 'costs'
  | 'profitability'
  | 'machines'
  | 'operators'
  | 'customers';

export interface ExportOptions {
  type: ExportType;
  format: ExportFormat;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters?: Record<string, unknown>;
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  url?: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useExports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  /**
   * Generate filename based on export type and date
   */
  const generateFilename = (type: ExportType, format: ExportFormat): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${type}-report-${timestamp}.${format}`;
  };

  /**
   * Download file from blob
   */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Main export function
   */
  const exportReport = useCallback(async (options: ExportOptions): Promise<ExportResult> => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      const filename = options.filename || generateFilename(options.type, options.format);

      logger.info('Exports', 'Starting export', {
        type: options.type,
        format: options.format,
        filename,
      });

      // Build request body
      const body = {
        type: options.type,
        format: options.format,
        dateRange: {
          from: options.dateRange.from.toISOString(),
          to: options.dateRange.to.toISOString(),
        },
        filters: options.filters,
      };

      setProgress(25);

      // Call API
      const response = await fetch('/api/admin/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      setProgress(50);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get blob
      const blob = await response.blob();
      
      setProgress(75);

      // Download file
      downloadBlob(blob, filename);

      setProgress(100);

      logger.info('Exports', 'Export completed successfully', { filename });

      return {
        success: true,
        filename,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      logger.error('Exports', 'Export failed', { error });
      
      return {
        success: false,
        filename: '',
        error: error.message,
      };
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  /**
   * Export sales report
   */
  const exportSales = useCallback(
    (format: ExportFormat, dateRange: { from: Date; to: Date }, filters?: Record<string, unknown>) => {
      return exportReport({
        type: 'sales',
        format,
        dateRange,
        filters,
      });
    },
    [exportReport]
  );

  /**
   * Export orders report
   */
  const exportOrders = useCallback(
    (format: ExportFormat, dateRange: { from: Date; to: Date }, filters?: Record<string, unknown>) => {
      return exportReport({
        type: 'orders',
        format,
        dateRange,
        filters,
      });
    },
    [exportReport]
  );

  /**
   * Export production report
   */
  const exportProduction = useCallback(
    (format: ExportFormat, dateRange: { from: Date; to: Date }, filters?: Record<string, unknown>) => {
      return exportReport({
        type: 'production',
        format,
        dateRange,
        filters,
      });
    },
    [exportReport]
  );

  /**
   * Export costs report
   */
  const exportCosts = useCallback(
    (format: ExportFormat, dateRange: { from: Date; to: Date }, filters?: Record<string, unknown>) => {
      return exportReport({
        type: 'costs',
        format,
        dateRange,
        filters,
      });
    },
    [exportReport]
  );

  /**
   * Export profitability report
   */
  const exportProfitability = useCallback(
    (format: ExportFormat, dateRange: { from: Date; to: Date }, filters?: Record<string, unknown>) => {
      return exportReport({
        type: 'profitability',
        format,
        dateRange,
        filters,
      });
    },
    [exportReport]
  );

  /**
   * Export machines report
   */
  const exportMachines = useCallback(
    (format: ExportFormat, dateRange: { from: Date; to: Date }, filters?: Record<string, unknown>) => {
      return exportReport({
        type: 'machines',
        format,
        dateRange,
        filters,
      });
    },
    [exportReport]
  );

  /**
   * Export operators report
   */
  const exportOperators = useCallback(
    (format: ExportFormat, dateRange: { from: Date; to: Date }, filters?: Record<string, unknown>) => {
      return exportReport({
        type: 'operators',
        format,
        dateRange,
        filters,
      });
    },
    [exportReport]
  );

  /**
   * Export customers report
   */
  const exportCustomers = useCallback(
    (format: ExportFormat, dateRange: { from: Date; to: Date }, filters?: Record<string, unknown>) => {
      return exportReport({
        type: 'customers',
        format,
        dateRange,
        filters,
      });
    },
    [exportReport]
  );

  return {
    loading,
    error,
    progress,
    exportReport,
    exportSales,
    exportOrders,
    exportProduction,
    exportCosts,
    exportProfitability,
    exportMachines,
    exportOperators,
    exportCustomers,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CSV UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: Record<string, unknown>[], headers?: string[]): string {
  if (data.length === 0) return '';

  const columnHeaders = headers || Object.keys(data[0]);
  const rows = data.map((row) =>
    columnHeaders.map((header) => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma or quote
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  return [columnHeaders.join(','), ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(data: Record<string, unknown>[], filename: string, headers?: string[]) {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
