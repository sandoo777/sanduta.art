import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMachines } from '@/modules/machines/useMachines';

describe('useMachines unauthorized handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns an empty list and redirects when the machine fetch is unauthorized', async () => {
    const assignSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign: assignSpy },
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    }));

    const { result } = renderHook(() => useMachines());
    await expect(result.current.getMachines()).resolves.toEqual([]);
    expect(assignSpy).toHaveBeenCalledWith('/login');
  });
});
