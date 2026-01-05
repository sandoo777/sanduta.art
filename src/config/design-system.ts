/**
 * Design System Configuration
 * Uniformizare completă pentru UX/UI
 */

export const designSystem = {
  // Spacing Scale (8px base)
  spacing: {
    xs: '8px',    // 0.5rem
    sm: '12px',   // 0.75rem
    md: '16px',   // 1rem
    lg: '24px',   // 1.5rem
    xl: '32px',   // 2rem
    '2xl': '48px', // 3rem
    '3xl': '64px', // 4rem
  },

  // Typography Scale
  typography: {
    h1: {
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 700,
    },
    h2: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 600,
    },
    h3: {
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: 600,
    },
    body: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 400,
    },
    small: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
    },
    caption: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
    },
  },

  // Border Radius
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Colors (extend Tailwind defaults)
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
    },
  },
} as const;

// CSS Custom Properties for use in components
export const cssVariables = `
  --spacing-xs: ${designSystem.spacing.xs};
  --spacing-sm: ${designSystem.spacing.sm};
  --spacing-md: ${designSystem.spacing.md};
  --spacing-lg: ${designSystem.spacing.lg};
  --spacing-xl: ${designSystem.spacing.xl};
  
  --font-size-h1: ${designSystem.typography.h1.fontSize};
  --font-size-h2: ${designSystem.typography.h2.fontSize};
  --font-size-h3: ${designSystem.typography.h3.fontSize};
  --font-size-body: ${designSystem.typography.body.fontSize};
  --font-size-small: ${designSystem.typography.small.fontSize};
  
  --transition-fast: ${designSystem.transitions.fast};
  --transition-base: ${designSystem.transitions.base};
  --transition-slow: ${designSystem.transitions.slow};
`;

// Tailwind utility classes mapping
export const classes = {
  // Spacing utilities
  spacing: {
    xs: 'p-2',      // 8px
    sm: 'p-3',      // 12px
    md: 'p-4',      // 16px
    lg: 'p-6',      // 24px
    xl: 'p-8',      // 32px
  },
  
  // Card styles
  card: {
    base: 'rounded-lg bg-white shadow-sm border border-gray-200',
    hover: 'transition-all duration-200 hover:shadow-md hover:border-gray-300',
    padding: 'p-6', // 24px
  },

  // Button styles
  button: {
    base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizes: {
      sm: 'px-3 py-1.5 text-sm', // 12px/6px, 14px text
      md: 'px-4 py-2 text-base',  // 16px/8px, 16px text
      lg: 'px-6 py-3 text-base',  // 24px/12px, 16px text
    },
    variants: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    },
  },

  // Input styles
  input: {
    base: 'block w-full rounded-lg border border-gray-300 px-4 py-2 text-base transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
    disabled: 'cursor-not-allowed bg-gray-100 text-gray-500',
  },

  // Typography
  heading: {
    h1: 'text-[32px] font-bold leading-[40px]',
    h2: 'text-2xl font-semibold leading-8',
    h3: 'text-xl font-semibold leading-7',
  },
  text: {
    body: 'text-base leading-6',
    small: 'text-sm leading-5',
    caption: 'text-xs leading-4',
  },
} as const;
