export interface ProjectValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProjectData {
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  bleed: number;
  dpi?: number;
  layers?: any[];
  finalFileUrl?: string;
  previewImage?: string;
}

/**
 * Validates a project before adding to cart
 */
export function validateProject(
  project: ProjectData,
  requiredDimensions?: { width: number; height: number; unit: string }
): ProjectValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate dimensions
  if (!project.dimensions) {
    errors.push('Proiectul nu are dimensiuni definite');
  } else if (requiredDimensions) {
    const { width, height, unit } = project.dimensions;
    const { width: reqWidth, height: reqHeight, unit: reqUnit } = requiredDimensions;

    // Convert to same unit for comparison
    const normalizedWidth = normalizeToMm(width, unit);
    const normalizedHeight = normalizeToMm(height, unit);
    const normalizedReqWidth = normalizeToMm(reqWidth, reqUnit);
    const normalizedReqHeight = normalizeToMm(reqHeight, reqUnit);

    const tolerance = 1; // 1mm tolerance

    if (Math.abs(normalizedWidth - normalizedReqWidth) > tolerance) {
      errors.push(
        `Lățimea proiectului (${width}${unit}) nu corespunde cu dimensiunea cerută (${reqWidth}${reqUnit})`
      );
    }

    if (Math.abs(normalizedHeight - normalizedReqHeight) > tolerance) {
      errors.push(
        `Înălțimea proiectului (${height}${unit}) nu corespunde cu dimensiunea cerută (${reqHeight}${reqUnit})`
      );
    }
  }

  // Validate bleed
  if (project.bleed === undefined || project.bleed < 0) {
    warnings.push('Bleed-ul nu este definit corect');
  } else if (project.bleed < 3) {
    warnings.push('Bleed-ul recomandat este de minim 3mm');
  }

  // Validate DPI/resolution
  if (project.dpi) {
    if (project.dpi < 150) {
      errors.push(`Rezoluția (${project.dpi} DPI) este prea mică. Minim 150 DPI`);
    } else if (project.dpi < 300) {
      warnings.push(`Rezoluția (${project.dpi} DPI) este sub valoarea recomandată de 300 DPI`);
    }
  }

  // Validate final file
  if (!project.finalFileUrl) {
    errors.push('Proiectul nu are fișier final generat');
  }

  // Validate preview
  if (!project.previewImage) {
    warnings.push('Proiectul nu are imagine de preview');
  }

  // Validate layers
  if (!project.layers || project.layers.length === 0) {
    warnings.push('Proiectul nu conține layere');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Normalize dimensions to millimeters
 */
function normalizeToMm(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'mm':
      return value;
    case 'cm':
      return value * 10;
    case 'm':
      return value * 1000;
    case 'in':
      return value * 25.4;
    default:
      return value;
  }
}

/**
 * Check if project needs revalidation (dimensions changed)
 */
export function needsRevalidation(
  project: ProjectData,
  newDimensions: { width: number; height: number; unit: string }
): boolean {
  if (!project.dimensions) {
    return true;
  }

  const oldNormalized = {
    width: normalizeToMm(project.dimensions.width, project.dimensions.unit),
    height: normalizeToMm(project.dimensions.height, project.dimensions.unit),
  };

  const newNormalized = {
    width: normalizeToMm(newDimensions.width, newDimensions.unit),
    height: normalizeToMm(newDimensions.height, newDimensions.unit),
  };

  const tolerance = 1; // 1mm

  return (
    Math.abs(oldNormalized.width - newNormalized.width) > tolerance ||
    Math.abs(oldNormalized.height - newNormalized.height) > tolerance
  );
}
