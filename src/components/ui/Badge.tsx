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
  // Mapping complet pentru toate statusurile din Prisma schema
  const statusConfig: {
    [key: string]: { variant: BadgeProps['variant']; label: string };
  } = {
    // Order Status
    'PENDING': { variant: 'warning', label: 'În așteptare' },
    'IN_DESIGN': { variant: 'info', label: 'În design' },
    'IN_PREPRODUCTION': { variant: 'info', label: 'Preproducție' },
    'IN_PRODUCTION': { variant: 'primary', label: 'În producție' },
    'IN_PRINTING': { variant: 'primary', label: 'Se printează' },
    'QUALITY_CHECK': { variant: 'primary', label: 'Verificare calitate' },
    'READY_FOR_DELIVERY': { variant: 'success', label: 'Gata livrare' },
    'SHIPPED': { variant: 'info', label: 'Expediat' },
    'DELIVERED': { variant: 'success', label: 'Livrat' },
    'CANCELLED': { variant: 'danger', label: 'Anulat' },
    
    // Payment Status
    'UNPAID': { variant: 'warning', label: 'Neplătit' },
    'PAID': { variant: 'success', label: 'Plătit' },
    'REFUNDED': { variant: 'info', label: 'Refund' },
    'FAILED': { variant: 'danger', label: 'Plată eșuată' },
    
    // Delivery Status
    'NOT_SHIPPED': { variant: 'default', label: 'Neexpediat' },
    'OUT_FOR_DELIVERY': { variant: 'info', label: 'În livrare' },
    
    // Legacy/fallback
    'pending': { variant: 'warning', label: 'În așteptare' },
    'processing': { variant: 'info', label: 'În procesare' },
    'completed': { variant: 'success', label: 'Finalizat' },
    'cancelled': { variant: 'danger', label: 'Anulat' },
    'paid': { variant: 'success', label: 'Plătit' },
    'failed': { variant: 'danger', label: 'Eșuat' },
    'shipped': { variant: 'info', label: 'Expediat' },
    'delivered': { variant: 'success', label: 'Livrat' },
  };

  const config = statusConfig[status] || statusConfig[status.toLowerCase()] || {
    variant: 'default' as const,
    label: status,
  };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
