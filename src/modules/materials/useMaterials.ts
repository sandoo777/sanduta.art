"use client";

import { useState } from "react";
import { toast } from "sonner";
import { safeGet, safePost, safePut, safeDelete } from '@/lib/safeFetch';
import type {
  Material,
  MaterialWithDetails,
  CreateMaterialInput,
  UpdateMaterialInput,
  ConsumeMaterialInput,
} from "./types";

export function useMaterials() {
  const [isLoading, setIsLoading] = useState(false);

  const getMaterials = async (): Promise<Material[]> => {
    setIsLoading(true);
    try {
      const data = await safeGet<Material[]>(
        "/api/admin/materials",
        [],
        "Materials:List"
      );
      return data;
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Eroare la încărcarea materialelor");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getMaterial = async (id: string): Promise<MaterialWithDetails | null> => {
    setIsLoading(true);
    try {
      const data = await safeGet<MaterialWithDetails | null>(
        `/api/admin/materials/${id}`,
        null,
        "Materials:Detail"
      );
      return data;
    } catch (error) {
      console.error("Error fetching material:", error);
      toast.error("Eroare la încărcarea materialului");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createMaterial = async (data: CreateMaterialInput): Promise<Material | null> => {
    setIsLoading(true);
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
    } catch (error: any) {
      console.error("Error creating material:", error);
      toast.error(error.message || "Eroare la crearea materialului");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMaterial = async (
    id: string,
    data: UpdateMaterialInput
  ): Promise<Material | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/materials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update material");
      }

      const material = await response.json();
      toast.success("Material actualizat cu succes");
      return material;
    } catch (error: any) {
      console.error("Error updating material:", error);
      toast.error(error.message || "Eroare la actualizarea materialului");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMaterial = async (id: string): Promise<boolean> => {
    setIsLoading(true);
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
    } catch (error: any) {
      console.error("Error deleting material:", error);
      toast.error(error.message || "Eroare la ștergerea materialului");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const consumeMaterial = async (
    id: string,
    data: ConsumeMaterialInput
  ): Promise<any> => {
    setIsLoading(true);
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
    } catch (error: any) {
      console.error("Error consuming material:", error);
      toast.error(error.message || "Eroare la consumul materialului");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getMaterials,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    consumeMaterial,
  };
}
