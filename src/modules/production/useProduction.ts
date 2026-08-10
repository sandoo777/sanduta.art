"use client";

import { useState, useCallback } from "react";

export type ProductionStatus = "PENDING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELED";
export type ProductionPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface ProductionJob {
  id: string;
  orderId: string;
  productId?: string | null;
  name: string;
  status: ProductionStatus;
  priority: ProductionPriority;
  estimatedMinutes?: number | null;
  estimatedCost?: number | null;
  assignedToId?: string;
  machineId?: string;
  printMethodId?: string | null;
  materialId?: string | null;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: string;
    customerName: string;
    totalPrice: number;
    status: string;
    orderItems?: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      product: {
        id: string;
        name: string;
        price: number;
      };
    }>;
    customer?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
  };
  product?: {
    id: string;
    name: string;
    printMethodId?: string | null;
    materialId?: string | null;
    isOutsourced?: boolean;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  machine?: {
    id: string;
    name: string;
    type: string;
    equipmentType?: string;
    status: string;
  };
  printMethod?: {
    id: string;
    name: string;
    type: string;
    isOutsourced?: boolean;
    termenFurnizor?: string | null;
  };
  material?: {
    id: string;
    name: string;
    unit: string;
    category?: string;
  };
}

export interface CreateJobData {
  orderId: string;
  productId?: string;
  name: string;
  priority?: ProductionPriority;
  dueDate?: string;
  notes?: string;
  assignedToId?: string;
  machineId?: string;
  printMethodId?: string;
  materialId?: string;
  quantity?: number;
  bwPages?: number;
}

export interface UpdateJobData {
  name?: string;
  status?: ProductionStatus;
  priority?: ProductionPriority;
  dueDate?: string;
  notes?: string;
  assignedToId?: string;
  machineId?: string | null;
  productId?: string | null;
  printMethodId?: string | null;
  materialId?: string | null;
}

export interface JobFilters {
  status?: ProductionStatus;
  priority?: ProductionPriority;
  assignedToId?: string;
  orderId?: string;
  printMethodId?: string;
  materialId?: string;
  search?: string;
}

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeApiError(status: number, apiMessage: string, fallback: string): string {
  if (status === 401 || status === 403) {
    return "Nu ai permisiunea necesara pentru aceasta actiune.";
  }

  if (status >= 400 && status < 500) {
    return apiMessage || fallback;
  }

  if (status >= 500) {
    return "A aparut o eroare temporara de sistem. Reincearca in cateva secunde.";
  }

  return apiMessage || fallback;
}

async function parseApiMessage(response: Response, fallback: string): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData.error || fallback;
  } catch {
    return response.statusText || fallback;
  }
}

async function fetchWithBackoff(url: string, maxAttempts = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return response;
      }

      const apiMessage = await parseApiMessage(response, "Request failed");
      const isRetryable = RETRYABLE_STATUS_CODES.has(response.status);

      if (isRetryable && attempt < maxAttempts) {
        await wait(200 * 2 ** (attempt - 1));
        continue;
      }

      throw new Error(normalizeApiError(response.status, apiMessage, "Request failed"));
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error("Network error");
      lastError = normalizedError;

      if (attempt < maxAttempts) {
        await wait(200 * 2 ** (attempt - 1));
        continue;
      }
    }
  }

  throw lastError ?? new Error("Request failed");
}

export function useProduction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getJobs = useCallback(async (filters?: JobFilters): Promise<ProductionJob[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.assignedToId) params.append("assignedToId", filters.assignedToId);
      if (filters?.orderId) params.append("orderId", filters.orderId);
      if (filters?.printMethodId) params.append("printMethodId", filters.printMethodId);
      if (filters?.materialId) params.append("materialId", filters.materialId);

      const response = await fetchWithBackoff(`/api/admin/production?${params.toString()}`);
      
      if (!response.ok) {
        const apiMessage = await parseApiMessage(response, "Failed to fetch jobs");
        throw new Error(normalizeApiError(response.status, apiMessage, "Failed to fetch jobs"));
      }

      const data = await response.json();
      
      // Apply client-side search filter if needed
      let jobs = data.jobs || [];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        jobs = jobs.filter((job: ProductionJob) => 
          job.name.toLowerCase().includes(searchLower) ||
          job.orderId.toLowerCase().includes(searchLower) ||
          job.order?.customerName.toLowerCase().includes(searchLower)
        );
      }
      
      return jobs;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch jobs";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getJob = useCallback(async (id: string): Promise<ProductionJob> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/production/${id}`);
      
      if (!response.ok) {
        const apiMessage = await parseApiMessage(response, "Failed to fetch job");
        throw new Error(normalizeApiError(response.status, apiMessage, "Failed to fetch job"));
      }

      const job = await response.json();
      return job;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch job";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (data: CreateJobData): Promise<ProductionJob> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/admin/production", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const apiMessage = await parseApiMessage(response, "Failed to create job");
        throw new Error(normalizeApiError(response.status, apiMessage, "Failed to create job"));
      }

      const job = await response.json();
      return job;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create job";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJob = useCallback(async (id: string, data: UpdateJobData): Promise<ProductionJob> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/production/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const apiMessage = await parseApiMessage(response, "Failed to update job");
        throw new Error(normalizeApiError(response.status, apiMessage, "Failed to update job"));
      }

      const job = await response.json();
      return job;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update job";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteJob = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/production/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const apiMessage = await parseApiMessage(response, "Failed to delete job");
        throw new Error(normalizeApiError(response.status, apiMessage, "Failed to delete job"));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete job";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
  };
}
