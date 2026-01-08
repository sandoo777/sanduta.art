import type {
  ConfiguratorPrintMethod,
  ConfiguratorProduct,
  ConfiguratorSelections,
} from '@/modules/configurator/types';
import { convertToMillimeters } from '@/lib/configurator/dimensions';

export interface PrintMethodFilterResult {
  printMethods: ConfiguratorPrintMethod[];
  selectedPrintMethod?: ConfiguratorPrintMethod;
  issues: string[];
}

function matchesMaterial(
  method: ConfiguratorPrintMethod,
  selections: ConfiguratorSelections
) {
  if (!method.materialIds?.length) {
    return true;
  }

  if (!selections.materialId) {
    return false;
  }

  return method.materialIds.includes(selections.materialId);
}

function fitsWithinMachine(
  method: ConfiguratorPrintMethod,
  selections: ConfiguratorSelections
) {
  if (!method.maxWidth && !method.maxHeight) {
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

  if (method.maxWidth && widthMm > method.maxWidth) {
    return false;
  }
  if (method.maxHeight && heightMm > method.maxHeight) {
    return false;
  }

  return true;
}

export function filterPrintMethodsByProduct(
  product: ConfiguratorProduct,
  selections: ConfiguratorSelections
): PrintMethodFilterResult {
  const issues: string[] = [];

  const printMethods = product.printMethods.filter(
    (method) => matchesMaterial(method, selections) && fitsWithinMachine(method, selections)
  );

  const selectedPrintMethod = printMethods.find(
    (method) => method.id === selections.printMethodId
  );

  if (selections.printMethodId && !selectedPrintMethod) {
    issues.push('Metoda de tipărire selectată nu poate fi utilizată cu materialul sau dimensiunile curente');
  }

  return {
    printMethods,
    selectedPrintMethod,
    issues,
  };
}
