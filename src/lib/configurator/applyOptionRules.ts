import type {
  ConfiguratorOption,
  ConfiguratorProduct,
  ConfiguratorSelections,
} from '@/modules/configurator/types';

export interface OptionRuleResult {
  visibleOptions: ConfiguratorOption[];
  hiddenOptionIds: Set<string>;
  disabledValueMap: Record<string, Set<string>>;
  priceAdjustment: number;
  validationErrors: string[];
}

interface RuleContext {
  product: ConfiguratorProduct;
  selections: ConfiguratorSelections;
}

const OPERATORS = ['includes', '>=', '<=', '!=', '>', '<', '='] as const;
type Operator = (typeof OPERATORS)[number];

function parseFragment(fragment: string) {
  const trimmed = fragment.trim();
  if (!trimmed) {
    return null;
  }

  for (const operator of OPERATORS) {
    const index = trimmed.indexOf(operator);
    if (index > -1) {
      const subject = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + operator.length).trim();
      return { subject, operator, value };
    }
  }

  return null;
}

function normalizeValue(value: string) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function evaluateFragment(fragment: string, ctx: RuleContext) {
  const parsed = parseFragment(fragment);
  if (!parsed) {
    return false;
  }

  const { subject, operator } = parsed;
  const value = normalizeValue(parsed.value);

  const subjectParts = subject.split('.');
  let currentValue: unknown;

  switch (subjectParts[0]) {
    case 'option':
      currentValue = ctx.selections.options?.[subjectParts[1]];
      break;
    case 'material':
      currentValue = ctx.selections.materialId;
      break;
    case 'printMethod':
      currentValue = ctx.selections.printMethodId;
      break;
    case 'finishing':
      currentValue = ctx.selections.finishingIds;
      break;
    case 'quantity':
      currentValue = ctx.selections.quantity;
      break;
    case 'type':
      currentValue = ctx.product.type;
      break;
    default:
      currentValue = undefined;
  }

  if (operator === 'includes') {
    const collection = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : [];
    return collection.includes(value);
  }

  if (typeof currentValue === 'number') {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return false;
    }

    switch (operator) {
      case '>=':
        return currentValue >= numeric;
      case '<=':
        return currentValue <= numeric;
      case '>':
        return currentValue > numeric;
      case '<':
        return currentValue < numeric;
      case '=':
        return currentValue === numeric;
      case '!=':
        return currentValue !== numeric;
      default:
        return false;
    }
  }

  const normalizedCurrent = Array.isArray(currentValue)
    ? currentValue.map(String)
    : currentValue != null
      ? String(currentValue)
      : undefined;

  switch (operator) {
    case '=':
      if (Array.isArray(normalizedCurrent)) {
        return normalizedCurrent.includes(value);
      }
      return normalizedCurrent === value;
    case '!=':
      if (Array.isArray(normalizedCurrent)) {
        return !normalizedCurrent.includes(value);
      }
      return normalizedCurrent !== value;
    default:
      return false;
  }
}

function evaluateCondition(condition: string, ctx: RuleContext) {
  if (!condition) {
    return true;
  }

  const orGroups = condition.split('||');
  return orGroups.some((group) =>
    group
      .split('&&')
      .every((fragment) => evaluateFragment(fragment.trim(), ctx))
  );
}

function applyAction(
  action: string,
  hiddenOptionIds: Set<string>,
  disabledValueMap: Record<string, Set<string>>,
  result: { priceAdjustment: number; errors: string[] }
) {
  const trimmed = action.trim();
  if (!trimmed) {
    return;
  }

  if (trimmed.startsWith('hide:')) {
    const optionId = trimmed.replace('hide:', '').replace('option.', '').trim();
    if (optionId) {
      hiddenOptionIds.add(optionId);
    }
    return;
  }

  if (trimmed.startsWith('disable:')) {
    const payload = trimmed.replace('disable:', '').trim();
    const [optionSegment, valueSegment] = payload.split('=');
    const optionId = optionSegment.replace('option.', '').trim();
    if (!optionId) {
      return;
    }
    disabledValueMap[optionId] = disabledValueMap[optionId] ?? new Set<string>();
    if (valueSegment) {
      disabledValueMap[optionId].add(valueSegment.trim());
    } else {
      disabledValueMap[optionId].add('*');
    }
    return;
  }

  if (trimmed.startsWith('price:')) {
    const delta = Number(trimmed.replace('price:', '').trim());
    if (Number.isFinite(delta)) {
      result.priceAdjustment += delta;
    }
    return;
  }

  if (trimmed.startsWith('error:')) {
    const message = trimmed.replace('error:', '').trim();
    if (message) {
      result.errors.push(message);
    }
  }
}

export function applyOptionRules(
  product: ConfiguratorProduct,
  selections: ConfiguratorSelections
): OptionRuleResult {
  const hiddenOptionIds = new Set<string>();
  const disabledValueMap: Record<string, Set<string>> = {};
  const result = { priceAdjustment: 0, errors: [] as string[] };
  const ctx: RuleContext = { product, selections };

  // Apply rules from product options
  for (const option of product.options) {
    if (!option.rules) {
      continue;
    }

    for (const rule of option.rules) {
      if (!rule) {
        continue;
      }
      if (evaluateCondition(rule.condition, ctx)) {
        applyAction(rule.action, hiddenOptionIds, disabledValueMap, result);
      }
    }
  }

  // Calculate price adjustments from selected option values
  for (const option of product.options) {
    const selectedValue = selections.options?.[option.id];
    if (!selectedValue) {
      continue;
    }

    if (option.type === 'checkbox') {
      const values = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
      for (const val of values) {
        const optionValue = option.values.find((v) => v.value === val);
        if (optionValue?.priceModifier) {
          result.priceAdjustment += optionValue.priceModifier;
        }
      }
    } else {
      const optionValue = option.values.find((v) => v.value === selectedValue);
      if (optionValue?.priceModifier) {
        result.priceAdjustment += optionValue.priceModifier;
      }
    }
  }

  const visibleOptions = product.options
    .filter((option) => !hiddenOptionIds.has(option.id))
    .map((option) => ({
      ...option,
      values: option.values.map((value) => {
        const disabledEntries = disabledValueMap[option.id];
        const disableEntireOption = disabledEntries?.has('*');
        const disabled = disableEntireOption || disabledEntries?.has(value.value) || value.disabled;
        return {
          ...value,
          disabled,
        };
      }),
    }));

  // Validate required options
  for (const option of visibleOptions) {
    if (option.required) {
      const selectedValue = selections.options?.[option.id];
      if (!selectedValue) {
        result.errors.push(`Opțiunea "${option.name}" este obligatorie`);
      } else if (option.type === 'checkbox') {
        const values = Array.isArray(selectedValue) ? selectedValue : [];
        if (values.length === 0) {
          result.errors.push(`Selectează cel puțin o valoare pentru "${option.name}"`);
        }
      }
    }
  }

  return {
    visibleOptions,
    hiddenOptionIds,
    disabledValueMap,
    priceAdjustment: Number(result.priceAdjustment.toFixed(2)),
    validationErrors: result.errors,
  };
}
