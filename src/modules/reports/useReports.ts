"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type {
  OverviewKPIs,
  SalesReport,
  ProductsReport,
  CustomersReport,
  OperatorsReport,
  MaterialsReport,
} from "./types";

export function useReports() {
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────────────────
  // GET OVERVIEW
  // ─────────────────────────────────────────────────────────
  const getOverview = async (): Promise<OverviewKPIs | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/overview");
      if (!res.ok) {
        let errorMessage = "Failed to fetch overview";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // Response body might not be JSON
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      return data;
    } catch (_error) {
      console.error("Error fetching overview:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch overview");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // GET SALES
  // ─────────────────────────────────────────────────────────
  const getSales = async (): Promise<SalesReport | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/sales");
      if (!res.ok) {
        let errorMessage = "Failed to fetch sales";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // Response body might not be JSON
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      return data;
    } catch (_error) {
      console.error("Error fetching sales:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch sales");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // GET PRODUCTS
  // ─────────────────────────────────────────────────────────
  const getProducts = async (): Promise<ProductsReport | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/products");
      if (!res.ok) {
        let errorMessage = "Failed to fetch products";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // Response body might not be JSON
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      return data;
    } catch (_error) {
      console.error("Error fetching products:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch products");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // GET CUSTOMERS
  // ─────────────────────────────────────────────────────────
  const getCustomers = async (): Promise<CustomersReport | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/customers");
      if (!res.ok) {
        let errorMessage = "Failed to fetch customers";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // Response body might not be JSON
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      return data;
    } catch (_error) {
      console.error("Error fetching customers:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch customers");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // GET OPERATORS
  // ─────────────────────────────────────────────────────────
  const getOperators = async (): Promise<OperatorsReport | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/operators");
      if (!res.ok) {
        let errorMessage = "Failed to fetch operators";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // Response body might not be JSON
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      return data;
    } catch (_error) {
      console.error("Error fetching operators:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch operators");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // GET MATERIALS
  // ─────────────────────────────────────────────────────────
  const getMaterials = async (): Promise<MaterialsReport | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/materials");
      if (!res.ok) {
        let errorMessage = "Failed to fetch materials";
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // Response body might not be JSON
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      return data;
    } catch (_error) {
      console.error("Error fetching materials:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch materials");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getOverview,
    getSales,
    getProducts,
    getCustomers,
    getOperators,
    getMaterials,
  };
}
