"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { safeGet, safePost, safePut } from '@/lib/safeFetch';
import type {
  Material,
  MaterialWithDetails,
  CreateMaterialInput,
  UpdateMaterialInput,
  ConsumeMaterialInput,
} from "./types";

export function useMaterials() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const getMaterials = useCallback(async (): Promise<Material[]> => {
    setIsLoading(true);
    setLastError(null);
    try {
      const data = await safeGet<Material[]>(
        "/api/admin/materials",
        [],
        "Materials:List"
      );
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Eroare la încărcarea materialelor";
      setLastError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMaterial = useCallback(async (id: string): Promise<MaterialWithDetails | null> => {
    setIsLoading(true);
    setLastError(null);
    try {
      const data = await safeGet<MaterialWithDetails | null>(
        `/api/admin/materials/${id}`,
        null,
        "Materials:Detail"
      );
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Eroare la încărcarea materialului";
      setLastError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMaterial = useCallback(async (data: CreateMaterialInput): Promise<Material | null> => {
    setIsLoading(true);
    setLastError(null);
    try {
      const material = await safePost<Material | null>(
        "/api/admin/materials",
        data,
        null,
        "Materials:Create"
      );

      if (!material) {
        throw new Error("Failed to create material");
      }

      toast.success("Material creat cu succes");
      return material;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Eroare la crearea materialului";
      setLastError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMaterial = useCallback(async (
    id: string,
    data: UpdateMaterialInput
  ): Promise<Material | null> => {
    setIsLoading(true);
    setLastError(null);
    try {
      const material = await safePut<Material | null>(
        `/api/admin/materials/${id}`,
        data,
        null,
        "Materials:Update"
      );

      if (!material) {
        throw new Error("Failed to update material");
      }

      toast.success("Material actualizat cu succes");
      return material;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Eroare la actualizarea materialului";
      setLastError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMaterial = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setLastError(null);
    try {
      const response = await fetch(`/api/admin/materials/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete material");
      }

      toast.success("Material șters cu succes");
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Eroare la ștergerea materialului";
      setLastError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const consumeMaterial = useCallback(async (
    id: string,
    data: ConsumeMaterialInput
  ): Promise<unknown> => {
    setIsLoading(true);
    setLastError(null);
    try {
      const response = await fetch(`/api/admin/materials/${id}/consume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to consume material");
      }

      const result = await response.json();
      
      if (result.warning) {
        toast.warning(result.warning.message);
      } else {
        toast.success("Material consumat cu succes");
      }
      
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Eroare la consumul materialului";
      setLastError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    lastError,
    getMaterials,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    consumeMaterial,
  };
}
