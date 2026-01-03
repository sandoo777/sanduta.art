import React from 'react';

export interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  subtitle,
  className = '',
  size = 'lg',
  align = 'left',
}) => {
  const sizeStyles = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`mb-6 ${alignStyles[align]} ${className}`}>
      <h2 className={`${sizeStyles[size]} font-bold text-gray-900 mb-2`}>
        {children}
      </h2>
      {subtitle && (
        <p className="text-gray-600 text-base mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export interface PageTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  children,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        {children}
      </h1>
      {subtitle && (
        <p className="text-gray-600 text-lg mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};
