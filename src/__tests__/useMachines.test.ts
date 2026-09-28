import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMachines } from '@/modules/machines/useMachines';

describe('useMachines', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('surfaces the server auth error when the machine list request is unauthorized', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })
    );

    const { result } = renderHook(() => useMachines());

    await expect(result.current.getMachines()).rejects.toThrow('Unauthorized');
  });
});
