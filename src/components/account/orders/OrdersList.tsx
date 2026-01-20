"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, Order } from "@/modules/account/useAccount";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const statusLabels: Record<string, string> = {
  PENDING: "În așteptare",
  IN_PREPRODUCTION: "În preproducție",
  IN_DESIGN: "În design",
  IN_PRODUCTION: "În producție",
  IN_PRINTING: "În printare",
  QUALITY_CHECK: "Control calitate",
  READY_FOR_DELIVERY: "Gata de livrare",
  DELIVERED: "Livrată",
  CANCELLED: "Anulată",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PREPRODUCTION: "bg-blue-100 text-blue-800",
  IN_DESIGN: "bg-purple-100 text-purple-800",
  IN_PRODUCTION: "bg-indigo-100 text-indigo-800",
  IN_PRINTING: "bg-cyan-100 text-cyan-800",
  QUALITY_CHECK: "bg-orange-100 text-orange-800",
  READY_FOR_DELIVERY: "bg-green-100 text-green-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersList() {
  const { orders, loading, fetchOrders } = useAccount();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter));
    }
     
  }, [orders, statusFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Se încarcă comenzile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Toate
        </button>
        {Object.keys(statusLabels).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600">
            {statusFilter === "all"
              ? "Nu ai nicio comandă încă."
              : "Nu ai comenzi cu acest status."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Comandă #{order.orderNumber || order.id.slice(0, 8)}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <span>📅 {formatDate(order.createdAt)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      📦 {order.items?.length || 0} produse
                    </span>
                    {order.deliveryMethod && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>🚚 {order.deliveryMethod}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(order.totalPrice, order.currency)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {order.paymentStatus === "PAID"
                        ? "Plătită"
                        : "În așteptare plată"}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
