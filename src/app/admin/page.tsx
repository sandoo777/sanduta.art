"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminUsers from "./AdminUsers";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      <div className="mb-4">
        <button
          onClick={() => setActiveTab("products")}
          className={`mr-4 px-4 py-2 ${activeTab === "products" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`mr-4 px-4 py-2 ${activeTab === "orders" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 ${activeTab === "users" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Users
        </button>
      </div>
      {activeTab === "products" && <AdminProducts />}
      {activeTab === "orders" && <AdminOrders />}
      {activeTab === "users" && <AdminUsers />}
    </div>
  );
}