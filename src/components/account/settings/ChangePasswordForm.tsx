'use client';

import { useState } from 'react';
import { useSecurity } from '@/modules/account/useSecurity';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui';
import { Form } from '@/components/ui/Form';
import { FormField } from '@/components/ui/FormField';
import { FormLabel } from '@/components/ui/FormLabel';
import { FormMessage } from '@/components/ui/FormMessage';
import { changePasswordSchema, type ChangePasswordFormData, getPasswordStrengthDetails } from '@/lib/validations/user-panel';

export default function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  const { changePassword, loading } = useSecurity();

  const handleSubmit = async (data: ChangePasswordFormData) => {
    setMessage(null);

    try {
      const result = await changePassword(data.currentPassword, data.newPassword);
      setMessage({ type: 'success', text: result.message });
    } catch (error: unknown) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'A apărut o eroare' });
    }
  };

  const passwordStrength = newPasswordValue ? getPasswordStrengthDetails(newPasswordValue) : null;

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

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <Form<ChangePasswordFormData>
        schema={changePasswordSchema}
        onSubmit={handleSubmit}
        defaultValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
        className="space-y-4"
      >
        {/* Current Password */}
        <FormField<ChangePasswordFormData> name="currentPassword">
          {({ value, onChange, onBlur, error }) => (
            <div>
              <FormLabel htmlFor="currentPassword" required>Parola actuală</FormLabel>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="Parola actuală"
                  className="pr-10"
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
              <FormMessage error={error} />
            </div>
          )}
        </FormField>

        {/* New Password */}
        <FormField<ChangePasswordFormData> name="newPassword">
          {({ value, onChange, onBlur, error }) => (
            <div>
              <FormLabel htmlFor="newPassword" required>Parola nouă</FormLabel>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => { onChange(e); setNewPasswordValue(e.target.value); }}
                  onBlur={onBlur}
                  error={error}
                  placeholder="Minim 8 caractere"
                  className="pr-10"
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
              <FormMessage error={error} />
              
              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${passwordStrength.color}`} 
                        style={{ width: `${(passwordStrength.strength / 4) * 100}%` }} 
                      />
                    </div>
                    <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="text-xs space-y-1">
                    <div className={passwordStrength.checks.minLength ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.minLength ? '✓' : '○'} Minim 8 caractere
                    </div>
                    <div className={passwordStrength.checks.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.hasUppercase ? '✓' : '○'} O literă mare
                    </div>
                    <div className={passwordStrength.checks.hasLowercase ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.hasLowercase ? '✓' : '○'} O literă mică
                    </div>
                    <div className={passwordStrength.checks.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.hasNumber ? '✓' : '○'} O cifră
                    </div>
                    <div className={passwordStrength.checks.hasSpecial ? 'text-green-600' : 'text-gray-500'}>
                      {passwordStrength.checks.hasSpecial ? '✓' : '○'} Un simbol special
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </FormField>

        {/* Confirm Password */}
        <FormField<ChangePasswordFormData> name="confirmPassword">
          {({ value, onChange, onBlur, error }) => (
            <div>
              <FormLabel htmlFor="confirmPassword" required>Confirmă parola nouă</FormLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="Reintroduceți parola"
                  className="pr-10"
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
              <FormMessage error={error} />
            </div>
          )}
        </FormField>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-[#0066FF] text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Se procesează...' : 'Schimbă parola'}
        </button>
      </Form>
    </div>
  );
}
