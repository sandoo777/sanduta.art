'use client';

import React from 'react';

interface FormMessageProps {
  error?: string;
  className?: string;
  type?: 'error' | 'success' | 'info';
}

export function FormMessage({
  error,
  className = '',
  type = 'error',
}: FormMessageProps) {
  if (!error) return null;

  const typeStyles = {
    error: 'text-red-600 bg-red-50 border-red-200',
    success: 'text-green-600 bg-green-50 border-green-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  return (
    <p
      className={`text-sm mt-1 ${typeStyles[type]} ${className}`}
      role="alert"
    >
      {error}
    </p>
  );
}
