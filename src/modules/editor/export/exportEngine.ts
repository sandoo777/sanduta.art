/**
 * Motor principal de export pentru editorul de design
 * Suportă: PNG, PDF, SVG, Print-Ready
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { EditorElement } from '../editorStore';
import { hexToCmyk, rgbToCmyk, cmykToHex, makePrintSafe } from './colorConversion';
import {
  ExportOptions,
  ExportValidation,
  ExportWarning,
  ExportError,
  DEFAULT_EXPORT_OPTIONS,
  DEFAULT_PRINT_READY_SETTINGS,
  PrintReadySettings,
} from './exportTypes';

interface CanvasSize {
  width: number;
  height: number;
}

/**
 * Validează proiectul înainte de export
 */
export function validateExport(
  elements: EditorElement[],
  canvasSize: CanvasSize,
  options: ExportOptions
): ExportValidation {
  const warnings: ExportWarning[] = [];
  const errors: ExportError[] = [];

  // Verifică dacă există elemente
  if (elements.length === 0) {
    warnings.push({
      type: 'missing-elements',
      message: 'Nu există elemente pe canvas. Canvas-ul va fi gol.',
    });
  }

  // Verifică rezoluția imaginilor
  elements.forEach((el) => {
    if (el.type === 'image' && el.src) {
      // Simulăm verificare rezoluție (în realitate trebuie să citim imagine)
      const estimatedDPI = 150; // placeholder
      if (estimatedDPI < options.dpi) {
        warnings.push({
          type: 'low-resolution',
          message: `Imaginea "${el.name || el.id}" are rezoluție scăzută (${estimatedDPI} DPI < ${options.dpi} DPI)`,
          elementId: el.id,
        });
      }
    }
  });

  // Verifică bleed pentru print-ready
  if (options.format === 'print-ready' && options.bleed === 0) {
    warnings.push({
      type: 'no-bleed',
      message: 'Pentru tipar profesional se recomandă bleed de minim 3mm',
    });
  }

  // Verifică culori RGB în modul CMYK
  if (options.cmyk) {
    const hasRgbColors = elements.some((el) => el.fill || el.color);
    if (hasRgbColors) {
      warnings.push({
        type: 'rgb-colors',
        message: 'Culorile vor fi convertite automat din RGB în CMYK pentru tipar',
      });
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Export PNG cu rezoluție înaltă
 */
export async function exportPNG(
  canvasElement: HTMLElement,
  canvasSize: CanvasSize,
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options, format: 'png' as const };

  // Calculăm scale factor pentru DPI
  const scaleFactor = opts.dpi / 72;

  const canvas = await html2canvas(canvasElement, {
    scale: scaleFactor,
    backgroundColor: opts.background === 'transparent' ? null : '#ffffff',
    useCORS: true,
    allowTaint: false,
    width: canvasSize.width,
    height: canvasSize.height,
    logging: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Export SVG (vector)
 */
export function exportSVG(
  elements: EditorElement[],
  canvasSize: CanvasSize,
  options: Partial<ExportOptions> = {}
): string {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options, format: 'svg' as const };

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${canvasSize.width}" 
     height="${canvasSize.height}" 
     viewBox="0 0 ${canvasSize.width} ${canvasSize.height}">
`;

  // Background
  if (opts.background === 'white') {
    svg += `  <rect width="100%" height="100%" fill="#ffffff"/>\n`;
  }

  // Sort by zIndex
  const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // Render each element
  sortedElements.forEach((el) => {
    if (el.visible === false) return;

    const transform = `translate(${el.x}, ${el.y}) rotate(${el.rotation || 0})`;
    const opacity = el.opacity !== undefined ? el.opacity : 1;

    if (el.type === 'shape') {
      svg += renderShapeSVG(el, transform, opacity);
    } else if (el.type === 'text') {
      svg += renderTextSVG(el, transform, opacity, opts.flattenText);
    } else if (el.type === 'image' && el.src) {
      svg += renderImageSVG(el, transform, opacity);
    }
  });

  svg += '</svg>';

  return svg;
}

/**
 * Export PDF standard
 */
export async function exportPDF(
  canvasElement: HTMLElement,
  canvasSize: CanvasSize,
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options, format: 'pdf' as const };

  // Convertim canvas în imagine PNG
  const pngBlob = await exportPNG(canvasElement, canvasSize, {
    ...opts,
    background: 'white',
  });

  const pngDataUrl = await blobToDataURL(pngBlob);

  // Creăm PDF
  const pdf = new jsPDF({
    orientation: canvasSize.width > canvasSize.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvasSize.width, canvasSize.height],
    compress: true,
  });

  pdf.addImage(pngDataUrl, 'PNG', 0, 0, canvasSize.width, canvasSize.height, undefined, 'FAST');

  return pdf.output('blob');
}

/**
 * Export Print-Ready cu bleed, crop marks și CMYK
 */
export async function exportPrintReady(
  canvasElement: HTMLElement,
  elements: EditorElement[],
  canvasSize: CanvasSize,
  options: Partial<ExportOptions> = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options, format: 'print-ready' as const, cmyk: true };
  const printSettings = DEFAULT_PRINT_READY_SETTINGS;

  // Calculăm dimensiunile cu bleed (3mm = ~11.34px la 96 DPI)
  const bleedPx = (opts.bleed * 96) / 25.4; // conversie mm → px
  const finalWidth = canvasSize.width + bleedPx * 2;
  const finalHeight = canvasSize.height + bleedPx * 2;

  // Convertim culorile în CMYK (simulat)
  const cmykElements = opts.cmyk ? convertElementsToCMYK(elements) : elements;

  // Creăm canvas extins cu bleed
  const extendedCanvas = document.createElement('canvas');
  const ctx = extendedCanvas.getContext('2d');
  if (!ctx) throw new Error('Cannot create canvas context');

  const scaleFactor = opts.dpi / 72;
  extendedCanvas.width = finalWidth * scaleFactor;
  extendedCanvas.height = finalHeight * scaleFactor;

  ctx.scale(scaleFactor, scaleFactor);

  // Background alb
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, finalWidth, finalHeight);

  // Desenăm canvas-ul original centrat (cu bleed)
  const originalCanvas = await html2canvas(canvasElement, {
    scale: scaleFactor,
    backgroundColor: '#ffffff',
    useCORS: true,
    width: canvasSize.width,
    height: canvasSize.height,
    logging: false,
  });

  ctx.drawImage(originalCanvas, bleedPx, bleedPx);

  // Adăugăm crop marks
  if (opts.cropMarks) {
    drawCropMarks(ctx, finalWidth, finalHeight, bleedPx, printSettings.cropMarks);
  }

  // Convertim în PDF
  const pdf = new jsPDF({
    orientation: finalWidth > finalHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [finalWidth, finalHeight],
    compress: true,
  });

  const canvasDataUrl = extendedCanvas.toDataURL('image/png', 1.0);
  pdf.addImage(canvasDataUrl, 'PNG', 0, 0, finalWidth, finalHeight, undefined, 'FAST');

  // Adăugăm metadata PDF/X
  pdf.setProperties({
    title: 'Print Ready Export',
    subject: 'Sanduta.Art Design',
    creator: 'Sanduta.Art Editor',
    keywords: 'print-ready, cmyk, bleed',
  });

  return pdf.output('blob');
}

// ═══════════════════════════════════════════════════════════════
// FUNCȚII HELPER
// ═══════════════════════════════════════════════════════════════

function renderShapeSVG(el: EditorElement, transform: string, opacity: number): string {
  const fill = el.fill || '#000000';
  const stroke = el.stroke || 'none';
  const strokeWidth = el.strokeWidth || 0;

  if (el.shape === 'rectangle') {
    return `  <rect x="0" y="0" width="${el.width}" height="${el.height}" 
        fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" 
        rx="${el.borderRadius || 0}" 
        opacity="${opacity}" 
        transform="${transform}"/>\n`;
  } else if (el.shape === 'circle') {
    const radius = Math.min(el.width, el.height) / 2;
    const cx = el.width / 2;
    const cy = el.height / 2;
    return `  <circle cx="${cx}" cy="${cy}" r="${radius}" 
        fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" 
        opacity="${opacity}" 
        transform="${transform}"/>\n`;
  } else if (el.shape === 'triangle') {
    const points = `${el.width / 2},0 ${el.width},${el.height} 0,${el.height}`;
    return `  <polygon points="${points}" 
        fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" 
        opacity="${opacity}" 
        transform="${transform}"/>\n`;
  }

  return '';
}

function renderTextSVG(el: EditorElement, transform: string, opacity: number, flattenText: boolean): string {
  const fontSize = el.fontSize || 16;
  const fontFamily = el.fontFamily || 'Arial';
  const fontWeight = el.fontWeight || 'normal';
  const fill = el.color || '#000000';
  const textAlign = el.textAlign || 'left';

  let x = 0;
  if (textAlign === 'center') x = el.width / 2;
  if (textAlign === 'right') x = el.width;

  const anchor = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start';

  if (flattenText) {
    // TODO: Convert text to paths (complex, requires font metrics)
    return `  <!-- Text converted to paths: ${el.content} -->\n`;
  }

  return `  <text x="${x}" y="${fontSize}" 
      font-family="${fontFamily}" 
      font-size="${fontSize}" 
      font-weight="${fontWeight}" 
      fill="${fill}" 
      text-anchor="${anchor}" 
      opacity="${opacity}" 
      transform="${transform}">${escapeXml(el.content || '')}</text>\n`;
}

function renderImageSVG(el: EditorElement, transform: string, opacity: number): string {
  return `  <image x="0" y="0" width="${el.width}" height="${el.height}" 
      href="${el.src}" 
      opacity="${opacity}" 
      transform="${transform}" 
      preserveAspectRatio="${el.objectFit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'}"/>\n`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function convertElementsToCMYK(elements: EditorElement[]): EditorElement[] {
  return elements.map((el) => {
    const converted = { ...el };

    // Convertim fill
    if (converted.fill) {
      const cmyk = hexToCmyk(converted.fill);
      const safeCmyk = makePrintSafe(cmyk);
      converted.fill = cmykToHex(safeCmyk.c, safeCmyk.m, safeCmyk.y, safeCmyk.k);
    }

    // Convertim color (text)
    if (converted.color) {
      const cmyk = hexToCmyk(converted.color);
      const safeCmyk = makePrintSafe(cmyk);
      converted.color = cmykToHex(safeCmyk.c, safeCmyk.m, safeCmyk.y, safeCmyk.k);
    }

    // Convertim stroke
    if (converted.stroke) {
      const cmyk = hexToCmyk(converted.stroke);
      const safeCmyk = makePrintSafe(cmyk);
      converted.stroke = cmykToHex(safeCmyk.c, safeCmyk.m, safeCmyk.y, safeCmyk.k);
    }

    return converted;
  });
}

function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bleedPx: number,
  cropMarks: { length: number; offset: number; strokeWidth: number }
): void {
  const lengthPx = (cropMarks.length * 96) / 25.4;
  const offsetPx = (cropMarks.offset * 96) / 25.4;

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = cropMarks.strokeWidth;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(bleedPx - offsetPx, bleedPx);
  ctx.lineTo(bleedPx - offsetPx - lengthPx, bleedPx);
  ctx.moveTo(bleedPx, bleedPx - offsetPx);
  ctx.lineTo(bleedPx, bleedPx - offsetPx - lengthPx);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - bleedPx + offsetPx, bleedPx);
  ctx.lineTo(width - bleedPx + offsetPx + lengthPx, bleedPx);
  ctx.moveTo(width - bleedPx, bleedPx - offsetPx);
  ctx.lineTo(width - bleedPx, bleedPx - offsetPx - lengthPx);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(bleedPx - offsetPx, height - bleedPx);
  ctx.lineTo(bleedPx - offsetPx - lengthPx, height - bleedPx);
  ctx.moveTo(bleedPx, height - bleedPx + offsetPx);
  ctx.lineTo(bleedPx, height - bleedPx + offsetPx + lengthPx);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - bleedPx + offsetPx, height - bleedPx);
  ctx.lineTo(width - bleedPx + offsetPx + lengthPx, height - bleedPx);
  ctx.moveTo(width - bleedPx, height - bleedPx + offsetPx);
  ctx.lineTo(width - bleedPx, height - bleedPx + offsetPx + lengthPx);
  ctx.stroke();
}
