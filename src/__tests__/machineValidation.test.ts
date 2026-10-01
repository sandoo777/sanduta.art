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

  it('allows digital equipment without legacy cost-per-click values', () => {
    expect(
      validateMachinePayload({
        equipmentType: 'DIGITAL_COLOR',
        compatibleMaterialIds: [],
        costClickColor: null,
        costClickBW: null,
      })
    ).toBeNull();
  });
});
