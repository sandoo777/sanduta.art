import { Metadata } from 'next';
import ChangePasswordForm from '@/components/account/settings/ChangePasswordForm';
import TwoFactorSettings from '@/components/account/settings/TwoFactorSettings';
import ActiveSessions from '@/components/account/settings/ActiveSessions';
import RecentActivity from '@/components/account/settings/RecentActivity';
import RevokeAccess from '@/components/account/settings/RevokeAccess';

export const metadata: Metadata = {
  title: 'Setări de securitate - Sanduta.art',
  description: 'Gestionează setările de securitate ale contului tău'
};

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Setări de securitate</h1>
        <p className="text-gray-600">
          Gestionează securitatea contului tău și protejează-ți datele personale
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Change Password */}
          <ChangePasswordForm />

          {/* Two-Factor Authentication */}
          <TwoFactorSettings />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Sessions */}
          <ActiveSessions />

          {/* Revoke Access */}
          <RevokeAccess />
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-6">
        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Sfaturi de securitate</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>
              <strong>Folosește o parolă puternică:</strong> Minim 8 caractere cu litere mari, 
              mici, cifre și simboluri.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>
              <strong>Activează autentificarea în doi pași:</strong> Adaugă un nivel suplimentar 
              de protecție contului tău.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>
              <strong>Verifică sesiunile active:</strong> Revizuiește periodic dispozitivele 
              conectate la contul tău.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>
              <strong>Monitorizează activitatea:</strong> Verifică istoricul pentru activități 
              suspecte.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>
              <strong>Nu partaja parolele:</strong> Niciodată nu împărtăși parolele sau codurile 
              de autentificare cu alte persoane.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
