"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Globe, Mail, DollarSign, Bell, Building2 } from "lucide-react";

interface PlatformSettings {
  general: {
    platformName: string;
    logo: string;
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    timezone: string;
    dateFormat: string;
    languages: string[];
    defaultLanguage: string;
  };
  business: {
    companyName: string;
    cui: string;
    registrationNumber: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  financial: {
    currency: string;
    vat: number;
    bankAccount: string;
    bankName: string;
  };
  email: {
    senderName: string;
    senderEmail: string;
    replyToEmail: string;
    notificationEmail: string;
  };
  notifications: {
    orderCreated: boolean;
    orderStatusChanged: boolean;
    paymentReceived: boolean;
    productionStarted: boolean;
    productionCompleted: boolean;
    deliveryReady: boolean;
  };
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof PlatformSettings>("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings/platform");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch platform settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section: keyof PlatformSettings, data: any) => {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setSettings(result.settings);
        alert("Setările au fost salvate cu succes!");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Eroare la salvarea setărilor!");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "business", label: "Business", icon: Building2 },
    { id: "financial", label: "Financiar", icon: DollarSign },
    { id: "email", label: "Email", icon: Mail },
    { id: "notifications", label: "Notificări", icon: Bell },
  ];

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă setările...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Settings className="w-8 h-8 inline mr-2" />
            Setări Platformă
          </h1>
          <p className="text-gray-600">
            Configurează setările generale ale platformei
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as keyof PlatformSettings)}
                  className={`
                    flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap
                    ${activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === "general" && (
              <GeneralSettings
                data={settings.general}
                onSave={(data: PlatformSettings['general']) => saveSettings("general", data)}
                saving={saving}
              />
            )}
            {activeTab === "business" && (
              <BusinessSettings
                data={settings.business}
                onSave={(data: PlatformSettings['business']) => saveSettings("business", data)}
                saving={saving}
              />
            )}
            {activeTab === "financial" && (
              <FinancialSettings
                data={settings.financial}
                onSave={(data: PlatformSettings['financial']) => saveSettings("financial", data)}
                saving={saving}
              />
            )}
            {activeTab === "email" && (
              <EmailSettings
                data={settings.email}
                onSave={(data: PlatformSettings['email']) => saveSettings("email", data)}
                saving={saving}
              />
            )}
            {activeTab === "notifications" && (
              <NotificationSettings
                data={settings.notifications}
                onSave={(data: PlatformSettings['notifications']) => saveSettings("notifications", data)}
                saving={saving}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component pentru General Settings
function GeneralSettings({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nume Platformă
        </label>
        <input
          type="text"
          value={formData.platformName}
          onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Europe/Bucharest">Europe/Bucharest</option>
          <option value="Europe/London">Europe/London</option>
          <option value="America/New_York">America/New_York</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Culoare Primară
          </label>
          <input
            type="color"
            value={formData.brandColors.primary}
            onChange={(e) => setFormData({
              ...formData,
              brandColors: { ...formData.brandColors, primary: e.target.value }
            })}
            className="w-full h-10 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Culoare Secundară
          </label>
          <input
            type="color"
            value={formData.brandColors.secondary}
            onChange={(e) => setFormData({
              ...formData,
              brandColors: { ...formData.brandColors, secondary: e.target.value }
            })}
            className="w-full h-10 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Culoare Accent
          </label>
          <input
            type="color"
            value={formData.brandColors.accent}
            onChange={(e) => setFormData({
              ...formData,
              brandColors: { ...formData.brandColors, accent: e.target.value }
            })}
            className="w-full h-10 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <button
        onClick={() => onSave(formData)}
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {saving ? "Se salvează..." : "Salvează Setările"}
      </button>
    </div>
  );
}

// Componente similare pentru celelalte secțiuni
function BusinessSettings({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nume Companie</label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CUI</label>
          <input
            type="text"
            value={formData.cui}
            onChange={(e) => setFormData({ ...formData, cui: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Adresă</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={() => onSave(formData)}
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {saving ? "Se salvează..." : "Salvează Setările"}
      </button>
    </div>
  );
}

function FinancialSettings({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monedă</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="RON">RON</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TVA (%)</label>
          <input
            type="number"
            value={formData.vat}
            onChange={(e) => setFormData({ ...formData, vat: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={() => onSave(formData)}
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {saving ? "Se salvează..." : "Salvează Setările"}
      </button>
    </div>
  );
}

function EmailSettings({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nume Expeditor</label>
          <input
            type="text"
            value={formData.senderName}
            onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Expeditor</label>
          <input
            type="email"
            value={formData.senderEmail}
            onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={() => onSave(formData)}
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {saving ? "Se salvează..." : "Salvează Setările"}
      </button>
    </div>
  );
}

function NotificationSettings({ data, onSave, saving }: any) {
  const [formData, setFormData] = useState(data);

  const notifications = [
    { key: "orderCreated", label: "Comandă creată" },
    { key: "orderStatusChanged", label: "Status comandă modificat" },
    { key: "paymentReceived", label: "Plată primită" },
    { key: "productionStarted", label: "Producție pornită" },
    { key: "productionCompleted", label: "Producție finalizată" },
    { key: "deliveryReady", label: "Pregătit pentru livrare" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {notifications.map((notif) => (
          <label key={notif.key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData[notif.key]}
              onChange={(e) => setFormData({ ...formData, [notif.key]: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">{notif.label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={() => onSave(formData)}
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {saving ? "Se salvează..." : "Salvează Setările"}
      </button>
    </div>
  );
}
