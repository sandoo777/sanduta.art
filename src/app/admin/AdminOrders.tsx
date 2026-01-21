"use client";

import { useState, useEffect } from "react";
import { useOrders } from '@/domains/orders/hooks/useOrders';
import { LoadingState } from '@/components/ui/LoadingState';

interface OrderListItem {
  id: string;
  total: number;
  customerName: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  orderItems: { product: { name: string }; quantity: number }[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const { getOrders, updateStatus, loading } = useOrders();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const result = await getOrders();
    if (result.success && result.data) {
      setOrders(result.data.orders as unknown as OrderListItem[]);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const result = await updateStatus(id, status);
    if (result.success) {
      fetchOrders();
    } else {
      alert(result.error || 'Failed to update order status');
    }
  };

  return (
    <div>
      {loading ? (
        <LoadingState text="Se încarcă comenzile..." />
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-gray-300 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">ID</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Customer</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Total</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Status</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Date</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r">{order.id.slice(-8)}</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-gray-500 text-xs">{order.customerEmail}</div>
                        {order.user && <div className="text-xs text-gray-400">User: {order.user.name}</div>}
                      </td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r whitespace-nowrap">{order.total} ₽</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r">{order.status}</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="p-1 md:p-2 border rounded text-xs md:text-sm w-full md:w-auto"
                          disabled={loading}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="READY">Ready</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs md:text-sm">Details</summary>
                          <ul className="mt-2 space-y-1">
                            {order.orderItems.map((item, idx) => (
                              <li key={idx} className="text-xs md:text-sm text-gray-700">
                                {item.product.name} x {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}div>
        </div>
      </div>
    </div>
  );
}