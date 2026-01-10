import { UserRole } from "@prisma/client";

/**
 * Sistema de permisiuni pentru platforma sanduta.art
 * Gestionează permisiunile granulare bazate pe roluri
 */

// Tipuri de permisiuni disponibile în sistem
export enum Permission {
  // Products
  VIEW_PRODUCTS = "view_products",
  CREATE_PRODUCTS = "create_products",
  EDIT_PRODUCTS = "edit_products",
  DELETE_PRODUCTS = "delete_products",
  MANAGE_CATEGORIES = "manage_categories",
  
  // Orders
  VIEW_ORDERS = "view_orders",
  CREATE_ORDERS = "create_orders",
  UPDATE_ORDER_STATUS = "update_order_status",
  ASSIGN_OPERATOR = "assign_operator",
  UPLOAD_FILES = "upload_files",
  CANCEL_ORDERS = "cancel_orders",
  DELETE_ORDERS = "delete_orders",
  VIEW_ORDER_PAYMENTS = "view_order_payments",
  
  // Production
  VIEW_PRODUCTION = "view_production",
  START_OPERATION = "start_operation",
  PAUSE_OPERATION = "pause_operation",
  COMPLETE_OPERATION = "complete_operation",
  ASSIGN_MACHINE = "assign_machine",
  MANAGE_MATERIALS = "manage_materials",
  
  // Customers
  VIEW_CUSTOMERS = "view_customers",
  CREATE_CUSTOMERS = "create_customers",
  EDIT_CUSTOMERS = "edit_customers",
  DELETE_CUSTOMERS = "delete_customers",
  
  // Editor & Projects
  VIEW_PROJECTS = "view_projects",
  CREATE_PROJECTS = "create_projects",
  EDIT_PROJECTS = "edit_projects",
  DELETE_PROJECTS = "delete_projects",
  APPROVE_FILES = "approve_files",
  
  // Reports
  VIEW_REPORTS = "view_reports",
  EXPORT_REPORTS = "export_reports",
  VIEW_ANALYTICS = "view_analytics",
  
  // Users & Settings
  MANAGE_USERS = "manage_users",
  MANAGE_ROLES = "manage_roles",
  MANAGE_PERMISSIONS = "manage_permissions",
  MANAGE_PLATFORM_SETTINGS = "manage_platform_settings",
  MANAGE_INTEGRATIONS = "manage_integrations",
  VIEW_AUDIT_LOGS = "view_audit_logs",
  
  // Security
  MANAGE_SECURITY = "manage_security",
  VIEW_SECURITY_LOGS = "view_security_logs",
  REVOKE_SESSIONS = "revoke_sessions",
}

// Maparea permisiunilor pe roluri
export const RolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Super admin are toate permisiunile
    ...Object.values(Permission)
  ],
  
  MANAGER: [
    // Products
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.MANAGE_CATEGORIES,
    
    // Orders
    Permission.VIEW_ORDERS,
    Permission.CREATE_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.ASSIGN_OPERATOR,
    Permission.UPLOAD_FILES,
    Permission.CANCEL_ORDERS,
    Permission.VIEW_ORDER_PAYMENTS,
    
    // Production
    Permission.VIEW_PRODUCTION,
    Permission.START_OPERATION,
    Permission.PAUSE_OPERATION,
    Permission.COMPLETE_OPERATION,
    Permission.ASSIGN_MACHINE,
    Permission.MANAGE_MATERIALS,
    
    // Customers
    Permission.VIEW_CUSTOMERS,
    Permission.CREATE_CUSTOMERS,
    Permission.EDIT_CUSTOMERS,
    
    // Editor & Projects
    Permission.VIEW_PROJECTS,
    Permission.EDIT_PROJECTS,
    Permission.APPROVE_FILES,
    
    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_ANALYTICS,
    
    // Users (limited)
    Permission.MANAGE_USERS,
  ],
  
  OPERATOR: [
    // Products (readonly)
    Permission.VIEW_PRODUCTS,
    
    // Orders (limited)
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.UPLOAD_FILES,
    
    // Production (main focus)
    Permission.VIEW_PRODUCTION,
    Permission.START_OPERATION,
    Permission.PAUSE_OPERATION,
    Permission.COMPLETE_OPERATION,
    
    // Projects (limited)
    Permission.VIEW_PROJECTS,
    
    // Customers (readonly)
    Permission.VIEW_CUSTOMERS,
  ],
  
  VIEWER: [
    // View-only access
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_ORDERS,
    Permission.VIEW_PRODUCTION,
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_PROJECTS,
    Permission.VIEW_REPORTS,
  ]
};

