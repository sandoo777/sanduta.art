import { describe, expect, it } from 'vitest';
import { validateMachinePayload } from '@/modules/machines/validation';

describe('machine validation', () => {
  it('allows empty compatible material lists for machine creation', () => {
    expect(
      validateMachinePayload({
        equipmentType: 'DIGITAL_COLOR',
        compatibleMaterialIds: [],
        costClickColor: 0.1,
      })
    ).toBeNull();
  });

  it('still requires type-specific cost fields when applicable', () => {
    expect(
      validateMachinePayload({
        equipmentType: 'DIGITAL_COLOR',
        compatibleMaterialIds: [],
        costClickColor: null,
        costClickBW: null,
      })
    ).toBe('Cel puțin un cost per click (color sau A/N) este obligatoriu pentru echipamente Digitale');
  });
});
