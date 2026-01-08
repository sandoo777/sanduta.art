'use client';

import { create } from 'zustand';
import type {
  ConfiguratorMaterial,
  ConfiguratorOption,
  ConfiguratorPrintMethod,
  ConfiguratorProduct,
  ConfiguratorSelections,
} from '@/modules/configurator/types';
import { applyOptionRules } from '@/lib/configurator/applyOptionRules';
import { filterMaterialsByProduct } from '@/lib/configurator/filterMaterialsByProduct';
import { filterPrintMethodsByProduct } from '@/lib/configurator/filterPrintMethodsByProduct';
import {
  filterFinishingByProduct,
  type FinishingFilterResult,
} from '@/lib/configurator/filterFinishingByProduct';
import {
  calculateProductPrice,
  type ExtendedPriceSummary,
} from '@/lib/pricing/calculateProductPrice';

type ConfiguratorStore = {
  loading: boolean;
  product?: ConfiguratorProduct;
  selections: ConfiguratorSelections;
  visibleOptions: ConfiguratorOption[];
  materials: Array<ConfiguratorMaterial & { effectiveCost: number }>;
  printMethods: ConfiguratorPrintMethod[];
  finishing: FinishingFilterResult['finishing'];
  priceSummary?: ExtendedPriceSummary;
  errors: string[];
  loadProduct: (productId: string) => Promise<void>;
  setOption: (optionId: string, value: string | string[]) => void;
  setMaterial: (materialId: string | undefined) => void;
  setPrintMethod: (printMethodId: string | undefined) => void;
  setFinishing: (finishingIds: string | string[]) => void;
  setQuantity: (quantity: number) => void;
  setDimension: (dimension: ConfiguratorSelections['dimension']) => void;
  calculatePrice: () => ExtendedPriceSummary | undefined;
  validateSelections: () => string[];
};

const defaultSelections: ConfiguratorSelections = {
  quantity: 1,
  finishingIds: [],
  options: {},
};

