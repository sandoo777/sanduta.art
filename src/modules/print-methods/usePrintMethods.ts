"use client";

import { useState } from "react";
import { toast } from "sonner";
import type {
  PrintMethodWithRelations,
  CreatePrintMethodInput,
  UpdatePrintMethodInput,
  PrintMethodConsumable,
  CreatePrintMethodConsumableInput,
  UpdatePrintMethodConsumableInput,
} from "./types";

export function usePrintMethods() {
  const [isLoading, setIsLoading] = useState(false);

  const getPrintMethods = async (): Promise<PrintMethodWithRelations[]> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/print-methods?active=true");
      if (!response.ok) {
        throw new Error("Failed to fetch print methods");
      }
      return await response.json();
    } catch (error: unknown) {
      console.error("Error fetching print methods:", error);
      toast.error("Eroare la încărcarea metodelor de tipărire");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getPrintMethod = async (id: string): Promise<PrintMethodWithRelations | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/print-methods/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch print method");
      }
      return await response.json();
    } catch (error: unknown) {
      console.error("Error fetching print method:", error);
      toast.error("Eroare la încărcarea metodei de tipărire");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createPrintMethod = async (
    data: CreatePrintMethodInput
  ): Promise<PrintMethodWithRelations | null> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/print-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create print method");
      }

      const printMethod = await response.json();
      toast.success("Metoda de tipărire a fost creată cu succes");
      return printMethod;
    } catch (error: unknown) {
      console.error("Error creating print method:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare la crearea metodei de tipărire";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrintMethod = async (
    id: string,
    data: UpdatePrintMethodInput
  ): Promise<PrintMethodWithRelations | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/print-methods/${id}`, {
        method: "PUT",  // Changed from PATCH to PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update print method");
      }

      const printMethod = await response.json();
      toast.success("Metoda de tipărire a fost actualizată cu succes");
      return printMethod;
    } catch (error: unknown) {
      console.error("Error updating print method:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare la actualizarea metodei de tipărire";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrintMethod = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/print-methods/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deactivate print method");
      }

      toast.success("Metoda a fost dezactivată.");
      return true;
    } catch (error: unknown) {
      console.error("Error deleting print method:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare la dezactivarea metodei de tipărire";
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================
  // Consumables Management
  // ===========================

  const getConsumables = async (printMethodId: string): Promise<PrintMethodConsumable[]> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/print-methods/${printMethodId}/consumables`);
      if (!response.ok) {
        throw new Error("Failed to fetch consumables");
      }
      return await response.json();
    } catch (error: unknown) {
      console.error("Error fetching consumables:", error);
      toast.error("Eroare la încărcarea consumabilelor");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createConsumable = async (
    printMethodId: string,
    data: CreatePrintMethodConsumableInput
  ): Promise<PrintMethodConsumable | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/print-methods/${printMethodId}/consumables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create consumable");
      }

      const consumable = await response.json();
      toast.success("Consumabil adăugat cu succes");
      return consumable;
    } catch (error: unknown) {
      console.error("Error creating consumable:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare la adăugarea consumabilului";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConsumable = async (
    printMethodId: string,
    consumableId: string,
    data: UpdatePrintMethodConsumableInput
  ): Promise<PrintMethodConsumable | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/print-methods/${printMethodId}/consumables/${consumableId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update consumable");
      }

      const consumable = await response.json();
      toast.success("Consumabil actualizat cu succes");
      return consumable;
    } catch (error: unknown) {
      console.error("Error updating consumable:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare la actualizarea consumabilului";
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConsumable = async (
    printMethodId: string,
    consumableId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/print-methods/${printMethodId}/consumables/${consumableId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete consumable");
      }

      toast.success("Consumabil șters cu succes");
      return true;
    } catch (error: unknown) {
      console.error("Error deleting consumable:", error);
      toast.error("Eroare la ștergerea consumabilului");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Print Methods
    getPrintMethods,
    getPrintMethod,
    createPrintMethod,
    updatePrintMethod,
    deletePrintMethod,
    // Consumables
    getConsumables,
    createConsumable,
    updateConsumable,
    deleteConsumable,
    // State
    isLoading,
  };
}
