/**
 * Confirmation Dialog pentru acțiuni critice
 */

import React, { useState } from 'react';
import { classes } from '@/config/design-system';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  requireConfirmation?: boolean; // Necesită tastare "CONFIRM"
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Anulează',
  variant = 'warning',
  requireConfirmation = false,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireConfirmation && confirmationText !== 'CONFIRM') {
      return;
    }

    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setLoading(false);
      setConfirmationText('');
    }
  };

  const variantStyles = {
    danger: {
      icon: 'text-red-600 bg-red-100',
      button: classes.button.variants.danger,
    },
    warning: {
      icon: 'text-yellow-600 bg-yellow-100',
      button: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    },
    info: {
      icon: 'text-blue-600 bg-blue-100',
      button: classes.button.variants.primary,
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Icon */}
        <div className="p-6">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${style.icon}`}>
            {variant === 'danger' ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="mt-4 text-center">
            <h3
              id="dialog-title"
              className={`${classes.heading.h3} text-gray-900`}
            >
              {title}
            </h3>
            <p className={`${classes.text.body} mt-2 text-gray-600`}>
              {message}
            </p>

            {/* Confirmation input */}
            {requireConfirmation && (
              <div className="mt-4">
                <label className={`${classes.text.small} block text-left text-gray-700 mb-2`}>
                  Tastează <strong>CONFIRM</strong> pentru a continua:
                </label>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className={classes.input.base}
                  placeholder="CONFIRM"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`${classes.button.base} ${classes.button.sizes.md} ${classes.button.variants.outline} flex-1`}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || (requireConfirmation && confirmationText !== 'CONFIRM')}
              className={`${classes.button.base} ${classes.button.sizes.md} ${style.button} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Se procesează...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook pentru confirmare acțiuni
 */
export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'info';
    requireConfirmation?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const confirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'danger' | 'warning' | 'info';
    requireConfirmation?: boolean;
  }) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        ...options,
        isOpen: true,
        onConfirm: async () => {
          await options.onConfirm();
          resolve(true);
        },
      });
    });
  };

  const close = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const DialogComponent = () => (
    <ConfirmDialog
      isOpen={dialog.isOpen}
      onClose={close}
      onConfirm={dialog.onConfirm}
      title={dialog.title}
      message={dialog.message}
      variant={dialog.variant}
      requireConfirmation={dialog.requireConfirmation}
    />
  );

  return { confirm, Dialog: DialogComponent };
}

/**
 * Presets pentru acțiuni comune
 */
export const confirmPresets = {
  deleteProject: {
    title: 'Șterge proiect',
    message: 'Ești sigur că vrei să ștergi acest proiect? Această acțiune este ireversibilă.',
    variant: 'danger' as const,
    requireConfirmation: false,
  },
  deleteFile: {
    title: 'Șterge fișier',
    message: 'Fișierul va fi șters permanent. Această acțiune nu poate fi anulată.',
    variant: 'danger' as const,
  },
  deleteOrder: {
    title: 'Șterge comandă',
    message: 'Atenție! Această comandă și toate datele asociate vor fi șterse permanent.',
    variant: 'danger' as const,
    requireConfirmation: true,
  },
  changeUserRole: {
    title: 'Schimbă rol utilizator',
    message: 'Schimbarea rolului va modifica permisiunile utilizatorului în sistem.',
    variant: 'warning' as const,
  },
  revokeSession: {
    title: 'Revocă sesiune',
    message: 'Utilizatorul va fi deconectat imediat din această sesiune.',
    variant: 'warning' as const,
  },
  deleteUser: {
    title: 'Șterge utilizator',
    message: 'Utilizatorul și toate datele asociate vor fi șterse permanent. Tastează CONFIRM pentru a continua.',
    variant: 'danger' as const,
    requireConfirmation: true,
  },
};
