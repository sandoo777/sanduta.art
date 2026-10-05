import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMaterials } from '@/modules/materials/useMaterials';

describe('useMaterials', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('loads a material detail by id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({
          id: 'mat-1',
          name: 'Test Material',
        }),
      })
    );

    const { result } = renderHook(() => useMaterials());

    await act(async () => {
      await expect(result.current.getMaterial('mat-1')).resolves.toMatchObject({
        id: 'mat-1',
        name: 'Test Material',
      });
    });
  });
});
