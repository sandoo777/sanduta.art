"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  AlertTriangle,
  CheckCircle,
  Shield,
  Key,
} from "lucide-react";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  ipRestrictions: string[];
  sessionTimeout: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  loginAttempts: {
    maxAttempts: number;
    lockoutDuration: number;
  };
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    ipRestrictions: [],
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90,
    },
    loginAttempts: {
      maxAttempts: 5,
      lockoutDuration: 15,
    },
  });

  const [newIp, setNewIp] = useState("");
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    try {
      setSaving(true);
      // API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Setările de securitate au fost salvate!");
    } catch (error) {
      console.error("Failed to save security settings:", error);
      alert("Eroare la salvarea setărilor!");
    } finally {
      setSaving(false);
    }
  };

  const addIpRestriction = () => {
    if (newIp && !settings.ipRestrictions.includes(newIp)) {
      setSettings({
        ...settings,
        ipRestrictions: [...settings.ipRestrictions, newIp],
      });
      setNewIp("");
    }
  };

  const removeIpRestriction = (ip: string) => {
    setSettings({
      ...settings,
      ipRestrictions: settings.ipRestrictions.filter(i => i !== ip),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <Lock className="w-8 h-8 inline mr-2" />
            Setări Securitate
          </h1>
          <p className="text-gray-600">
            Configurează setările de securitate și autentificare
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Atenție: Setări Critice de Securitate
              </h3>
              <p className="text-sm text-red-800">
                Modificările în această secțiune pot afecta accesul utilizatorilor la platformă.
                Asigură-te că înțelegi impactul fiecărei modificări înainte de a o aplica.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  <Shield className="w-5 h-5 inline mr-2" />
                  Autentificare cu Doi Factori (2FA)
                </h2>
                <p className="text-sm text-gray-600">
                  Solicită utilizatorilor să folosească autentificarea în doi pași pentru acces suplimentar de securitate.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorEnabled}
                  onChange={(e) => setSettings({ ...settings, twoFactorEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {settings.twoFactorEnabled && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">2FA este activat pentru toți administratorii</span>
                </div>
              </div>
            )}
          </div>

          {/* Session Timeout */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Timeout Sesiune
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Durata de inactivitate după care sesiunea utilizatorului expiră automat.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="5"
                max="1440"
              />
              <span className="text-gray-700">minute</span>
            </div>
          </div>

          {/* IP Restrictions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Restricții IP
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Permite accesul doar de la adrese IP specifice (whitelist).
            </p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="192.168.1.1"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addIpRestriction}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Adaugă IP
              </button>
            </div>

            {settings.ipRestrictions.length > 0 ? (
              <div className="space-y-2">
                {settings.ipRestrictions.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm text-gray-900">{ip}</code>
                    <button
                      onClick={() => removeIpRestriction(ip)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Șterge
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nu sunt configurate restricții IP. Accesul este permis de la orice adresă IP.
              </p>
            )}
          </div>

          {/* Password Policy */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <Key className="w-5 h-5 inline mr-2" />
              Politică Parole
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Setează cerințele pentru parolele utilizatorilor.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lungime minimă
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordPolicy: { ...settings.passwordPolicy, minLength: parseInt(e.target.value) }
                  })}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="6"
                  max="32"
                />
                <span className="ml-2 text-gray-600">caractere</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireUppercase}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: { ...settings.passwordPolicy, requireUppercase: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Necesită litere mari (A-Z)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireLowercase}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: { ...settings.passwordPolicy, requireLowercase: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Necesită litere mici (a-z)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireNumbers}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: { ...settings.passwordPolicy, requireNumbers: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Necesită cifre (0-9)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireSpecialChars}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: { ...settings.passwordPolicy, requireSpecialChars: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Necesită caractere speciale (!@#$%^&*)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expirare parolă după
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.expiryDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordPolicy: { ...settings.passwordPolicy, expiryDays: parseInt(e.target.value) }
                  })}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="365"
                />
                <span className="ml-2 text-gray-600">zile (0 = niciodată)</span>
              </div>
            </div>
          </div>

          {/* Login Attempts */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Protecție Brute Force
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Blochează accesul după un număr maxim de încercări eșuate de autentificare.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Număr maxim de încercări
                </label>
                <input
                  type="number"
                  value={settings.loginAttempts.maxAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    loginAttempts: { ...settings.loginAttempts, maxAttempts: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="3"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durată blocare (minute)
                </label>
                <input
                  type="number"
                  value={settings.loginAttempts.lockoutDuration}
                  onChange={(e) => setSettings({
                    ...settings,
                    loginAttempts: { ...settings.loginAttempts, lockoutDuration: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="1440"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield className="w-5 h-5" />
              {saving ? "Se salvează..." : "Salvează Setările de Securitate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
