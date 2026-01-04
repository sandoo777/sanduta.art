'use client';

import { useCurrentUser } from "@/modules/auth/useCurrentUser";

export default function OperatorDashboardPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Operator Dashboard
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
          <h3 className="text-lg font-semibold mb-2">Production Queue</h3>
          <p className="text-gray-600 text-sm mb-4">
            View and manage the production queue, track job progress, and update job status.
          </p>
          <p className="text-2xl font-bold text-blue-600">Coming Soon</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">My Jobs</h3>
          <p className="text-gray-600 text-sm mb-4">
            View jobs assigned to you, update job status, and track completion.
          </p>
          <p className="text-2xl font-bold text-blue-600">Coming Soon</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Quality Control</h3>
          <p className="text-gray-600 text-sm mb-4">
            Report quality issues, track defects, and ensure production standards.
          </p>
          <p className="text-2xl font-bold text-blue-600">Coming Soon</p>
        </div>
      </div>
    </div>
  );
}
