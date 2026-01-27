"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { safeGet } from "@/lib/safeFetch";
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
      const data = await safeGet<OverviewKPIs | null>(
        "/api/admin/reports/overview",
        null,
        "Reports:Overview"
      );
      if (!data) {
        toast.error("Failed to fetch overview");
      }
      return data;
    } catch (error) {
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
      const data = await safeGet<SalesReport | null>(
        "/api/admin/reports/sales",
        null,
        "Reports:Sales"
      );
      if (!data) {
        toast.error("Failed to fetch sales");
      }
      return data;
    } catch (error) {
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
      const data = await safeGet<ProductsReport | null>(
        "/api/admin/reports/products",
        null,
        "Reports:Products"
      );
      if (!data) {
        toast.error("Failed to fetch products");
      }
      return data;
    } catch (error) {
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
      const data = await safeGet<CustomersReport | null>(
        "/api/admin/reports/customers",
        null,
        "Reports:Customers"
      );
      if (!data) {
        toast.error("Failed to fetch customers");
      }
      return data;
    } catch (error) {
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
      const data = await safeGet<OperatorsReport | null>(
        "/api/admin/reports/operators",
        null,
        "Reports:Operators"
      );
      if (!data) {
        toast.error("Failed to fetch operators");
      }
      return data;
    } catch (error) {
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
      const data = await safeGet<MaterialsReport | null>(
        "/api/admin/reports/materials",
        null,
        "Reports:Materials"
      );
      if (!data) {
        toast.error("Failed to fetch materials");
      }
      return data;
    } catch (error) {
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