// Gruparea permisiunilor pentru UI
export const PermissionGroups = {
  products: {
    name: "Produse",
    permissions: [
      Permission.VIEW_PRODUCTS,
      Permission.CREATE_PRODUCTS,
      Permission.EDIT_PRODUCTS,
      Permission.DELETE_PRODUCTS,
      Permission.MANAGE_CATEGORIES,
    ]
  },
  orders: {
    name: "Comenzi",
    permissions: [
      Permission.VIEW_ORDERS,
      Permission.CREATE_ORDERS,
      Permission.UPDATE_ORDER_STATUS,
      Permission.ASSIGN_OPERATOR,
      Permission.UPLOAD_FILES,
      Permission.CANCEL_ORDERS,
      Permission.DELETE_ORDERS,
      Permission.VIEW_ORDER_PAYMENTS,
    ]
  },
  production: {
    name: "Producție",
    permissions: [
      Permission.VIEW_PRODUCTION,
      Permission.START_OPERATION,
      Permission.PAUSE_OPERATION,
      Permission.COMPLETE_OPERATION,
      Permission.ASSIGN_MACHINE,
      Permission.MANAGE_MATERIALS,
    ]
  },
  customers: {
    name: "Clienți",
    permissions: [
      Permission.VIEW_CUSTOMERS,
      Permission.CREATE_CUSTOMERS,
      Permission.EDIT_CUSTOMERS,
      Permission.DELETE_CUSTOMERS,
    ]
  },
  editor: {
    name: "Editor & Proiecte",
    permissions: [
      Permission.VIEW_PROJECTS,
      Permission.CREATE_PROJECTS,
      Permission.EDIT_PROJECTS,
      Permission.DELETE_PROJECTS,
      Permission.APPROVE_FILES,
    ]
  },
  reports: {
    name: "Rapoarte & Analytics",
    permissions: [
      Permission.VIEW_REPORTS,
      Permission.EXPORT_REPORTS,
      Permission.VIEW_ANALYTICS,
    ]
  },
  settings: {
    name: "Setări & Administrare",
    permissions: [
      Permission.MANAGE_USERS,
      Permission.MANAGE_ROLES,
      Permission.MANAGE_PERMISSIONS,
      Permission.MANAGE_PLATFORM_SETTINGS,
      Permission.MANAGE_INTEGRATIONS,
      Permission.VIEW_AUDIT_LOGS,
    ]
  },
  security: {
    name: "Securitate",
    permissions: [
      Permission.MANAGE_SECURITY,
      Permission.VIEW_SECURITY_LOGS,
      Permission.REVOKE_SESSIONS,
    ]
  }
};

