'use client';

import { useCurrentUser } from "@/modules/auth/useCurrentUser";
import Link from "next/link";

export default function AccountDashboardPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        My Account
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.name}!</h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Account Type:</span> {user?.role}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">My Orders</h3>
          <p className="text-gray-600 text-sm mb-4">
            View your order history, track current orders, and reorder previous items.
          </p>
          <Link 
            href="/account/orders" 
            className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View Orders →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
          <p className="text-gray-600 text-sm mb-4">
            Update your personal information, change password, and manage preferences.
          </p>
          <p className="text-2xl font-bold text-blue-600">Coming Soon</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Shop Products</h3>
          <p className="text-gray-600 text-sm mb-4">
            Browse our product catalog and place new orders.
          </p>
          <Link 
            href="/products" 
            className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse Products →
          </Link>
        </div>
      </div>
    </div>
  );
}
