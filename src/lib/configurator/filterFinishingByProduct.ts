import type {
  ConfiguratorFinishing,
  ConfiguratorProduct,
  ConfiguratorSelections,
} from '@/modules/configurator/types';

export interface FinishingFilterResult {
  finishing: ConfiguratorFinishing[];
  selectedFinishing: ConfiguratorFinishing[];
  issues: string[];
}

function matchesCompatibility(
  finishing: ConfiguratorFinishing,
  selections: ConfiguratorSelections
) {
  const materialAllowed = !finishing.compatibleMaterialIds?.length || !selections.materialId
    ? true
    : finishing.compatibleMaterialIds.includes(selections.materialId);

  const printMethodAllowed = !finishing.compatiblePrintMethodIds?.length || !selections.printMethodId
    ? true
    : finishing.compatiblePrintMethodIds.includes(selections.printMethodId);

  return materialAllowed && printMethodAllowed;
}

export function filterFinishingByProduct(
  product: ConfiguratorProduct,
  selections: ConfiguratorSelections
): FinishingFilterResult {
  const issues: string[] = [];

  const finishing = product.finishing.filter((item) => matchesCompatibility(item, selections));
  const selectedFinishing = finishing.filter((item) => selections.finishingIds.includes(item.id));

  const incompatibleSelection = selections.finishingIds.find(
    (finishingId) => !finishing.some((item) => item.id === finishingId)
  );

  if (incompatibleSelection) {
    issues.push('Unul dintre finisajele selectate nu este compatibil cu configurația curentă');
  }

  return {
    finishing,
    selectedFinishing,
    issues,
  };
}
