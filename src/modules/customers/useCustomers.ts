"use client";

import { useState } from "react";

// Types
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
    notes: number;
    tags: number;
  };
  notes?: CustomerNote[];
  tags?: CustomerTag[];
  orders?: CustomerOrder[];
  statistics?: CustomerStatistics;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  content: string;
  createdById: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface CustomerTag {
  id: string;
  customerId: string;
  label: string;
  color: string;
}

export interface CustomerOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface CustomerStatistics {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

// Custom hook for Customers API
export function useCustomers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function for API calls
  const apiCall = async <T,>(
    url: string,
    options?: RequestInit
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 1. Get customers list with pagination, search, and filters
  const getCustomers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<CustomerListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/api/admin/customers${queryParams.toString() ? `?${queryParams}` : ""}`;
    return apiCall<CustomerListResponse>(url);
  };

  // 2. Get single customer with details and statistics
  const getCustomer = async (id: string): Promise<Customer> => {
    return apiCall<Customer>(`/api/admin/customers/${id}`);
  };

  // 3. Create new customer
  const createCustomer = async (data: CreateCustomerData): Promise<Customer> => {
    return apiCall<Customer>("/api/admin/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  // 4. Update customer
  const updateCustomer = async (
    id: string,
    data: UpdateCustomerData
  ): Promise<Customer> => {
    return apiCall<Customer>(`/api/admin/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  };

  // 5. Delete customer
  const deleteCustomer = async (id: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/api/admin/customers/${id}`, {
      method: "DELETE",
    });
  };

  // 6. Add note to customer
  const addNote = async (
    customerId: string,
    content: string
  ): Promise<CustomerNote> => {
    return apiCall<CustomerNote>(`/api/admin/customers/${customerId}/notes`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  };

  // 7. Delete customer note
  const deleteNote = async (
    customerId: string,
    noteId: string
  ): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(
      `/api/admin/customers/${customerId}/notes/${noteId}`,
      { method: "DELETE" }
    );
  };

  // 8. Add tag to customer
  const addTag = async (
    customerId: string,
    label: string,
    color?: string
  ): Promise<CustomerTag> => {
    return apiCall<CustomerTag>(`/api/admin/customers/${customerId}/tags`, {
      method: "POST",
      body: JSON.stringify({ label, color }),
    });
  };

  // 9. Delete customer tag
  const deleteTag = async (
    customerId: string,
    tagId: string
  ): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(
      `/api/admin/customers/${customerId}/tags/${tagId}`,
      { method: "DELETE" }
    );
  };

  return {
    loading,
    error,
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addNote,
    deleteNote,
    addTag,
    deleteTag,
  };
}
