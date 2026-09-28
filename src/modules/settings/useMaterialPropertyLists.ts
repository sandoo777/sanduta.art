"use client";

import { useCallback, useEffect, useState } from "react";

export type MaterialPropertyListType = "finishes" | "colors" | "textures";

export type MaterialPropertyListItem = {
  id: string;
  value: string;
  enabled: boolean;
  usageCount: number;
};

type MaterialPropertyLists = Record<MaterialPropertyListType, MaterialPropertyListItem[]>;

const EMPTY_LISTS: MaterialPropertyLists = {
  finishes: [],
  colors: [],
  textures: [],
};

export function useMaterialPropertyLists(autoLoad = true) {
  const [lists, setLists] = useState<MaterialPropertyLists>(EMPTY_LISTS);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings/material-lists", {
        cache: "no-store",
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to load material property lists");
      }

      setLists(payload.lists || EMPTY_LISTS);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load material property lists");
      setLists(EMPTY_LISTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoLoad) return;
    void refresh();
  }, [autoLoad, refresh]);

  const addValue = useCallback(async (type: MaterialPropertyListType, value: string, enabled = true) => {
    setMutating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings/material-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value, enabled }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create value");
      }

      await refresh();
      return payload;
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Failed to create value";
      setError(message);
      throw new Error(message);
    } finally {
      setMutating(false);
    }
  }, [refresh]);

  const updateValue = useCallback(async (
    type: MaterialPropertyListType,
    id: string,
    patch: { value?: string; enabled?: boolean },
  ) => {
    setMutating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings/material-lists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, ...patch }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update value");
      }

      await refresh();
      return payload;
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Failed to update value";
      setError(message);
      throw new Error(message);
    } finally {
      setMutating(false);
    }
  }, [refresh]);

  const deleteValue = useCallback(async (type: MaterialPropertyListType, id: string) => {
    setMutating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings/material-lists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete value");
      }

      await refresh();
      return payload;
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Failed to delete value";
      setError(message);
      throw new Error(message);
    } finally {
      setMutating(false);
    }
  }, [refresh]);

  return {
    lists,
    loading,
    mutating,
    error,
    refresh,
    addValue,
    updateValue,
    deleteValue,
    clearError: () => setError(null),
  };
}
