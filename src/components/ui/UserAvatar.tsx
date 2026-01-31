import React from 'react';

interface UserAvatarProps {
  name?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * UserAvatar - Text-based avatar showing user initials
 * Features:
 * - Displays first two letters from name
 * - Round shape with contrasting background
 * - Responsive sizes
 * - Accessible
 */
export function UserAvatar({ name, className = '', size = 'md' }: UserAvatarProps) {
  // Generate initials from name
  const getInitials = (fullName?: string | null): string => {
    if (!fullName) return 'U';
    
    const parts = fullName.trim().split(/\s+/);
    
    if (parts.length === 0) return 'U';
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  // Size variants
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-primary
        text-white
        font-semibold
        flex
        items-center
        justify-center
        select-none
        ${className}
      `}
      aria-label={`Avatar for ${name || 'User'}`}
      title={name || 'User'}
    >
      {initials}
    </div>
  );
}