// Descrieri pentru permisiuni
export const PermissionDescriptions: Record<Permission, string> = {
  [Permission.VIEW_PRODUCTS]: "Vizualizare produse și categorii",
  [Permission.CREATE_PRODUCTS]: "Creare produse noi",
  [Permission.EDIT_PRODUCTS]: "Editare produse existente",
  [Permission.DELETE_PRODUCTS]: "Ștergere produse",
  [Permission.MANAGE_CATEGORIES]: "Gestionare categorii produse",
  
  [Permission.VIEW_ORDERS]: "Vizualizare comenzi",
  [Permission.CREATE_ORDERS]: "Creare comenzi noi",
  [Permission.UPDATE_ORDER_STATUS]: "Actualizare status comenzi",
  [Permission.ASSIGN_OPERATOR]: "Asignare operator la comenzi",
  [Permission.UPLOAD_FILES]: "Încărcare fișiere la comenzi",
  [Permission.CANCEL_ORDERS]: "Anulare comenzi",
  [Permission.DELETE_ORDERS]: "Ștergere comenzi",
  [Permission.VIEW_ORDER_PAYMENTS]: "Vizualizare plăți comenzi",
  
  [Permission.VIEW_PRODUCTION]: "Vizualizare producție",
  [Permission.START_OPERATION]: "Pornire operațiuni de producție",
  [Permission.PAUSE_OPERATION]: "Pauză operațiuni de producție",
  [Permission.COMPLETE_OPERATION]: "Finalizare operațiuni de producție",
  [Permission.ASSIGN_MACHINE]: "Asignare mașini pentru producție",
  [Permission.MANAGE_MATERIALS]: "Gestionare materiale și consumabile",
  
  [Permission.VIEW_CUSTOMERS]: "Vizualizare clienți",
  [Permission.CREATE_CUSTOMERS]: "Creare clienți noi",
  [Permission.EDIT_CUSTOMERS]: "Editare clienți existenți",
  [Permission.DELETE_CUSTOMERS]: "Ștergere clienți",
  
  [Permission.VIEW_PROJECTS]: "Vizualizare proiecte editor",
  [Permission.CREATE_PROJECTS]: "Creare proiecte noi",
  [Permission.EDIT_PROJECTS]: "Editare proiecte",
  [Permission.DELETE_PROJECTS]: "Ștergere proiecte",
  [Permission.APPROVE_FILES]: "Aprobare fișiere pentru producție",
  
  [Permission.VIEW_REPORTS]: "Vizualizare rapoarte",
  [Permission.EXPORT_REPORTS]: "Export rapoarte",
  [Permission.VIEW_ANALYTICS]: "Vizualizare analytics și statistici",
  
  [Permission.MANAGE_USERS]: "Gestionare utilizatori",
  [Permission.MANAGE_ROLES]: "Gestionare roluri",
  [Permission.MANAGE_PERMISSIONS]: "Gestionare permisiuni",
  [Permission.MANAGE_PLATFORM_SETTINGS]: "Gestionare setări platformă",
  [Permission.MANAGE_INTEGRATIONS]: "Gestionare integrări externe",
  [Permission.VIEW_AUDIT_LOGS]: "Vizualizare audit logs",
  
  [Permission.MANAGE_SECURITY]: "Gestionare setări de securitate",
  [Permission.VIEW_SECURITY_LOGS]: "Vizualizare log-uri de securitate",
  [Permission.REVOKE_SESSIONS]: "Revocare sesiuni utilizatori",
};

/**
 * Verifică dacă un utilizator are o anumită permisiune
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = RolePermissions[userRole] || [];
  return rolePermissions.includes(permission);
}

/**
 * Verifică dacă un utilizator are cel puțin una din permisiunile specificate
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Verifică dacă un utilizator are toate permisiunile specificate
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Obține lista de permisiuni pentru un rol
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return RolePermissions[role] || [];
}

/**
 * Verifică dacă un rol specific există
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return userRole === requiredRole;
}

/**
 * Verifică ierarhia rolurilor (ADMIN > MANAGER > OPERATOR > VIEWER)
 */
export function hasRoleOrHigher(userRole: UserRole, minimumRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    ADMIN: 4,
    MANAGER: 3,
    OPERATOR: 2,
    VIEWER: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}

/**
 * Obține toate permisiunile ca array pentru export
 */
export function getAllPermissions(): Permission[] {
  return Object.values(Permission);
}

/**
 * Obține diferențele de permisiuni între două roluri
 */
export function getPermissionDiff(fromRole: UserRole, toRole: UserRole) {
  const fromPermissions = new Set(getPermissionsForRole(fromRole));
  const toPermissions = new Set(getPermissionsForRole(toRole));
  
  const added = Array.from(toPermissions).filter(p => !fromPermissions.has(p));
  const removed = Array.from(fromPermissions).filter(p => !toPermissions.has(p));
  
  return { added, removed };
}

/**
 * Validează dacă permisiunile custom sunt valide
 */
export function validatePermissions(permissions: string[]): boolean {
  const validPermissions = new Set(Object.values(Permission));
  return permissions.every(p => validPermissions.has(p as Permission));
}
