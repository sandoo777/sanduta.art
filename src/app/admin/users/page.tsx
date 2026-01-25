'use client';

import { useState, useEffect } from "react";
import { Button, Input, Card, CardContent, Badge } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Column } from "@/components/ui/Table.types";
import { useSession } from "next-auth/react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { ExternalLink } from "lucide-react";
import { User } from '@/types/models';
import { useUsers } from '@/domains/admin/hooks/useUsers';
import type { UserRole } from '@prisma/client';

interface UserWithCount extends User {
  _count: {
    orders: number;
  };
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const { confirm, Dialog } = useConfirmDialog();
  const {
    users,
    isLoading,
    loadUsers,
    updateUserRole,
    deleteUser,
  } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await confirm({
      title: 'Schimbă rol utilizator',
      message: `Sigur vrei să schimbi rolul utilizatorului la ${newRole}?`,
      variant: 'warning',
      onConfirm: async () => {
        setUpdatingUserId(userId);
        const success = await updateUserRole(userId, newRole);
        setUpdatingUserId(null);
        
        if (success) {
          alert('User role updated successfully!');
        } else {
          alert('Failed to update user role');
        }
      }
    });
  };

  const handleDeleteUser = async (userId: string, userName: string | null) => {
    await confirm({
      title: 'Șterge utilizator',
      message: `Sigur vrei să ștergi utilizatorul "${userName || 'Unknown'}"? Această acțiune nu poate fi anulată.`,
      variant: 'danger',
      requireConfirmation: true,
      onConfirm: async () => {
        const success = await deleteUser(userId);
        
        if (success) {
          alert('User deleted successfully!');
        } else {
          alert('Failed to delete user');
        }
      }
    });
  };

  const getRoleVariant = (role: UserRole): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (role) {
      case 'ADMIN':
        return 'info'; // purple → cyan (closest)
      case 'MANAGER':
        return 'primary';
      case 'OPERATOR':
        return 'success';
      case 'VIEWER':
      default:
        return 'default';
    }
  };

  const getRoleDashboard = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'MANAGER':
        return '/manager';
      case 'OPERATOR':
        return '/operator';
      default:
        return null;
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
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={() => loadUsers()} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="p-6">
              <div className="text-sm text-purple-600">Admins</div>
              <div className="text-2xl font-bold text-purple-900">
                {users.filter(u => u.role === Role.ADMIN).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <div className="text-sm text-blue-600">Managers</div>
              <div className="text-2xl font-bold text-blue-900">
                {users.filter(u => u.role === Role.MANAGER).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="text-sm text-gray-600">Viewers</div>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === Role.VIEWER).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table<UserWithCount>
            columns={[
              {
                key: 'name',
                label: 'User',
                sortable: true,
                render: (user) => (
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'No name'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                )
              },
              {
                key: 'role',
                label: 'Role',
                sortable: true,
                render: (user) => (
                  <div>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={updatingUserId === user.id || session?.user.id === user.id}
                      className={`${getRoleVariant(user.role)} ${
                        updatingUserId === user.id || session?.user.id === user.id
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:opacity-80'
                      }`}
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="OPERATOR">Operator</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    {session?.user.id === user.id && (
                      <div className="text-xs text-gray-500 mt-1">(You)</div>
                    )}
                  </div>
                )
              },
              {
                key: 'orders',
                label: 'Orders',
                accessor: (user) => user._count.orders
              },
              {
                key: 'createdAt',
                label: 'Joined',
                sortable: true,
                render: (user) => (
                  <span className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                )
              },
              {
                key: 'dashboard',
                label: 'Dashboard',
                align: 'center',
                render: (user) => (
                  getRoleDashboard(user.role) ? (
                    <AuthLink
                      href={getRoleDashboard(user.role)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </AuthLink>
                  ) : null
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                align: 'right',
                render: (user) => (
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
                )
              }
            ]}
            data={filteredUsers}
            rowKey="id"
            loading={loading}
            loadingMessage="Loading users..."
            emptyMessage="No users found"
            rowClassName={(user) => updatingUserId === user.id ? 'opacity-50' : ''}
            striped={true}
          />
        </div>
      </div>
      <Dialog />
  );
}
