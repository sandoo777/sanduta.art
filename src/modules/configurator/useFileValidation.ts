export type ValidationStatus = 'ok' | 'warning' | 'error';

export interface FileValidationResult {
  resolution: ValidationStatus;
  bleed: ValidationStatus;
  dimensions: ValidationStatus;
  color: ValidationStatus;
  fonts: ValidationStatus;
}

export interface FileMeta {
  width?: number;
  height?: number;
  pages?: number;
  colorProfile?: 'CMYK' | 'RGB' | 'Unknown';
  bleedDetected?: boolean;
  fontsEmbedded?: boolean;
}

export interface ProductSpecs {
  minWidth?: number;
  minHeight?: number;
  bleedRequired?: boolean;
  aspectTolerance?: number;
}

const MAX_SIZE_BYTES = 200 * 1024 * 1024; // 200MB

function statusFromFlags(ok: boolean, warn: boolean): ValidationStatus {
  if (ok) return 'ok';
  if (warn) return 'warning';
  return 'error';
}

export function useFileValidation() {
  const checkResolution = (file: File, meta?: FileMeta): ValidationStatus => {
    if (file.size > MAX_SIZE_BYTES) return 'error';
    const { width, height } = meta || {};
    if (width && height) {
      const good = width >= 1800 && height >= 1800;
      const warn = width >= 1400 && height >= 1400;
      return statusFromFlags(good, warn);
    }
    return 'warning'; // cannot confirm => warning
  };

  const checkDimensions = (file: File, product?: ProductSpecs, meta?: FileMeta): ValidationStatus => {
    const { width, height } = meta || {};
    if (!product || !product.minWidth || !product.minHeight) {
      return width && height ? 'ok' : 'warning';
    }
    if (!width || !height) return 'warning';
    const meets = width >= product.minWidth && height >= product.minHeight;
    const tolerance = product.aspectTolerance ?? 0.05;
    const ratio = width / height;
    const expected = (product.minWidth || 1) / (product.minHeight || 1);
    const withinAspect = Math.abs(ratio - expected) <= expected * tolerance;
    return meets && withinAspect ? 'ok' : 'error';
  };

  const checkBleed = (_file: File, product?: ProductSpecs, meta?: FileMeta): ValidationStatus => {
    if (product?.bleedRequired) {
      return meta?.bleedDetected ? 'ok' : 'warning';
    }
    return 'ok';
  };

  const checkColorProfile = (_file: File, meta?: FileMeta): ValidationStatus => {
    if (!meta?.colorProfile) return 'warning';
    if (meta.colorProfile === 'CMYK') return 'ok';
    return 'warning';
  };

  const checkFontsEmbedded = (_file: File, meta?: FileMeta): ValidationStatus => {
    if (meta?.fontsEmbedded === false) return 'warning';
    return 'ok';
  };

  const validateFile = (file: File, product?: ProductSpecs, meta?: FileMeta): FileValidationResult => {
    const resolution = checkResolution(file, meta);
    const dimensions = checkDimensions(file, product, meta);
    const bleed = checkBleed(file, product, meta);
    const color = checkColorProfile(file, meta);
    const fonts = checkFontsEmbedded(file, meta);
    return { resolution, bleed, dimensions, color, fonts };
  };

  const overallStatus = (result: FileValidationResult): ValidationStatus => {
    if (Object.values(result).includes('error')) return 'error';
    if (Object.values(result).includes('warning')) return 'warning';
    return 'ok';
  };

  return {
    validateFile,
    overallStatus,
    checkResolution,
    checkBleed,
    checkDimensions,
    checkColorProfile,
    checkFontsEmbedded,
  };
}
