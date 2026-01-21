"use client";

import { useState, useEffect } from "react";
import { LoadingState, Badge } from '@/components/ui';
import { Shield, Users, Key, Info } from "lucide-react";
import { UserRole } from "@prisma/client";

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  permissionCount: number;
  isSystem: boolean;
}

interface PermissionGroup {
  name: string;
  permissions: string[];
}

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<Record<string, PermissionGroup>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings/roles");
      const data = await response.json();
      setRoles(data.roles || []);
      setPermissionGroups(data.permissionGroups || {});
    } catch (_error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    ADMIN: "red",
    MANAGER: "purple",
    OPERATOR: "blue",
    VIEWER: "gray",
  };

  const getRoleBadgeVariant = (roleName: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (roleName) {
      case 'ADMIN': return 'danger';
      case 'MANAGER': return 'info';
      case 'OPERATOR': return 'primary';
      case 'VIEWER': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Shield className="w-8 h-8 inline mr-2" />
            Gestionare Roluri
          </h1>
          <p className="text-gray-600">
            Vizualizează și gestionează rolurile și permisiunile asociate
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Despre Roluri și Permisiuni
              </h3>
              <p className="text-sm text-blue-800">
                Rolurile definesc nivelul de acces al utilizatorilor în platformă. 
                Fiecare rol are un set predefinit de permisiuni care controlează ce acțiuni poate efectua utilizatorul.
                Rolurile sistem nu pot fi șterse sau modificate, doar vizualizate.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState text="Se încarcă rolurile..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Roles List */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Roluri Disponibile
              </h2>
              <div className="space-y-4">
                {roles.map((role) => {
                  const color = roleColors[role.name] || "gray";
                  const isSelected = selectedRole?.id === role.id;
                  
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`
                        bg-white border rounded-lg p-6 cursor-pointer
                        transition-all duration-200
                        ${isSelected 
                          ? `border-${color}-500 shadow-lg` 
                          : "border-gray-200 hover:shadow-md hover:border-gray-300"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-${color}-100 rounded-lg`}>
                            <Shield className={`w-6 h-6 text-${color}-600`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {role.displayName}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {role.name}
                            </span>
                          </div>
                        </div>
                        {role.isSystem && (
                          <Badge variant="default" size="sm">
                            Sistem
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        {role.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Key className="w-4 h-4" />
                          <span>{role.permissionCount} permisiuni</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detalii Rol & Permisiuni
              </h2>
              
              {selectedRole ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedRole.displayName}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {selectedRole.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(selectedRole.name)} size="sm">
                        {selectedRole.name}
                      </Badge>
                      <Badge variant="default" size="sm">
                        {selectedRole.permissionCount} permisiuni
                      </Badge>
                    </div>
                  </div>

                  {/* Permissions by Group */}
                  <div className="space-y-6">
                    <h4 className="font-semibold text-gray-900">
                      Permisiuni pe Categorii
                    </h4>
                    
                    {Object.entries(permissionGroups).map(([key, group]) => {
                      const rolePermissions = new Set(selectedRole.permissions);
                      const groupPermissions = group.permissions.filter(p => rolePermissions.has(p));
                      
                      if (groupPermissions.length === 0) return null;
                      
                      return (
                        <div key={key} className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-medium text-gray-900 mb-2">
                            {group.name}
                          </h5>
                          <div className="space-y-1">
                            {groupPermissions.map((permission) => (
                              <div
                                key={permission}
                                className="flex items-center gap-2 text-sm text-gray-700"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {permission.replace(/_/g, " ").toLowerCase()}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {groupPermissions.length} din {group.permissions.length} permisiuni
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Selectează un rol pentru a vedea detaliile și permisiunile
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Role Hierarchy */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ierarhia Rolurilor
          </h2>
          <div className="flex items-center gap-4">
            {["ADMIN", "MANAGER", "OPERATOR", "VIEWER"].map((role, index) => (
              <div key={role} className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`
                    w-16 h-16 rounded-full 
                    bg-${roleColors[role]}-100 
                    flex items-center justify-center mb-2
                  `}>
                    <Shield className={`w-8 h-8 text-${roleColors[role]}-600`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {role}
                  </div>
                  <div className="text-xs text-gray-500">
                    Nivel {4 - index}
                  </div>
                </div>
                {index < 3 && (
                  <div className="text-gray-400 text-2xl pb-8">→</div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Ierarhia controlează nivelul de acces: <strong>ADMIN</strong> are acces complet, 
            în timp ce <strong>VIEWER</strong> are doar acces de citire.
          </p>
        </div>
      </div>
    </div>
  );
}
