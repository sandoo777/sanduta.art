"use client";

import { useState, useEffect } from "react";

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  thumbnail?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  deliveryStatus: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
  deliveryAddress?: string;
  deliveryMethod?: string;
  trackingNumber?: string;
}

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  updatedAt: string;
  data: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  cui?: string;
}

export function useAccount() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/account/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    }
  };

  // Fetch single order
  const fetchOrder = async (orderId: string): Promise<Order | null> => {
    try {
      const response = await fetch(`/api/account/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order");
      return null;
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/account/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    }
  };

  // Delete project
  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/account/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      await fetchProjects();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      return false;
    }
  };

  // Duplicate project
  const duplicateProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/account/projects/${projectId}/duplicate`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to duplicate project");
      await fetchProjects();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate project");
      return false;
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/account/addresses");
      if (!response.ok) throw new Error("Failed to fetch addresses");
      const data = await response.json();
      setAddresses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch addresses");
    }
  };

  // Add address
  const addAddress = async (address: Omit<Address, "id">) => {
    try {
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      if (!response.ok) throw new Error("Failed to add address");
      await fetchAddresses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add address");
      return false;
    }
  };

  // Update address
  const updateAddress = async (addressId: string, address: Partial<Address>) => {
    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      if (!response.ok) throw new Error("Failed to update address");
      await fetchAddresses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update address");
      return false;
    }
  };

  // Delete address
  const deleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete address");
      await fetchAddresses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete address");
      return false;
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/account/addresses/${addressId}/default`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to set default address");
      await fetchAddresses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default address");
      return false;
    }
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/account/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    }
  };

  // Update profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      await fetchProfile();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      return false;
    }
  };

  // Change password
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
      return false;
    }
  };

  // Delete account
  const deleteAccount = async (password: string) => {
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      return false;
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchOrders(),
        fetchProjects(),
        fetchAddresses(),
      ]);
      setLoading(false);
    };
    initData();
  }, []);

  return {
    // Data
    orders,
    projects,
    addresses,
    profile,
    loading,
    error,

    // Orders
    fetchOrders,
    fetchOrder,

    // Projects
    fetchProjects,
    deleteProject,
    duplicateProject,

    // Addresses
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    // Profile
    fetchProfile,
    updateProfile,

    // Settings
    changePassword,
    deleteAccount,
  };
}
