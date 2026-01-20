'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportButtonProps {
  reportType: 'sales' | 'orders' | 'products' | 'inventory' | 'operators';
  dateRange?: { start: string; end: string };
  filters?: any;
  label?: string;
}

export function ExportButton({ 
  reportType, 
  dateRange, 
  filters,
  label = 'Export' 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const response = await fetch('/api/admin/reports/export-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          format,
          dateRange,
          filters
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extensions = { excel: 'xlsx', pdf: 'pdf', csv: 'csv' };
      a.download = `${reportType}-report-${Date.now()}.${extensions[format]}`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        loading={isExporting}
      >
        <Download className="w-4 h-4 mr-2" />
        {label}
      </Button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 mr-3 text-green-600" />
                Export as Excel
              </button>
              
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-4 h-4 mr-3 text-red-600" />
                Export as PDF
              </button>
              
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-4 h-4 mr-3 text-blue-600" />
                Export as CSV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
