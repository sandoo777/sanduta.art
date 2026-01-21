"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, Badge } from '@/components/ui';
import { Users, Plus, Search, Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { UserRole } from "@prisma/client";
import { User } from '@/types/models';

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  OPERATOR: "Operator",
  VIEWER: "Vizualizator",
};

const getRoleVariant = (role: UserRole): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (role) {
    case 'ADMIN': return 'danger';
    case 'MANAGER': return 'info';
    case 'OPERATOR': return 'primary';
    case 'VIEWER': return 'default';
    default: return 'default';
  }
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (statusFilter !== "ALL") params.append("active", String(statusFilter === "ACTIVE"));
      
      const response = await fetch(`/api/admin/settings/users?${params}`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (_error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <Users className="w-8 h-8 inline mr-2" />
              Gestionare Utilizatori
            </h1>
            <p className="text-gray-600">
              Gestionează utilizatorii interni ai platformei
            </p>
          </div>
          <button
            onClick={() => alert('Add User feature coming soon')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adaugă Utilizator
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Caută utilizatori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toate rolurile</option>
              <option value="ADMIN">Administrator</option>
              <option value="MANAGER">Manager</option>
              <option value="OPERATOR">Operator</option>
              <option value="VIEWER">Vizualizator</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Toate statusurile</option>
              <option value="ACTIVE">Activ</option>
              <option value="INACTIVE">Inactiv</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Utilizatori"
            value={users.length}
            color="blue"
          />
          <StatCard
            label="Administratori"
            value={users.filter(u => u.role === "ADMIN").length}
            color="red"
          />
          <StatCard
            label="Activi"
            value={users.filter(u => u.active).length}
            color="green"
          />
          <StatCard
            label="Cu 2FA"
            value={users.filter(u => u.twoFactorEnabled).length}
            color="purple"
          />
        </div>

        {/* Users Table */}
        <Table
          columns={[
            {
              key: 'name',
              label: 'Utilizator',
              sortable: true,
              render: (user) => (
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              ),
            },
            {
              key: 'role',
              label: 'Rol',
              render: (user) => (
                <Badge variant={getRoleVariant(user.role)} size="sm">
                  {roleLabels[user.role]}
                </Badge>
              ),
            },
            {
              key: 'contact',
              label: 'Contact',
              render: (user) => (
                <div>
                  <div className="text-sm text-gray-900">{user.phone || "—"}</div>
                  <div className="text-sm text-gray-500">{user.company || "—"}</div>
                </div>
              ),
            },
            {
              key: 'active',
              label: 'Status',
              render: (user) => (
                <div className="flex items-center gap-2">
                  {user.active ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`text-sm ${user.active ? "text-green-600" : "text-red-600"}`}>
                    {user.active ? "Activ" : "Inactiv"}
                  </span>
                  {user.twoFactorEnabled && (
                    <Badge variant="info" size="sm">
                      2FA
                    </Badge>
                  )}
                </div>
              ),
            },
            {
              key: 'activity',
              label: 'Activitate',
              render: (user) => (
                <div>
                  <div className="text-sm text-gray-900">
                    {(user._count?.orders || 0) + (user._count?.assignedOrders || 0)} comenzi
                  </div>
                  <div className="text-sm text-gray-500">
                    {user._count?.productionJobs || 0} job-uri
                  </div>
                </div>
              ),
            },
            {
              key: 'actions',
              label: 'Acțiuni',
              render: () => (
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredUsers}
          rowKey="id"
          loading={loading}
          emptyMessage="Nu s-au găsit utilizatori."
          clientSideSort={true}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
    </div>
  );
}
