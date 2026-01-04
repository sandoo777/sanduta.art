'use client';

import { useCurrentUser } from "@/modules/auth/useCurrentUser";

export default function ManagerDashboardPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Manager Dashboard
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Role:</span> {user?.role}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Orders Management</h3>
          <p className="text-gray-600 text-sm mb-4">
            View and manage customer orders, track order status, and handle order assignments.
          </p>
          <p className="text-2xl font-bold text-blue-600">Coming Soon</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
          <p className="text-gray-600 text-sm mb-4">
            Manage customer relationships, view customer history, and handle inquiries.
          </p>
          <p className="text-2xl font-bold text-blue-600">Coming Soon</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-gray-600 text-sm mb-4">
            View sales reports, order statistics, and business insights.
          </p>
          <p className="text-2xl font-bold text-blue-600">Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
