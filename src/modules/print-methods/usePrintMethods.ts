"use client";

import { useState } from "react";
import { toast } from "sonner";
import type {
  PrintMethod,
  CreatePrintMethodInput,
  UpdatePrintMethodInput,
} from "./types";

export function usePrintMethods() {
  const [isLoading, setIsLoading] = useState(false);

  const getPrintMethods = async (): Promise<PrintMethod[]> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/print-methods");
      if (!response.ok) {
        throw new Error("Failed to fetch print methods");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching print methods:", error);
      toast.error("Eroare la încărcarea metodelor de tipărire");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getPrintMethod = async (id: string): Promise<PrintMethod | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/print-methods/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch print method");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching print method:", error);
      toast.error("Eroare la încărcarea metodei de tipărire");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createPrintMethod = async (
    data: CreatePrintMethodInput
  ): Promise<PrintMethod | null> => {
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
    } catch (error: any) {
      console.error("Error creating print method:", error);
      toast.error(error.message || "Eroare la crearea metodei de tipărire");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrintMethod = async (
    id: string,
    data: UpdatePrintMethodInput
  ): Promise<PrintMethod | null> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/print-methods/${id}`, {
        method: "PATCH",
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
    } catch (error: any) {
      console.error("Error updating print method:", error);
      toast.error(error.message || "Eroare la actualizarea metodei de tipărire");
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
        throw new Error("Failed to delete print method");
      }

      toast.success("Metoda de tipărire a fost ștearsă cu succes");
      return true;
    } catch (error) {
      console.error("Error deleting print method:", error);
      toast.error("Eroare la ștergerea metodei de tipărire");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getPrintMethods,
    getPrintMethod,
    createPrintMethod,
    updatePrintMethod,
    deletePrintMethod,
    isLoading,
  };
}
