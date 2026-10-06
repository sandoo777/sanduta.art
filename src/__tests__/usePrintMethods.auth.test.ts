import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePrintMethods } from '@/modules/print-methods/usePrintMethods';

describe('usePrintMethods auth requests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends credentials include when fetching a single print method', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'pm-1', name: 'Digital Color' }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => usePrintMethods());

    await act(async () => {
      await expect(result.current.getPrintMethod('pm-1')).resolves.toEqual({ id: 'pm-1', name: 'Digital Color' });
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/print-methods/pm-1', {
      credentials: 'include',
    });
  });
});
