"use client";

import { useState, useCallback } from "react";

export type ProductionStatus = "PENDING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELED";
export type ProductionPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface ProductionJob {
  id: string;
  orderId: string;
  name: string;
  status: ProductionStatus;
  priority: ProductionPriority;
  assignedToId?: string;
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
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export interface CreateJobData {
  orderId: string;
  name: string;
  priority?: ProductionPriority;
  dueDate?: string;
  notes?: string;
  assignedToId?: string;
}

export interface UpdateJobData {
  name?: string;
  status?: ProductionStatus;
  priority?: ProductionPriority;
  dueDate?: string;
  notes?: string;
  assignedToId?: string;
}

export interface JobFilters {
  status?: ProductionStatus;
  priority?: ProductionPriority;
  assignedToId?: string;
  orderId?: string;
  search?: string;
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

      const response = await fetch(`/api/admin/production?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch jobs");
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
      throw err;
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch job");
      }

      const job = await response.json();
      return job;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch job";
      setError(message);
      throw err;
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      const job = await response.json();
      return job;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create job";
      setError(message);
      throw err;
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update job");
      }

      const job = await response.json();
      return job;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update job";
      setError(message);
      throw err;
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete job");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete job";
      setError(message);
      throw err;
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
