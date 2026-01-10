"use client";

import { useState, useEffect } from "react";
import { Key, Shield, Check, X } from "lucide-react";
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
    } catch (error) {
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
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Se încarcă permisiunile...</p>
          </div>
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
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                        Permisiune
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Descriere
                      </th>
                      {roles.map((role) => (
                        <th
                          key={role}
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"
                        >
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPermissions.map((permission) => {
                      const rolePermissions = matrix.reduce((acc, role) => {
                        acc[role.role] = new Set(role.permissions);
                        return acc;
                      }, {} as Record<string, Set<string>>);

                      return (
                        <tr key={permission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                            <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {permission.name}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                            {permission.description}
                          </td>
                          {roles.map((role) => {
                            const hasPermission = rolePermissions[role]?.has(permission.name);
                            return (
                              <td key={role} className="px-6 py-4 text-center">
                                {hasPermission ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

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
