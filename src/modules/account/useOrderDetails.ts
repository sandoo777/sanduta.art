"use client";

import { useState } from "react";

export interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  deliveryStatus: string;
  deliveryMethod?: string;
  trackingNumber?: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress?: string;
  city?: string;
  company?: string;
  cui?: string;
  items: OrderItem[];
  files?: OrderFile[];
  timeline?: TimelineEvent[];
  history?: HistoryEvent[];
}

export interface OrderItem {
  id: string;
  productName: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  thumbnail?: string;
  specifications?: {
    dimension?: string;
    material?: string;
    finishes?: string[];
    productionTime?: string;
  };
}

export interface OrderFile {
  id: string;
  name: string;
  url: string;
  previewUrl?: string;
  type: "upload" | "editor";
  size?: string;
  validation?: "ok" | "warning" | "error";
  validationMessage?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: "success" | "info" | "warning";
}

export interface HistoryEvent {
  id: string;
  action: string;
  user: string;
  userType: "admin" | "system" | "user";
  timestamp: string;
  details?: string;
}

export function useOrderDetails() {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full order details
  const fetchOrder = async (orderId: string): Promise<OrderDetails | null> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/account/orders/${orderId}/details`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      
      const data = await response.json();
      setOrder(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch order");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get tracking link for courier
  const getTrackingLink = (trackingNumber: string, courier?: string): string => {
    if (!courier) {
      return "#";
    }

    // Nova Poshta
    if (courier.toLowerCase().includes("nova") || courier.toLowerCase().includes("пошт")) {
      return `https://novaposhta.ua/tracking/?cargo_number=${trackingNumber}`;
    }

    // DHL
    if (courier.toLowerCase().includes("dhl")) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    }

    // FedEx
    if (courier.toLowerCase().includes("fedex")) {
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    }

    // UPS
    if (courier.toLowerCase().includes("ups")) {
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    }

    // Default
    return "#";
  };

  // Generate mock timeline from order data
  const generateTimeline = (orderData: OrderDetails): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [];

    // Order placed
    timeline.push({
      id: "1",
      title: "Comandă plasată",
      description: "Comanda a fost înregistrată cu succes",
      timestamp: orderData.createdAt,
      type: "success",
    });

    // Payment confirmed
    if (orderData.paymentStatus === "PAID") {
      timeline.push({
        id: "2",
        title: "Plată confirmată",
        description: `Plată prin ${orderData.paymentMethod || "card"}`,
        timestamp: orderData.createdAt,
        type: "success",
      });
    }

    // In production
    if (["IN_PRODUCTION", "IN_PRINTING", "QUALITY_CHECK", "READY_FOR_DELIVERY", "DELIVERED"].includes(orderData.status)) {
      timeline.push({
        id: "3",
        title: "Producție începută",
        description: "Comanda este în proces de producție",
        timestamp: orderData.createdAt,
        type: "info",
      });
    }

    // Ready for delivery
    if (["READY_FOR_DELIVERY", "DELIVERED"].includes(orderData.status)) {
      timeline.push({
        id: "4",
        title: "Gata pentru livrare",
        description: "Produsele sunt pregătite pentru expediere",
        timestamp: orderData.createdAt,
        type: "success",
      });
    }

    // Delivered
    if (orderData.status === "DELIVERED") {
      timeline.push({
        id: "5",
        title: "Comandă livrată",
        description: "Comanda a fost livrată cu succes",
        timestamp: orderData.createdAt,
        type: "success",
      });
    }

    return timeline;
  };

  // Generate mock history from order data
  const generateHistory = (orderData: OrderDetails): HistoryEvent[] => {
    const history: HistoryEvent[] = [];

    history.push({
      id: "1",
      action: "Comandă creată",
      user: "Sistem",
      userType: "system",
      timestamp: orderData.createdAt,
      details: `Comandă #${orderData.orderNumber}`,
    });

    if (orderData.paymentStatus === "PAID") {
      history.push({
        id: "2",
        action: "Plată confirmată",
        user: "Sistem de plată",
        userType: "system",
        timestamp: orderData.createdAt,
      });
    }

    return history;
  };

  return {
    order,
    loading,
    error,
    fetchOrder,
    getTrackingLink,
    generateTimeline,
    generateHistory,
  };
}
