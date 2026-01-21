"use client";

import { useEffect } from "react";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table.types";
import { Badge } from "@/components/ui";
import { useUsers } from '@/domains/admin/hooks/useUsers';
import type { UserRole } from '@prisma/client';

interface UserWithCount {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  _count?: {
    orders: number;
  };
}

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
      <Table<UserWithCount>
        columns={[
          {
            key: 'name',
            label: 'Name',
            sortable: true,
            accessor: (user) => user.name || "N/A"
          },
          {
            key: 'email',
            label: 'Email',
            sortable: true,
            accessor: 'email'
          },
          {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (user) => <Badge value={user.role} />
          },
          {
            key: 'orders',
            label: 'Orders',
            accessor: (user) => user._count?.orders || 0
          },
          {
            key: 'createdAt',
            label: 'Joined',
            sortable: true,
            render: (user) => (
              <span className="whitespace-nowrap">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            )
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (user) => (
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
            )
          }
        ]}
        data={users as UserWithCount[]}
        rowKey="id"
        loading={isLoading}
        loadingMessage="Se încarcă utilizatorii..."
        emptyMessage="Nu există utilizatori"
        bordered={true}
        responsive={true}
      />
    </div>
  );
}