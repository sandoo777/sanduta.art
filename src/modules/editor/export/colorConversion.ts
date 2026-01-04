/**
 * Module pentru conversie culori RGB → CMYK
 * Folosit pentru export Print-Ready
 */

export interface CMYK {
  c: number; // Cyan (0-100)
  m: number; // Magenta (0-100)
  y: number; // Yellow (0-100)
  k: number; // Key/Black (0-100)
}

export interface RGB {
  r: number; // Red (0-255)
  g: number; // Green (0-255)
  b: number; // Blue (0-255)
}

/**
 * Convertește RGB în CMYK
 * Formula standard pentru print
 */
export function rgbToCmyk(r: number, g: number, b: number): CMYK {
  // Normalize RGB to 0-1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Calculate K (black)
  const k = 1 - Math.max(rNorm, gNorm, bNorm);

  // Edge case: pure black
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  // Calculate CMY
  const c = ((1 - rNorm - k) / (1 - k)) * 100;
  const m = ((1 - gNorm - k) / (1 - k)) * 100;
  const y = ((1 - bNorm - k) / (1 - k)) * 100;

  return {
    c: cmykClamp(c),
    m: cmykClamp(m),
    y: cmykClamp(y),
    k: cmykClamp(k * 100),
  };
}

/**
 * Convertește HEX în CMYK
 */
export function hexToCmyk(hex: string): CMYK {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return rgbToCmyk(r, g, b);
}

/**
 * Clamp CMYK values între 0-100
 */
export function cmykClamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Convertește CMYK înapoi în RGB (aproximare)
 * Folosit pentru preview
 */
export function cmykToRgb(c: number, m: number, y: number, k: number): RGB {
  // Normalize CMYK from 0-100 to 0-1
  const cNorm = c / 100;
  const mNorm = m / 100;
  const yNorm = y / 100;
  const kNorm = k / 100;

  // Calculate RGB
  const r = 255 * (1 - cNorm) * (1 - kNorm);
  const g = 255 * (1 - mNorm) * (1 - kNorm);
  const b = 255 * (1 - yNorm) * (1 - kNorm);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
}

/**
 * Convertește CMYK în HEX
 */
export function cmykToHex(c: number, m: number, y: number, k: number): string {
  const rgb = cmykToRgb(c, m, y, k);
  return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
}

/**
 * Verifică dacă o culoare este "print-safe" (CMYK total < 280%)
 * Pentru a evita prea multă cerneală
 */
export function isPrintSafe(cmyk: CMYK): boolean {
  const total = cmyk.c + cmyk.m + cmyk.y + cmyk.k;
  return total <= 280;
}

/**
 * Ajustează CMYK pentru a fi print-safe
 */
export function makePrintSafe(cmyk: CMYK): CMYK {
  const total = cmyk.c + cmyk.m + cmyk.y + cmyk.k;
  
  if (total <= 280) {
    return cmyk;
  }

  // Scale down proportionally
  const scale = 280 / total;
  
  return {
    c: cmykClamp(cmyk.c * scale),
    m: cmykClamp(cmyk.m * scale),
    y: cmykClamp(cmyk.y * scale),
    k: cmykClamp(cmyk.k * scale),
  };
}
