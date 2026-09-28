import { describe, expect, it } from 'vitest';
import { EQUIPMENT_TYPE_CONFIG, MACHINE_TYPES, normalizeEquipmentType } from '@/modules/machines/types';

describe('equipment type taxonomy', () => {
  it('uses the standardized equipment list and supports both production modes', () => {
    const equipmentValues = MACHINE_TYPES.map((item) => item.equipmentType);

    expect(MACHINE_TYPES.map((item) => item.value)).toEqual([
      'Digital Color',
      'Digital Mono',
      'UV',
      'Large Format',
      'DTF',
      'Sublimation',
      'Offset',
      'Embroidery',
      'Plotter Cutting',
    ]);

    expect([...new Set(equipmentValues)]).toEqual([
      'DIGITAL_COLOR',
      'DIGITAL_MONO',
      'UV',
      'LARGE_FORMAT',
      'DTF',
      'SUBLIMATION',
      'OFFSET',
      'EMBROIDERY',
      'PLOTTER_CUTTING',
    ]);

    expect(Object.keys(EQUIPMENT_TYPE_CONFIG)).toEqual([
      'DIGITAL_COLOR',
      'DIGITAL_MONO',
      'UV',
      'LARGE_FORMAT',
      'DTF',
      'SUBLIMATION',
      'OFFSET',
      'EMBROIDERY',
      'PLOTTER_CUTTING',
    ]);
  });

  it('normalizes legacy machine types to the new taxonomy', () => {
    expect(normalizeEquipmentType('DIGITAL')).toBe('DIGITAL_COLOR');
    expect(normalizeEquipmentType('LARGE_FORMAT')).toBe('LARGE_FORMAT');
    expect(normalizeEquipmentType('HOURLY')).toBe('PLOTTER_CUTTING');
    expect(normalizeEquipmentType('OFFSET_PRESS')).toBe('OFFSET');
  });
});
