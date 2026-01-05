import React from 'react';
import { classes } from '@/config/design-system';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-[400px] flex-col items-center justify-center p-8 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className={`${classes.heading.h3} mb-2 text-gray-900`}>{title}</h3>
      {description && (
        <p className={`${classes.text.body} mb-6 max-w-md text-gray-600`}>
          {description}
        </p>
      )}
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

// Preset variants for common scenarios
export function EmptyProjects({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <EmptyState
      icon={
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
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
      title="Niciun proiect încă"
      description="Creează primul tău proiect pentru a începe să lucrezi în editor."
      action={{
        label: 'Creează proiect nou',
        onClick: onCreateProject,
      }}
    />
  );
}

export function EmptyFiles() {
  return (
    <EmptyState
      icon={
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
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      }
      title="Niciun fișier salvat"
      description="Fișierele tale încărcate în configurator vor apărea aici pentru utilizare rapidă."
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      }
      title="Nicio comandă încă"
      description="Comenzile tale vor apărea aici după finalizarea procesului de checkout."
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      }
      title="Nicio notificare"
      description="Când vei primi notificări, acestea vor apărea aici."
    />
  );
}

export function EmptySearch({ query }: { query: string }) {
  return (
    <EmptyState
      icon={
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="Niciun rezultat"
      description={`Nu am găsit rezultate pentru "${query}". Încearcă alt termen de căutare.`}
    />
  );
}
