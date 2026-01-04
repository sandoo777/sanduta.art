// Admin Panel Routes Configuration
// This file documents all available routes in the admin panel

export const ADMIN_ROUTES = {
  // Main dashboard
  ROOT: '/admin',
  
  // Analytics & Overview
  DASHBOARD: '/admin/dashboard',
  REPORTS: '/admin/reports',
  
  // E-commerce Management
  ORDERS: '/admin/orders',
  PRODUCTS: '/admin/products',
  CATEGORIES: '/admin/categories',
  
  // Customer Management
  CUSTOMERS: '/admin/customers',
  USERS: '/admin/users',
  
  // Production & Inventory
  PRODUCTION: '/admin/production',
  MATERIALS: '/admin/materials',
  
  // Configuration
  SETTINGS: '/admin/settings',
  PAGES: '/admin/pages',
} as const;

// Navigation items for sidebar
export const ADMIN_NAVIGATION = [
  {
    name: 'Dashboard',
    href: ADMIN_ROUTES.DASHBOARD,
    description: 'View analytics and KPIs',
    status: 'ready', // ready | in-progress | planned
  },
  {
    name: 'Orders',
    href: ADMIN_ROUTES.ORDERS,
    description: 'Manage customer orders',
    status: 'planned',
  },
  {
    name: 'Products',
    href: ADMIN_ROUTES.PRODUCTS,
    description: 'Product catalog management',
    status: 'ready',
  },
  {
    name: 'Categories',
    href: ADMIN_ROUTES.CATEGORIES,
    description: 'Organize products',
    status: 'ready',
  },
  {
    name: 'Customers',
    href: ADMIN_ROUTES.CUSTOMERS,
    description: 'Customer database',
    status: 'planned',
  },
  {
    name: 'Production',
    href: ADMIN_ROUTES.PRODUCTION,
    description: 'Production workflow',
    status: 'planned',
  },
  {
    name: 'Materials',
    href: ADMIN_ROUTES.MATERIALS,
    description: 'Inventory management',
    status: 'planned',
  },
  {
    name: 'Reports',
    href: ADMIN_ROUTES.REPORTS,
    description: 'Business reports',
    status: 'planned',
  },
  {
    name: 'Settings',
    href: ADMIN_ROUTES.SETTINGS,
    description: 'Site configuration',
    status: 'ready',
  },
] as const;

// Permission levels
export const ADMIN_PERMISSIONS = {
  ADMIN: ['*'], // Full access
  MANAGER: [
    ADMIN_ROUTES.DASHBOARD,
    ADMIN_ROUTES.ORDERS,
    ADMIN_ROUTES.CUSTOMERS,
    ADMIN_ROUTES.REPORTS,
  ],
  OPERATOR: [
    ADMIN_ROUTES.ORDERS,
    ADMIN_ROUTES.PRODUCTION,
  ],
} as const;
