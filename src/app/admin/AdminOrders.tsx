"use client";

import { useState, useEffect } from "react";

interface Order {
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
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-4">Orders Management</h2>
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
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="p-1 md:p-2 border rounded text-xs md:text-sm w-full md:w-auto"
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
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
    </div>
  );
}