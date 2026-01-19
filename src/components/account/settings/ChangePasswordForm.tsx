'use client';

import { useState } from 'react';
import { useSecurity } from '@/modules/account/useSecurity';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { changePassword, loading } = useSecurity();

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push('minim 8 caractere');
    if (!/[A-Z]/.test(password)) errors.push('o literă mare');
    if (!/[a-z]/.test(password)) errors.push('o literă mică');
    if (!/\d/.test(password)) errors.push('o cifră');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('un simbol special');
    return errors;
  };

  const passwordErrors = newPassword ? validatePassword(newPassword) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Parolele nu se potrivesc' });
      return;
    }

    if (passwordErrors.length > 0) {
      setMessage({ type: 'error', text: 'Parola nu îndeplinește cerințele de securitate' });
      return;
    }

    try {
      const result = await changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: result.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error.message || 'A apărut o eroare' });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <LockClosedIcon className="w-5 h-5 text-[#0066FF]" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Schimbă parola</h3>
          <p className="text-sm text-gray-600">Actualizează-ți parola pentru mai multă securitate</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parola actuală
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrent ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parola nouă
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNew ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {newPassword && passwordErrors.length > 0 && (
            <div className="mt-2 text-sm text-red-600">
              <p className="font-medium">Parola trebuie să conțină:</p>
              <ul className="list-disc list-inside mt-1">
                {passwordErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {newPassword && passwordErrors.length === 0 && (
            <p className="mt-2 text-sm text-green-600">✓ Parolă puternică</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmă parola nouă
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="mt-2 text-sm text-red-600">Parolele nu se potrivesc</p>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || passwordErrors.length > 0 || newPassword !== confirmPassword}
          className="w-full px-4 py-2 bg-[#0066FF] text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Se procesează...' : 'Schimbă parola'}
        </button>
      </form>
    </div>
  );
}
