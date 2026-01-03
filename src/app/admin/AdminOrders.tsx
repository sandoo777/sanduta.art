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
      <h2 className="text-2xl font-bold mb-4">Orders Management</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border">
              <td className="p-2 border">{order.id.slice(-8)}</td>
              <td className="p-2 border">
                {order.customerName} ({order.customerEmail})
                {order.user && <div>User: {order.user.name}</div>}
              </td>
              <td className="p-2 border">{order.total}</td>
              <td className="p-2 border">{order.status}</td>
              <td className="p-2 border">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                </select>
                <details className="mt-2">
                  <summary className="cursor-pointer">Details</summary>
                  <ul className="mt-2">
                    {order.orderItems.map((item, idx) => (
                      <li key={idx}>
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
  );
}