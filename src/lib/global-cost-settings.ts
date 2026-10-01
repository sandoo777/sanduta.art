export const GLOBAL_COST_SETTING_KEYS = {
  electricityCostMdlPerKwh: 'production_cost.electricity_cost_mdl_per_kwh',
  productionOperatorCostMdlPerHour: 'production_cost.production_operator_cost_mdl_per_hour',
  finishingOperatorCostMdlPerHour: 'production_cost.finishing_operator_cost_mdl_per_hour',
  designOperatorCostMdlPerHour: 'production_cost.design_operator_cost_mdl_per_hour',
  defaultWorkingHoursPerDay: 'production_cost.default_working_hours_per_day',
} as const;

export interface GlobalProductionCostSettings {
  electricityCostMdlPerKwh: number;
  productionOperatorCostMdlPerHour: number;
  finishingOperatorCostMdlPerHour: number;
  designOperatorCostMdlPerHour: number;
  defaultWorkingHoursPerDay: number;
}

export const DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS: GlobalProductionCostSettings = {
  electricityCostMdlPerKwh: 2.4,
  productionOperatorCostMdlPerHour: 20,
  finishingOperatorCostMdlPerHour: 18,
  designOperatorCostMdlPerHour: 25,
  defaultWorkingHoursPerDay: 8,
};

export function parseGlobalCostSetting(value: string | number | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function normalizeGlobalProductionCostSettings(
  settings?: Record<string, string | number | null | undefined>,
): GlobalProductionCostSettings {
  const source = settings ?? {};

  return {
    electricityCostMdlPerKwh: parseGlobalCostSetting(
      source[GLOBAL_COST_SETTING_KEYS.electricityCostMdlPerKwh],
      DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS.electricityCostMdlPerKwh,
    ),
    productionOperatorCostMdlPerHour: parseGlobalCostSetting(
      source[GLOBAL_COST_SETTING_KEYS.productionOperatorCostMdlPerHour],
      DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS.productionOperatorCostMdlPerHour,
    ),
    finishingOperatorCostMdlPerHour: parseGlobalCostSetting(
      source[GLOBAL_COST_SETTING_KEYS.finishingOperatorCostMdlPerHour],
      DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS.finishingOperatorCostMdlPerHour,
    ),
    designOperatorCostMdlPerHour: parseGlobalCostSetting(
      source[GLOBAL_COST_SETTING_KEYS.designOperatorCostMdlPerHour],
      DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS.designOperatorCostMdlPerHour,
    ),
    defaultWorkingHoursPerDay: parseGlobalCostSetting(
      source[GLOBAL_COST_SETTING_KEYS.defaultWorkingHoursPerDay],
      DEFAULT_GLOBAL_PRODUCTION_COST_SETTINGS.defaultWorkingHoursPerDay,
    ),
  };
}
