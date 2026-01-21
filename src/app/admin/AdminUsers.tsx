"use client";

import { useEffect } from "react";
import { useUsers } from '@/domains/admin/hooks/useUsers';
import type { UserRole } from '@prisma/client';

export default function AdminUsers() {
  const { users, isLoading, loadUsers, updateUserRole } = useUsers();

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateRole = async (id: string, role: string) => {
    const success = await updateUserRole(id, role as UserRole);
    if (!success) {
      alert('Failed to update user role');
    }
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-4">Users Management</h2>
      {isLoading ? (
        <LoadingState text="Se încarcă utilizatorii..." />
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border border-gray-300 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Name</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Email</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Role</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Orders</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold border-r">Joined</th>
                    <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r">{user.name || "N/A"}</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r">{user.email}</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r">{user.role}</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r">{user._count?.orders || 0}</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm border-r whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-2 md:px-4 py-3 text-xs md:text-sm">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="p-1 md:p-2 border rounded text-xs md:text-sm w-full md:w-auto"
                          disabled={isLoading}
                        >
                          <option value="VIEWER">Viewer</option>
                          <option value="OPERATOR">Operator</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}