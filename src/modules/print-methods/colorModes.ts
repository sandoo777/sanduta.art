export const COLOR_MODE_VALUES = [
  'CMYK',
  'CMYK_WHITE',
  'CMYK_WHITE_VARNISH',
  'CMYK_LC_LM',
  'CMYK_OG',
  'MONO',
  'SPOT',
  'PANTONE',
] as const;

export type ColorModeValue = (typeof COLOR_MODE_VALUES)[number];

export interface ColorModeOption {
  value: ColorModeValue;
  label: string;
  tooltip: string;
}

export const COLOR_MODE_OPTIONS: ColorModeOption[] = [
  {
    value: 'CMYK',
    label: 'CMYK',
    tooltip: 'Standard 4 culori. Consum normal si viteza standard.',
  },
  {
    value: 'CMYK_WHITE',
    label: 'CMYK + White',
    tooltip: 'Necesita canal White, consum mai mare si viteza mai mica.',
  },
  {
    value: 'CMYK_WHITE_VARNISH',
    label: 'CMYK + White + Varnish',
    tooltip: 'Include White si Varnish. Consum ridicat si productie mai lenta.',
  },
  {
    value: 'CMYK_LC_LM',
    label: 'CMYK + LightC + LightM',
    tooltip: 'Calitate foto mai buna pe gradient, consum usor crescut.',
  },
  {
    value: 'CMYK_OG',
    label: 'CMYK + Orange + Green',
    tooltip: 'Gamut extins pentru culori vibrante, consum moderat crescut.',
  },
  {
    value: 'MONO',
    label: 'Monocrom',
    tooltip: 'Imprimare monocromatica, consum redus semnificativ.',
  },
  {
    value: 'SPOT',
    label: 'Spot Color',
    tooltip: 'Consum proportional cu numarul de culori spot folosite.',
  },
  {
    value: 'PANTONE',
    label: 'Pantone',
    tooltip: 'Consum proportional cu numarul de cerneluri Pantone.',
  },
];

const COLOR_MODE_LABELS: Record<ColorModeValue, string> = {
  CMYK: 'CMYK',
  CMYK_WHITE: 'CMYK + White',
  CMYK_WHITE_VARNISH: 'CMYK + White + Varnish',
  CMYK_LC_LM: 'CMYK + LightC + LightM',
  CMYK_OG: 'CMYK + Orange + Green',
  MONO: 'Monocrom',
  SPOT: 'Spot Color',
  PANTONE: 'Pantone',
};

const COLOR_MODE_BASE_CONSUMPTION_FACTOR: Record<ColorModeValue, number> = {
  CMYK: 1.0,
  CMYK_WHITE: 1.3,
  CMYK_WHITE_VARNISH: 1.6,
  CMYK_LC_LM: 1.1,
  CMYK_OG: 1.2,
  MONO: 0.5,
  SPOT: 1.0,
  PANTONE: 1.0,
};

const COLOR_MODE_SPEED_FACTOR: Record<ColorModeValue, number> = {
  CMYK: 1.0,
  CMYK_WHITE: 0.7,
  CMYK_WHITE_VARNISH: 0.5,
  CMYK_LC_LM: 0.9,
  CMYK_OG: 0.8,
  MONO: 1.15,
  SPOT: 0.6,
  PANTONE: 0.5,
};

export function isColorModeValue(value: unknown): value is ColorModeValue {
  return typeof value === 'string' && COLOR_MODE_VALUES.includes(value as ColorModeValue);
}

export function getColorModeLabel(value: string | null | undefined): string {
  if (!value || !isColorModeValue(value)) {
    return value ?? '';
  }

  return COLOR_MODE_LABELS[value];
}

export function getColorModeTooltip(value: string | null | undefined): string {
  if (!value || !isColorModeValue(value)) {
    return 'Alege un mod culoare standardizat pentru estimari corecte de consum.';
  }

  const option = COLOR_MODE_OPTIONS.find((item) => item.value === value);
  return option?.tooltip ?? 'Alege un mod culoare standardizat pentru estimari corecte de consum.';
}

export function resolveColorModeConsumptionFactor(
  colorMode: string | null | undefined,
  channelCount?: number | null
): number {
  if (!colorMode || !isColorModeValue(colorMode)) {
    return 1;
  }

  if (colorMode === 'SPOT' || colorMode === 'PANTONE') {
    const safeChannelCount = Math.max(1, Math.floor(channelCount ?? 1));
    return safeChannelCount * COLOR_MODE_BASE_CONSUMPTION_FACTOR[colorMode];
  }

  return COLOR_MODE_BASE_CONSUMPTION_FACTOR[colorMode];
}

export function resolveColorModeSpeedFactor(colorMode: string | null | undefined): number {
  if (!colorMode || !isColorModeValue(colorMode)) {
    return 1;
  }

  return COLOR_MODE_SPEED_FACTOR[colorMode];
}

export function resolveColorModeSetupCost(
  colorMode: string | null | undefined,
  colorChannelCount: number | null | undefined,
  inkChangeoverCost: number | null | undefined
): number {
  if (!colorMode || !isColorModeValue(colorMode)) {
    return 0;
  }

  if (colorMode !== 'SPOT' && colorMode !== 'PANTONE') {
    return 0;
  }

  const safeChannelCount = Math.max(1, Math.floor(colorChannelCount ?? 1));
  const safeInkChangeoverCost = Math.max(0, Number(inkChangeoverCost ?? 0));

  return safeChannelCount * safeInkChangeoverCost;
}
