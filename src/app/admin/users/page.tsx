'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Role } from "@/lib/types-prisma";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      await fetchUsers();
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string | null) => {
    if (!confirm(`Are you sure you want to delete user "${userName || 'Unknown'}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      await fetchUsers();
      alert('User deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case Role.MANAGER:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case Role.OPERATOR:
        return 'bg-green-100 text-green-800 border-green-200';
      case Role.VIEWER:
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">Manage user accounts and roles</p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={fetchUsers} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-6">
            <div className="text-sm text-purple-600">Admins</div>
            <div className="text-2xl font-bold text-purple-900">
              {users.filter(u => u.role === Role.ADMIN).length}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-sm text-blue-600">Managers</div>
            <div className="text-2xl font-bold text-blue-900">
              {users.filter(u => u.role === Role.MANAGER).length}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Viewers</div>
            <div className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === Role.VIEWER).length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading users...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={updatingUserId === user.id ? 'opacity-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          disabled={updatingUserId === user.id || session?.user.id === user.id}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)} ${
                            updatingUserId === user.id || session?.user.id === user.id
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer hover:opacity-80'
                          }`}
                        >
                          <option value={Role.VIEWER}>Viewer</option>
                          <option value={Role.OPERATOR}>Operator</option>
                          <option value={Role.MANAGER}>Manager</option>
                          <option value={Role.ADMIN}>Admin</option>
                        </select>
                        {session?.user.id === user.id && (
                          <div className="text-xs text-gray-500 mt-1">(You)</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user._count.orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={session?.user.id === user.id}
                          className={`text-red-600 hover:text-red-900 ${
                            session?.user.id === user.id
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          title={session?.user.id === user.id ? 'Cannot delete your own account' : 'Delete user'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
  );
}
