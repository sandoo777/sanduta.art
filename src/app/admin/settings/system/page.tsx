"use client";

import { SystemSettingsForm } from "./_components/SystemSettingsForm";

export default function SystemSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure global system settings and preferences
        </p>
      </div>

      <SystemSettingsForm />
    </div>
  );
}
