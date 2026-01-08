import type {
  ConfiguratorMaterial,
  ConfiguratorProduct,
  ConfiguratorSelections,
} from '@/modules/configurator/types';
import { convertToMillimeters } from '@/lib/configurator/dimensions';

export interface MaterialFilterResult {
  materials: Array<ConfiguratorMaterial & { effectiveCost: number }>;
  selectedMaterial?: ConfiguratorMaterial & { effectiveCost: number };
  issues: string[];
}

function respectsMaterialConstraints(
  material: ConfiguratorMaterial,
  selections: ConfiguratorSelections
) {
  if (!material.constraints) {
    return true;
  }

  if (!selections.dimension) {
    return true;
  }

  const widthMm = convertToMillimeters(
    selections.dimension.width,
    selections.dimension.unit ?? 'mm'
  );
  const heightMm = convertToMillimeters(
    selections.dimension.height,
    selections.dimension.unit ?? 'mm'
  );

  if (widthMm == null || heightMm == null) {
    return true;
  }

  const constraintUnit = material.constraints.unit ?? 'mm';
  const maxWidthMm = convertToMillimeters(material.constraints.maxWidth, constraintUnit);
  const maxHeightMm = convertToMillimeters(material.constraints.maxHeight, constraintUnit);
  const minWidthMm = convertToMillimeters(material.constraints.minWidth, constraintUnit);
  const minHeightMm = convertToMillimeters(material.constraints.minHeight, constraintUnit);

  if (maxWidthMm != null && widthMm > maxWidthMm) {
    return false;
  }
  if (maxHeightMm != null && heightMm > maxHeightMm) {
    return false;
  }
  if (minWidthMm != null && widthMm < minWidthMm) {
    return false;
  }
  if (minHeightMm != null && heightMm < minHeightMm) {
    return false;
  }

  return true;
}

export function filterMaterialsByProduct(
  product: ConfiguratorProduct,
  selections: ConfiguratorSelections
): MaterialFilterResult {
  const issues: string[] = [];
  const computedMaterials = product.materials
    .filter((material) => respectsMaterialConstraints(material, selections))
    .map((material) => ({
      ...material,
      effectiveCost: Number(
        (material.costPerUnit + (material.priceModifier ?? 0)).toFixed(2)
      ),
    }));

  const selectedMaterial = computedMaterials.find(
    (material) => material.id === selections.materialId
  );

  if (selections.materialId && !selectedMaterial) {
    issues.push('Materialul selectat nu este compatibil cu configurația curentă');
  }

  return {
    materials: computedMaterials,
    selectedMaterial,
    issues,
  };
}
