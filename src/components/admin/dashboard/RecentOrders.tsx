"use client";

import { useEffect, useState } from "react";
import { Clock, Eye, ArrowRight } from "lucide-react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { useAnalytics } from "@/modules/admin/useAnalytics";

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function RecentOrders() {
  const { fetchRecentOrders, loading } = useAnalytics();
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const data = await fetchRecentOrders(10);
    if (data) {
      // Transform data: totalPrice → total
      const transformed = data.map(order => ({
        ...order,
        total: Number(order.total), // Convert Decimal to number
      }));
      setOrders(transformed);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PREPRODUCTION: "bg-purple-100 text-purple-800",
      IN_DESIGN: "bg-orange-100 text-orange-800",
      IN_PRODUCTION: "bg-blue-100 text-blue-800",
      IN_PRINTING: "bg-cyan-100 text-cyan-800",
      QUALITY_CHECK: "bg-indigo-100 text-indigo-800",
      READY_FOR_DELIVERY: "bg-emerald-100 text-emerald-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    const labels: Record<string, string> = {
      PENDING: "În așteptare",
      IN_PREPRODUCTION: "Preproducție",
      IN_DESIGN: "Design",
      IN_PRODUCTION: "În producție",
      IN_PRINTING: "Printare",
      QUALITY_CHECK: "Control Calitate",
      READY_FOR_DELIVERY: "Gata livrare",
      DELIVERED: "Livrată",
      CANCELLED: "Anulată",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min în urmă`;
    if (diffHours < 24) return `${diffHours}h în urmă`;
    if (diffDays < 7) return `${diffDays} zile în urmă`;
    
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Comenzi Recente</h2>
            <p className="text-sm text-gray-600">Ultimele 10 comenzi</p>
          </div>
        </div>
        <AuthLink
          href="/admin/orders"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Vezi toate
          <ArrowRight className="w-4 h-4" />
        </AuthLink>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Comandă
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Client
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Dată
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {order.orderNumber}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-gray-600">{order.customerEmail}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-semibold text-gray-900">
                    {order.total.toLocaleString()} RON
                  </span>
                </td>
                <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <AuthLink
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    Vezi
                  </AuthLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          Nu există comenzi recente
        </div>
      )}
    </div>
  );
}
