"use client";

import { useState, useEffect } from "react";
import { LoadingState } from '@/components/ui/LoadingState';
import { Table } from '@/components/ui/Table';
import { Key, Check, X } from "lucide-react";
import { UserRole } from "@prisma/client";

interface Permission {
  id: string;
  name: string;
  description: string;
  group: string;
}

interface PermissionGroup {
  name: string;
  permissions: string[];
}

interface RolePermissionMatrix {
  role: string;
  permissions: string[];
  permissionCount: number;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groups, setGroups] = useState<Record<string, PermissionGroup>>({});
  const [matrix, setMatrix] = useState<RolePermissionMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings/permissions");
      const data = await response.json();
      setPermissions(data.permissions || []);
      setGroups(data.groups || {});
      setMatrix(data.rolePermissionMatrix || []);
    } catch (_error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = selectedGroup === "all"
    ? permissions
    : permissions.filter(p => p.group === selectedGroup);

  const roles: UserRole[] = ["ADMIN", "MANAGER", "OPERATOR", "VIEWER"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Key className="w-8 h-8 inline mr-2" />
            Sistem Permisiuni
          </h1>
          <p className="text-gray-600">
            Vizualizează și gestionează permisiunile platformei
          </p>
        </div>

        {loading ? (
          <LoadingState text="Se încarcă permisiunile..." />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Total Permisiuni"
                value={permissions.length}
                color="blue"
              />
              <StatCard
                label="Grupuri"
                value={Object.keys(groups).length}
                color="purple"
              />
              <StatCard
                label="Roluri"
                value={matrix.length}
                color="green"
              />
              <StatCard
                label="Admin Permisiuni"
                value={matrix.find(m => m.role === "ADMIN")?.permissionCount || 0}
                color="red"
              />
            </div>

            {/* Group Filter */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrează după categorie
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toate categoriile</option>
                {Object.entries(groups).map(([key, group]) => (
                  <option key={key} value={key}>
                    {group.name} ({group.permissions.length})
                  </option>
                ))}
              </select>
            </div>

            {/* Permission Matrix */}
            <Table
              columns={[
                {
                  key: 'name',
                  label: 'Permisiune',
                  render: (permission) => (
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {permission.name}
                    </code>
                  ),
                },
                {
                  key: 'description',
                  label: 'Descriere',
                  render: (permission) => (
                    <span className="text-sm text-gray-600">{permission.description}</span>
                  ),
                },
                ...roles.map((role) => ({
                  key: `role_${role}`,
                  label: role,
                  render: (permission: Permission) => {
                    const rolePermissions = matrix.reduce((acc, r) => {
                      acc[r.role] = new Set(r.permissions);
                      return acc;
                    }, {} as Record<string, Set<string>>);
                    const hasPermission = rolePermissions[role]?.has(permission.name);
                    return (
                      <div className="flex justify-center">
                        {hasPermission ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    );
                  },
                })),
              ]}
              data={filteredPermissions}
              rowKey="id"
              loading={loading}
              emptyMessage="Nu există permisiuni de afișat"
              className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6"
              stickyHeader={true}
            />

            {/* Permission Groups Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groups).map(([key, group]) => (
                <div
                  key={key}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {group.permissions.length} permisiuni în acest grup
                  </p>
                  <div className="space-y-2">
                    {group.permissions.slice(0, 5).map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <code className="text-xs">{permission}</code>
                      </div>
                    ))}
                    {group.permissions.length > 5 && (
                      <div className="text-xs text-gray-500 mt-2">
                        +{group.permissions.length - 5} mai multe...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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
