import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// Специализированный компонент для статусов заказов
export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig: {
    [key: string]: { variant: BadgeProps['variant']; label: string };
  } = {
    pending: { variant: 'warning', label: 'В ожидании' },
    processing: { variant: 'info', label: 'В обработке' },
    completed: { variant: 'success', label: 'Завершен' },
    cancelled: { variant: 'danger', label: 'Отменен' },
    paid: { variant: 'success', label: 'Оплачен' },
    failed: { variant: 'danger', label: 'Ошибка' },
    shipped: { variant: 'info', label: 'Отправлен' },
    delivered: { variant: 'success', label: 'Доставлен' },
  };

  const config = statusConfig[status.toLowerCase()] || {
    variant: 'default' as const,
    label: status,
  };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
