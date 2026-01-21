"use client";

import { useState, useEffect } from "react";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table.types";
import { useOrders } from '@/domains/orders/hooks/useOrders';

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
      <Table
        columns={[
          {
            key: 'id',
            label: 'ID',
            render: (order) => (
              <span className="text-xs md:text-sm">{order.id.slice(-8)}</span>
            )
          },
          {
            key: 'customer',
            label: 'Customer',
            render: (order) => (
              <div>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-gray-500 text-xs">{order.customerEmail}</div>
                {order.user && <div className="text-xs text-gray-400">User: {order.user.name}</div>}
              </div>
            )
          },
          {
            key: 'total',
            label: 'Total',
            sortable: true,
            render: (order) => (
              <span className="whitespace-nowrap">{order.total} ₽</span>
            )
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            accessor: 'status'
          },
          {
            key: 'createdAt',
            label: 'Date',
            sortable: true,
            render: (order) => (
              <span className="whitespace-nowrap">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            )
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (order) => (
              <div>
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
              </div>
            )
          }
        ]}
        data={orders}
        rowKey="id"
        loading={loading}
        loadingMessage="Se încarcă comenzile..."
        emptyMessage="Nu există comenzi"
        bordered={true}
        responsive={true}
        clientSideSort={true}
      />
    </div>
  );
}