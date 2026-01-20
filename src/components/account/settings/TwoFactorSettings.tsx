'use client';

import { useState, useEffect } from 'react';
import { useSecurity } from '@/modules/account/useSecurity';
import { useSession } from 'next-auth/react';
import { 
  ShieldCheckIcon, 
  QrCodeIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function TwoFactorSettings() {
  const { data: session } = useSession();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { generate2FA, enable2FA, disable2FA, twoFactorSetup, loading } = useSecurity();

  // Check if 2FA is enabled (would need to add this to session or fetch from API)
  useEffect(() => {
    // TODO: Fetch 2FA status from API
    // setIs2FAEnabled(user.twoFactorEnabled);
  }, []);

  const handleStartSetup = async () => {
    setMessage(null);
    try {
      await generate2FA();
      setShowSetup(true);
    } catch (_error: unknown) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!twoFactorSetup || !verificationCode) {
      setMessage({ type: 'error', text: 'Completează codul de verificare' });
      return;
    }

    try {
      const result = await enable2FA(
        twoFactorSetup.secret,
        verificationCode,
        twoFactorSetup.backupCodes
      );
      setMessage({ type: 'success', text: result.message });
      setIs2FAEnabled(true);
      setShowSetup(false);
      setVerificationCode('');
      setShowBackupCodes(true);
    } catch (_error: unknown) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!disableCode) {
      setMessage({ type: 'error', text: 'Introdu codul de verificare' });
      return;
    }

    try {
      const result = await disable2FA(disableCode);
      setMessage({ type: 'success', text: result.message });
      setIs2FAEnabled(false);
      setDisableCode('');
    } catch (_error: unknown) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadBackupCodes = () => {
    if (!twoFactorSetup) return;
    
    const blob = new Blob(
      [twoFactorSetup.backupCodes.join('\n')],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanduta-art-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <ShieldCheckIcon className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Autentificare în doi pași</h3>
          <p className="text-sm text-gray-600">
            Adaugă un nivel suplimentar de securitate contului tău
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {is2FAEnabled ? (
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <p className="font-medium text-gray-900">
              {is2FAEnabled ? '2FA Activat' : '2FA Dezactivat'}
            </p>
            <p className="text-sm text-gray-600">
              {is2FAEnabled
                ? 'Contul tău este protejat cu autentificare în doi pași'
                : 'Contul tău nu este protejat cu 2FA'}
            </p>
          </div>
        </div>
        {!is2FAEnabled && !showSetup && (
          <button
            onClick={handleStartSetup}
            disabled={loading}
            className="px-4 py-2 bg-[#0066FF] text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Activează 2FA
          </button>
        )}
      </div>

      {/* Setup 2FA */}
      {showSetup && twoFactorSetup && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Pasul 1: Scanează QR Code</h4>
            <p className="text-sm text-blue-800 mb-4">
              Folosește Google Authenticator, Authy sau o aplicație similară pentru a scana acest cod:
            </p>
            <div className="flex justify-center mb-4">
              <img
                src={twoFactorSetup.qrCode}
                alt="QR Code"
                className="w-48 h-48 border-4 border-white rounded-lg shadow-lg"
              />
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Sau introdu manual:</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono text-gray-900 break-all">
                  {twoFactorSetup.secret}
                </code>
                <button
                  onClick={() => copyToClipboard(twoFactorSetup.secret, 'secret')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                >
                  <DocumentDuplicateIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {copiedCode === 'secret' && (
                <p className="text-xs text-green-600 mt-1">✓ Copiat!</p>
              )}
            </div>
          </div>

          <form onSubmit={handleEnable2FA} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pasul 2: Introdu codul de verificare
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                placeholder="123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent text-center text-2xl tracking-widest font-mono"
                required
              />
              <p className="mt-2 text-sm text-gray-600">
                Introdu codul din aplicația ta de autentificare
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h5 className="font-semibold text-yellow-900 mb-2">Coduri de backup</h5>
              <p className="text-sm text-yellow-800 mb-3">
                Salvează aceste coduri într-un loc sigur. Le poți folosi pentru a accesa contul dacă pierzi accesul la aplicația de autentificare.
              </p>
              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded">
                {twoFactorSetup.backupCodes.map((code, i) => (
                  <code key={i} className="text-sm font-mono text-gray-900">
                    {code}
                  </code>
                ))}
              </div>
              <button
                type="button"
                onClick={downloadBackupCodes}
                className="mt-3 text-sm text-[#0066FF] hover:underline font-medium"
              >
                Descarcă codurile de backup
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full px-4 py-2 bg-[#0066FF] text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Se procesează...' : 'Activează 2FA'}
            </button>
          </form>
        </div>
      )}

      {/* Disable 2FA */}
      {is2FAEnabled && !showSetup && (
        <form onSubmit={handleDisable2FA} className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">Dezactivează 2FA</h4>
            <p className="text-sm text-red-800 mb-4">
              Acest lucru va reduce securitatea contului tău. Introdu codul de verificare pentru a continua.
            </p>
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || disableCode.length !== 6}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Se procesează...' : 'Dezactivează 2FA'}
          </button>
        </form>
      )}

      {/* Message */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
