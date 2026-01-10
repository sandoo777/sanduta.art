"use client";

import { useState } from "react";
import { Plug, Check, X, Settings, Key, ExternalLink } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "error";
  category: "email" | "sms" | "payment" | "shipping" | "storage" | "analytics";
  icon: string;
  configured: boolean;
  lastSync?: string;
  config?: Record<string, unknown>;
}

const integrations: Integration[] = [
  {
    id: "resend",
    name: "Resend",
    description: "Serviciu email pentru trimiterea notificărilor",
    status: "active",
    category: "email",
    icon: "📧",
    configured: true,
    lastSync: "2026-01-10T10:00:00Z",
  },
  {
    id: "paynet",
    name: "Paynet",
    description: "Gateway de plăți online",
    status: "active",
    category: "payment",
    icon: "💳",
    configured: true,
    lastSync: "2026-01-10T09:30:00Z",
  },
  {
    id: "nova-poshta",
    name: "Nova Poshta",
    description: "Serviciu de livrare și tracking colete",
    status: "active",
    category: "shipping",
    icon: "📦",
    configured: true,
    lastSync: "2026-01-10T08:00:00Z",
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    description: "Cloud storage pentru imagini și fișiere",
    status: "active",
    category: "storage",
    icon: "☁️",
    configured: true,
    lastSync: "2026-01-10T07:00:00Z",
  },
  {
    id: "sms-gateway",
    name: "SMS Gateway",
    description: "Serviciu SMS pentru notificări",
    status: "inactive",
    category: "sms",
    icon: "📱",
    configured: false,
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Analytics și statistici website",
    status: "inactive",
    category: "analytics",
    icon: "📊",
    configured: false,
  },
];

const categories = [
  { id: "all", label: "Toate", icon: "🔌" },
  { id: "email", label: "Email", icon: "📧" },
  { id: "payment", label: "Plăți", icon: "💳" },
  { id: "shipping", label: "Livrare", icon: "📦" },
  { id: "storage", label: "Storage", icon: "☁️" },
  { id: "sms", label: "SMS", icon: "📱" },
  { id: "analytics", label: "Analytics", icon: "📊" },
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const filteredIntegrations = selectedCategory === "all"
    ? integrations
    : integrations.filter(i => i.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Plug className="w-8 h-8 inline mr-2" />
            Integrări
          </h1>
          <p className="text-gray-600">
            Gestionează integrările cu servicii externe
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap
                  ${selectedCategory === cat.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Integrări"
            value={integrations.length}
            color="blue"
          />
          <StatCard
            label="Active"
            value={integrations.filter(i => i.status === "active").length}
            color="green"
          />
          <StatCard
            label="Configurate"
            value={integrations.filter(i => i.configured).length}
            color="purple"
          />
          <StatCard
            label="Erori"
            value={integrations.filter(i => i.status === "error").length}
            color="red"
          />
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getCategoryLabel(integration.category)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={integration.status} />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {integration.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm">
                  {integration.configured ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" />
                      Configurat
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500">
                      <X className="w-4 h-4" />
                      Neconfigurat
                    </span>
                  )}
                </div>
                {integration.lastSync && (
                  <span className="text-xs text-gray-500">
                    Sync: {new Date(integration.lastSync).toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedIntegration(integration)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configurează
                </button>
                {integration.configured && (
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Details Modal (simplified) */}
        {selectedIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedIntegration.icon} {selectedIntegration.name}
                  </h2>
                  <p className="text-gray-600">{selectedIntegration.description}</p>
                </div>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Key className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Salvează
                </button>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Anulează
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    email: "Email",
    sms: "SMS",
    payment: "Plăți",
    shipping: "Livrare",
    storage: "Storage",
    analytics: "Analytics",
  };
  return labels[category] || category;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
    </div>
  );
}
