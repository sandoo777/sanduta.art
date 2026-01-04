"use client";

import Link from "next/link";
import { Users, Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage users, roles, and system configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users & Roles Card */}
        <Link
          href="/admin/settings/users"
          className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Users & Roles
                </h2>
                <p className="text-sm text-gray-600">
                  Manage user accounts and permissions
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                View and manage users
              </span>
              <span className="text-blue-600">→</span>
            </div>
          </div>
        </Link>

        {/* System Settings Card */}
        <Link
          href="/admin/settings/system"
          className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  System Settings
                </h2>
                <p className="text-sm text-gray-600">
                  Configure global system settings
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Company info, localization, inventory
              </span>
              <span className="text-green-600">→</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
