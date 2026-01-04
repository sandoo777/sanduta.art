/**
 * Tipuri și interfețe pentru sistemul de export
 */

export type ExportFormat = 'png' | 'pdf' | 'svg' | 'print-ready';

export interface ExportOptions {
  format: ExportFormat;
  dpi: 72 | 150 | 300;
  background: 'transparent' | 'white';
  bleed: 0 | 3 | 5; // mm
  cropMarks: boolean;
  cmyk: boolean;
  flattenText: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export interface ExportValidation {
  valid: boolean;
  warnings: ExportWarning[];
  errors: ExportError[];
}

export interface ExportWarning {
  type: 'low-resolution' | 'no-bleed' | 'rgb-colors' | 'missing-fonts' | 'missing-elements';
  message: string;
  elementId?: string;
}

export interface ExportError {
  type: 'invalid-canvas' | 'missing-elements' | 'conversion-failed';
  message: string;
}

export interface BleedSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CropMarks {
  show: boolean;
  length: number; // mm
  offset: number; // mm
  strokeWidth: number; // px
}

export interface PrintReadySettings {
  bleed: BleedSettings;
  cropMarks: CropMarks;
  cmyk: boolean;
  flattenTransparency: boolean;
  embedFonts: boolean;
  pdfStandard: 'PDF/X-1a' | 'PDF/X-4';
  resolution: number; // DPI
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png',
  dpi: 300,
  background: 'white',
  bleed: 0,
  cropMarks: false,
  cmyk: false,
  flattenText: false,
  quality: 'high',
};

export const DEFAULT_PRINT_READY_SETTINGS: PrintReadySettings = {
  bleed: {
    top: 3,
    right: 3,
    bottom: 3,
    left: 3,
  },
  cropMarks: {
    show: true,
    length: 10,
    offset: 5,
    strokeWidth: 0.5,
  },
  cmyk: true,
  flattenTransparency: true,
  embedFonts: true,
  pdfStandard: 'PDF/X-4',
  resolution: 300,
};
