import React from 'react';
import { classes } from '@/config/design-system';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingState({
  size = 'md',
  text,
  className = '',
}: LoadingStateProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div
      className={`flex min-h-[200px] flex-col items-center justify-center p-8 ${className}`}
    >
      <div
        className={`${sizes[size]} animate-spin rounded-full border-b-2 border-blue-600`}
        role="status"
        aria-label="Se încarcă"
      />
      {text && (
        <p className={`${classes.text.body} mt-4 text-gray-600`}>{text}</p>
      )}
    </div>
  );
}

// Skeleton loaders pentru diferite scenarii
export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
      <div className="mt-3 h-3 w-1/2 rounded bg-gray-200"></div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 w-20 rounded bg-gray-200"></div>
        <div className="h-8 w-20 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 flex-1 rounded bg-gray-200"></div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse p-4">
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 flex-1 rounded bg-gray-100"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading specific pentru pagini
export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState size="lg" text="Se încarcă..." />
    </div>
  );
}

export function LoadingCanvas() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingState size="lg" />
        <p className={`${classes.text.small} mt-4 text-gray-600`}>
          Se încarcă canvas-ul...
        </p>
      </div>
    </div>
  );
}

export function LoadingProducts() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
