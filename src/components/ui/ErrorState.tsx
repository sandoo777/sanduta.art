import React from 'react';
import { classes } from '@/config/design-system';

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'A apărut o eroare',
  message,
  retry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex min-h-[400px] flex-col items-center justify-center p-8 text-center ${className}`}
      role="alert"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg
          className="h-8 w-8"
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
      </div>
      <h3 className={`${classes.heading.h3} mb-2 text-gray-900`}>{title}</h3>
      <p className={`${classes.text.body} mb-6 max-w-md text-gray-600`}>
        {message}
      </p>
      {retry && (
        <button
          onClick={retry}
          className={`${classes.button.base} ${classes.button.sizes.md} ${classes.button.variants.primary}`}
        >
          Încearcă din nou
        </button>
      )}
    </div>
  );
}

// Preset errors
export function ErrorNetwork({ retry }: { retry?: () => void }) {
  return (
    <ErrorState
      title="Eroare de conexiune"
      message="Nu s-a putut stabili conexiunea cu serverul. Verifică conexiunea la internet și încearcă din nou."
      retry={retry}
    />
  );
}

export function Error404() {
  return (
    <ErrorState
      title="Pagină negăsită"
      message="Pagina pe care o cauți nu există sau a fost mutată."
    />
  );
}

export function Error403() {
  return (
    <ErrorState
      title="Acces interzis"
      message="Nu ai permisiunea de a accesa această resursă."
    />
  );
}

export function ErrorGeneric({ retry }: { retry?: () => void }) {
  return (
    <ErrorState
      title="Ceva nu a mers bine"
      message="A apărut o eroare neașteptată. Te rugăm să încerci din nou."
      retry={retry}
    />
  );
}

// Inline error pentru formulare
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 ${className}`}
      role="alert"
    >
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
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
      <p className={`${classes.text.small} text-red-800`}>{message}</p>
    </div>
  );
}

// Success state pentru feedback pozitiv
interface SuccessStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SuccessState({
  title = 'Succes',
  message,
  action,
  className = '',
}: SuccessStateProps) {
  return (
    <div
      className={`flex min-h-[400px] flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h3 className={`${classes.heading.h3} mb-2 text-gray-900`}>{title}</h3>
      <p className={`${classes.text.body} mb-6 max-w-md text-gray-600`}>
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={`${classes.button.base} ${classes.button.sizes.md} ${classes.button.variants.primary}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