export const useConfigurator = create<ConfiguratorStore>((set, get) => {
  const recompute = (incomingSelections?: ConfiguratorSelections) => {
    const product = get().product;
    if (!product) {
      return undefined;
    }

    const selections: ConfiguratorSelections = {
      ...defaultSelections,
      ...get().selections,
      ...incomingSelections,
      finishingIds: incomingSelections?.finishingIds ?? get().selections.finishingIds ?? [],
      options: {
        ...(get().selections.options ?? {}),
        ...(incomingSelections?.options ?? {}),
      },
    };

    selections.quantity = Math.max(1, selections.quantity || 1);

    const materialResult = filterMaterialsByProduct(product, selections);
    if (!materialResult.selectedMaterial && materialResult.materials[0]) {
      selections.materialId = materialResult.materials[0].id;
    }

    const printMethodResult = filterPrintMethodsByProduct(product, selections);
    if (!printMethodResult.selectedPrintMethod && printMethodResult.printMethods[0]) {
      selections.printMethodId = printMethodResult.printMethods[0].id;
    }

    const finishingResult = filterFinishingByProduct(product, selections);
    const sanitizedFinishingIds = selections.finishingIds.filter((id) =>
      finishingResult.finishing.some((finishing) => finishing.id === id)
    );
    selections.finishingIds = sanitizedFinishingIds;

    const optionRulesResult = applyOptionRules(product, selections);

    const selectedMaterial = materialResult.selectedMaterial ?? materialResult.materials[0];
    const selectedPrintMethod = printMethodResult.selectedPrintMethod ?? printMethodResult.printMethods[0];

    const priceSummary = calculateProductPrice(product, selections, {
      material: selectedMaterial,
      printMethod: selectedPrintMethod,
      finishing: finishingResult.selectedFinishing,
      optionPriceAdjustments: optionRulesResult.priceAdjustment,
    });

    const errors = [
      ...materialResult.issues,
      ...printMethodResult.issues,
      ...finishingResult.issues,
      ...optionRulesResult.validationErrors,
    ];

    set({
      selections,
      materials: materialResult.materials,
      printMethods: printMethodResult.printMethods,
      finishing: finishingResult.finishing,
      visibleOptions: optionRulesResult.visibleOptions,
      priceSummary,
      errors,
    });

    return priceSummary;
  };

  return {
    loading: false,
    product: undefined,
    selections: { ...defaultSelections },
    visibleOptions: [],
    materials: [],
    printMethods: [],
    finishing: [],
    priceSummary: undefined,
    errors: [],

    loadProduct: async (productId: string) => {
      set({ loading: true });
      try {
        const response = await fetch(`/api/products/${productId}/configurator`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to load configurator product');
        }

        const product = (await response.json()) as ConfiguratorProduct;
        const selections: ConfiguratorSelections = {
          ...defaultSelections,
          quantity: product.defaults.quantity,
          materialId: product.defaults.materialId,
          printMethodId: product.defaults.printMethodId,
          finishingIds: product.defaults.finishingIds ?? [],
          options: product.defaults.optionValues ?? {},
        };

        set({ product, selections, loading: false });
        recompute(selections);
      } catch (error) {
        console.error('Configurator: unable to load product', error);
        set({ loading: false, errors: ['Nu am reușit să încărcăm produsul'], product: undefined });
        throw error;
      }
    },

    setOption: (optionId, value) => {
      const product = get().product;
      if (!product) {
        return;
      }

      const option = product.options.find((entry) => entry.id === optionId);
      if (!option) {
        return;
      }

      let normalizedValue: string | string[] | undefined;
      if (option.type === 'checkbox') {
        const arrayValue = Array.isArray(value) ? value : [value];
        normalizedValue = arrayValue.filter(Boolean).map(String);
      } else if (value != null) {
        normalizedValue = Array.isArray(value) ? value[0] : value;
        normalizedValue = normalizedValue != null ? String(normalizedValue) : undefined;
      }

      const nextOptions = { ...get().selections.options };
      if (normalizedValue === undefined || (Array.isArray(normalizedValue) && normalizedValue.length === 0)) {
        delete nextOptions[optionId];
      } else {
        nextOptions[optionId] = normalizedValue;
      }

      recompute({
        ...get().selections,
        options: nextOptions,
      });
    },

    setMaterial: (materialId) => {
      recompute({
        ...get().selections,
        materialId,
      });
    },

    setPrintMethod: (printMethodId) => {
      recompute({
        ...get().selections,
        printMethodId,
      });
    },

    setFinishing: (finishingIds) => {
      const ids = Array.isArray(finishingIds)
        ? finishingIds
        : finishingIds
          ? [finishingIds]
          : [];

      recompute({
        ...get().selections,
        finishingIds: ids,
      });
    },

    setQuantity: (quantity) => {
      recompute({
        ...get().selections,
        quantity,
      });
    },

    setDimension: (dimension) => {
      recompute({
        ...get().selections,
        dimension: dimension || undefined,
      });
    },

    calculatePrice: () => {
      const summary = recompute();
      return summary ?? get().priceSummary;
    },

    validateSelections: () => {
      const product = get().product;
      if (!product) {
        set({ errors: ['Produsul nu este încărcat'] });
        return ['Produsul nu este încărcat'];
      }

      const errors: string[] = [];
      const { selections, visibleOptions } = get();

      if (product.type !== 'STANDARD' && !selections.materialId) {
        errors.push('Selectează un material compatibil');
      }

      if (!selections.printMethodId && product.printMethods.length > 0) {
        errors.push('Selectează o metodă de tipărire');
      }

      for (const option of visibleOptions) {
        const selectedValue = selections.options?.[option.id];
        if (option.required) {
          if (option.type === 'checkbox') {
            const values = Array.isArray(selectedValue) ? selectedValue : [];
            if (values.length === 0) {
              errors.push(`Selectează cel puțin o valoare pentru ${option.name}`);
            }
          } else if (!selectedValue) {
            errors.push(`Completează câmpul ${option.name}`);
          }
        }
      }

      if (product.dimensions && selections.dimension) {
        const { widthMin, widthMax, heightMin, heightMax } = product.dimensions;
        const width = selections.dimension.width ?? 0;
        const height = selections.dimension.height ?? 0;
        if (widthMin && width < widthMin) {
          errors.push(`Lățimea minimă este ${widthMin}${product.dimensions.unit}`);
        }
        if (widthMax && width > widthMax) {
          errors.push(`Lățimea maximă este ${widthMax}${product.dimensions.unit}`);
        }
        if (heightMin && height < heightMin) {
          errors.push(`Înălțimea minimă este ${heightMin}${product.dimensions.unit}`);
        }
        if (heightMax && height > heightMax) {
          errors.push(`Înălțimea maximă este ${heightMax}${product.dimensions.unit}`);
        }
      }

      if (selections.quantity <= 0) {
        errors.push('Cantitatea minimă este 1');
      }

      const mergedErrors = Array.from(
        new Set([...(get().errors?.filter(Boolean) ?? []), ...errors])
      );
      set({ errors: mergedErrors });
      return mergedErrors;
    },
  };
});
