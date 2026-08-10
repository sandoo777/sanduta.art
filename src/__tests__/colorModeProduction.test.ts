import { describe, it, expect } from 'vitest';
import { calculateProductionTime } from '@/lib/production-time';
import {
  resolveColorModeSetupCost,
  resolveColorModeSpeedFactor,
} from '@/modules/print-methods/colorModes';

describe('resolveColorModeSpeedFactor', () => {
  it('returns configured factors for known modes', () => {
    expect(resolveColorModeSpeedFactor('CMYK')).toBeCloseTo(1);
    expect(resolveColorModeSpeedFactor('CMYK_WHITE')).toBeCloseTo(0.7);
    expect(resolveColorModeSpeedFactor('PANTONE')).toBeCloseTo(0.5);
  });

  it('falls back to 1 for unknown/empty values', () => {
    expect(resolveColorModeSpeedFactor(null)).toBe(1);
    expect(resolveColorModeSpeedFactor(undefined)).toBe(1);
    expect(resolveColorModeSpeedFactor('INVALID_MODE')).toBe(1);
  });
});

describe('resolveColorModeSetupCost', () => {
  it('computes setup only for SPOT/PANTONE', () => {
    expect(resolveColorModeSetupCost('SPOT', 3, 120)).toBe(360);
    expect(resolveColorModeSetupCost('PANTONE', 2, 80)).toBe(160);
    expect(resolveColorModeSetupCost('CMYK', 4, 100)).toBe(0);
  });

  it('uses safe defaults for channels and cost', () => {
    expect(resolveColorModeSetupCost('SPOT', null, 100)).toBe(100);
    expect(resolveColorModeSetupCost('SPOT', 0, 100)).toBe(100);
    expect(resolveColorModeSetupCost('SPOT', 2, null)).toBe(0);
  });
});

describe('calculateProductionTime with color mode', () => {
  it('applies speed factor for LARGE_FORMAT', () => {
    const base = calculateProductionTime(
      {
        id: 'm1',
        name: 'LF1',
        equipmentType: 'LARGE_FORMAT',
        speedM2PerHour: 100,
        speedPpm: null,
      },
      { quantity: 100, colorMode: 'CMYK' }
    );

    const slower = calculateProductionTime(
      {
        id: 'm1',
        name: 'LF1',
        equipmentType: 'LARGE_FORMAT',
        speedM2PerHour: 100,
        speedPpm: null,
      },
      { quantity: 100, colorMode: 'PANTONE' }
    );

    expect(base.estimatedMinutes).toBe(60);
    expect(slower.estimatedMinutes).toBe(120);
  });

  it('applies speed factor for DIGITAL', () => {
    const base = calculateProductionTime(
      {
        id: 'm2',
        name: 'DIG1',
        equipmentType: 'DIGITAL',
        speedM2PerHour: null,
        speedPpm: 100,
      },
      { quantity: 1000, colorMode: 'CMYK' }
    );

    const slower = calculateProductionTime(
      {
        id: 'm2',
        name: 'DIG1',
        equipmentType: 'DIGITAL',
        speedM2PerHour: null,
        speedPpm: 100,
      },
      { quantity: 1000, colorMode: 'SPOT' }
    );

    expect(base.estimatedMinutes).toBe(10);
    expect(slower.estimatedMinutes).toBe(17);
  });
});
