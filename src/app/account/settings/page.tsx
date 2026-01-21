'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/modules/auth/useCurrentUser';
import { Card, Button, Input, LoadingState } from '@/components/ui';
import { Lock, Bell, Globe, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password settings
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    productionUpdates: true,
    newsletter: false,
    promotions: false,
  });

  // Language & regional settings
  const [preferences, setPreferences] = useState({
    language: 'ro',
    currency: 'RON',
    timezone: 'Europe/Bucharest',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Parolele nu se potrivesc!');
      return;
    }

    if (passwords.newPassword.length < 8) {
      alert('Parola trebuie să aibă cel puțin 8 caractere!');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/account/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (_error: unknown) {
      console.error('Error changing password:', error);
      alert(error.message || 'Eroare la schimbarea parolei');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsUpdate = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/account/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications),
      });

      if (!response.ok) throw new Error('Failed to update notifications');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (_error) {
      console.error('Error updating notifications:', error);
      alert('Eroare la actualizarea preferințelor de notificare');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/account/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to update preferences');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (_error) {
      console.error('Error updating preferences:', error);
      alert('Eroare la actualizarea preferințelor');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <LoadingState text="Se încarcă setările..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Setări Cont</h1>
        <p className="text-gray-600 mt-2">
          Gestionează setările de securitate și preferințele contului
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Setările au fost actualizate cu succes!
        </div>
      )}

      {/* Password Change */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-red-100">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Schimbă Parola
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parola Actuală *
            </label>
            <Input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parola Nouă *
            </label>
            <Input
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
              placeholder="••••••••"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minim 8 caractere
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmă Parola Nouă *
            </label>
            <Input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Schimbă Parola
            </Button>
          </div>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-100">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Preferințe Notificări
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Actualizări Comenzi</p>
              <p className="text-sm text-gray-600">
                Primește notificări când comanda ta se actualizează
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.orderUpdates}
              onChange={(e) =>
                setNotifications({ ...notifications, orderUpdates: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Actualizări Producție</p>
              <p className="text-sm text-gray-600">
                Notificări despre progresul producției comenzii
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.productionUpdates}
              onChange={(e) =>
                setNotifications({ ...notifications, productionUpdates: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Newsletter</p>
              <p className="text-sm text-gray-600">
                Primește buletine informative cu știri și sfaturi
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.newsletter}
              onChange={(e) =>
                setNotifications({ ...notifications, newsletter: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Promoții</p>
              <p className="text-sm text-gray-600">
                Notificări despre oferte speciale și reduceri
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.promotions}
              onChange={(e) =>
                setNotifications({ ...notifications, promotions: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleNotificationsUpdate}
              variant="primary"
              loading={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvează Preferințe
            </Button>
          </div>
        </div>
      </Card>

      {/* Language & Regional Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-green-100">
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Limbă și Regiune
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limbă
            </label>
            <select
              value={preferences.language}
              onChange={(e) =>
                setPreferences({ ...preferences, language: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ro">Română</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monedă
            </label>
            <select
              value={preferences.currency}
              onChange={(e) =>
                setPreferences({ ...preferences, currency: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="RON">RON (Leu românesc)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="USD">USD (Dolar american)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fus Orar
            </label>
            <select
              value={preferences.timezone}
              onChange={(e) =>
                setPreferences({ ...preferences, timezone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Europe/Bucharest">Bucharest (GMT+2)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="America/New_York">New York (GMT-5)</option>
            </select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handlePreferencesUpdate}
              variant="primary"
              loading={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvează Preferințe
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
