/**
 * Notification Types and Interfaces
 * Defines all notification types, channels, and data structures
 */

// ==========================================
// NOTIFICATION TYPES
// ==========================================

export const NotificationTypes = {
  // Order Notifications
  ORDER_PLACED: 'order_placed',
  ORDER_PAID: 'order_paid',
  ORDER_IN_PRODUCTION: 'order_in_production',
  ORDER_READY: 'order_ready',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_COMPLETED: 'order_completed',
  ORDER_CANCELLED: 'order_cancelled',
  
  // Project/Editor Notifications
  PROJECT_UPLOADED: 'project_uploaded',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_APPROVED: 'project_approved',
  PROJECT_REJECTED: 'project_rejected',
  
  // Admin Notifications
  ADMIN_NEW_ORDER: 'admin_new_order',
  ADMIN_ORDER_ISSUE: 'admin_order_issue',
  ADMIN_LOW_STOCK: 'admin_low_stock',
  ADMIN_PAYMENT_FAILED: 'admin_payment_failed',
  
  // Production Notifications
  PRODUCTION_OPERATION_ASSIGNED: 'production_operation_assigned',
  PRODUCTION_OPERATION_COMPLETED: 'production_operation_completed',
  PRODUCTION_OPERATION_DELAYED: 'production_operation_delayed',
  PRODUCTION_MACHINE_MAINTENANCE: 'production_machine_maintenance',
  PRODUCTION_OPERATOR_NEEDED: 'production_operator_needed',
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

// ==========================================
// NOTIFICATION CHANNELS
// ==========================================

export enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
  SMS = 'sms',
  PUSH = 'push',
}

// ==========================================
// NOTIFICATION PRIORITY
// ==========================================

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// ==========================================
// NOTIFICATION STATUS
// ==========================================

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  QUEUED = 'queued',
}

// ==========================================
// INTERFACES
// ==========================================

/**
 * Base Notification Interface
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  status: NotificationStatus;
  
  title: string;
  message: string;
  metadata?: Record<string, any>;
  
  read: boolean;
  readAt?: Date;
  
  createdAt: Date;
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
}

/**
 * Email Notification Data
 */
export interface EmailNotification {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  from?: string;
  replyTo?: string;
  
  subject: string;
  htmlBody: string;
  textBody?: string;
  
  templateId?: string;
  templateData?: Record<string, any>;
  
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

/**
 * In-App Notification Data
 */
export interface InAppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  
  actionUrl?: string;
  actionLabel?: string;
  
  read: boolean;
  readAt?: Date;
  
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Notification Template
 */
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  
  name: string;
  description?: string;
  
  // Email Template Fields
  emailSubject?: string;
  emailBodyHtml?: string;
  emailBodyText?: string;
  
  // In-App Template Fields
  inAppTitle?: string;
  inAppMessage?: string;
  inAppIcon?: string;
  inAppIconColor?: string;
  inAppActionUrl?: string;
  inAppActionLabel?: string;
  
  // SMS Template Fields
  smsBody?: string;
  
  // Available Variables
  variables: TemplateVariable[];
  
  // Settings
  enabled: boolean;
  autoSend: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
}

// ==========================================
// TEMPLATE VARIABLES
// ==========================================

/**
 * Available template variables by notification type
 */
export const TemplateVariables: Record<NotificationType, TemplateVariable[]> = {
  [NotificationTypes.ORDER_PLACED]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'total', label: 'Total', description: 'Suma totală', example: '250.00 RON', required: true },
    { key: 'date', label: 'Dată', description: 'Data plasării comenzii', example: '10 Ian 2026', required: true },
    { key: 'trackingUrl', label: 'Link Tracking', description: 'URL pentru tracking comandă', example: 'https://sanduta.art/orders/123', required: false },
  ],
  
  [NotificationTypes.ORDER_PAID]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'total', label: 'Total', description: 'Suma plătită', example: '250.00 RON', required: true },
    { key: 'paymentMethod', label: 'Metodă Plată', description: 'Metoda de plată folosită', example: 'Card bancar', required: false },
    { key: 'date', label: 'Dată', description: 'Data plății', example: '10 Ian 2026', required: true },
  ],
  
  [NotificationTypes.ORDER_IN_PRODUCTION]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'productName', label: 'Nume Produs', description: 'Numele produsului', example: 'Fluturași A5', required: false },
    { key: 'estimatedDelivery', label: 'Livrare Estimată', description: 'Data estimată de livrare', example: '15 Ian 2026', required: false },
  ],
  
  [NotificationTypes.ORDER_READY]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'pickupAddress', label: 'Adresă Ridicare', description: 'Adresa de unde poate fi ridicată comanda', example: 'Str. Exemplu 123', required: false },
  ],
  
  [NotificationTypes.ORDER_SHIPPED]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'trackingNumber', label: 'AWB', description: 'Număr tracking curier', example: '123456789', required: false },
    { key: 'courier', label: 'Curier', description: 'Nume companie curier', example: 'Nova Poshta', required: false },
    { key: 'estimatedDelivery', label: 'Livrare Estimată', description: 'Data estimată de livrare', example: '15 Ian 2026', required: false },
  ],
  
  [NotificationTypes.ORDER_COMPLETED]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'date', label: 'Dată', description: 'Data finalizării', example: '10 Ian 2026', required: true },
  ],
  
  [NotificationTypes.ORDER_CANCELLED]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'reason', label: 'Motiv', description: 'Motivul anulării', example: 'Client request', required: false },
    { key: 'refundAmount', label: 'Sumă Returnată', description: 'Suma care va fi returnată', example: '250.00 RON', required: false },
  ],
  
  [NotificationTypes.PROJECT_UPLOADED]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'fileName', label: 'Nume Fișier', description: 'Numele fișierului încărcat', example: 'macheta.pdf', required: false },
    { key: 'date', label: 'Dată', description: 'Data încărcării', example: '10 Ian 2026', required: true },
  ],
  
  [NotificationTypes.PROJECT_UPDATED]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'fileName', label: 'Nume Fișier', description: 'Numele fișierului actualizat', example: 'macheta_v2.pdf', required: false },
  ],
  
  [NotificationTypes.PROJECT_APPROVED]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
  ],
  
  [NotificationTypes.PROJECT_REJECTED]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'reason', label: 'Motiv', description: 'Motivul respingerii', example: 'Rezoluție prea mică', required: true },
  ],
  
  [NotificationTypes.ADMIN_NEW_ORDER]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'total', label: 'Total', description: 'Suma totală', example: '250.00 RON', required: true },
    { key: 'productName', label: 'Nume Produs', description: 'Numele produsului', example: 'Fluturași A5', required: false },
    { key: 'adminUrl', label: 'Link Admin', description: 'URL către comanda în admin', example: 'https://sanduta.art/admin/orders/123', required: false },
  ],
  
  [NotificationTypes.ADMIN_ORDER_ISSUE]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'issue', label: 'Problemă', description: 'Descrierea problemei', example: 'Fișier lipsă', required: true },
    { key: 'adminUrl', label: 'Link Admin', description: 'URL către comanda în admin', example: 'https://sanduta.art/admin/orders/123', required: false },
  ],
  
  [NotificationTypes.ADMIN_LOW_STOCK]: [
    { key: 'materialName', label: 'Nume Material', description: 'Numele materialului', example: 'Hârtie A4 80g', required: true },
    { key: 'currentStock', label: 'Stoc Curent', description: 'Cantitatea curentă', example: '50', required: true },
    { key: 'minStock', label: 'Stoc Minim', description: 'Nivelul minim de stoc', example: '100', required: true },
  ],
  
  [NotificationTypes.ADMIN_PAYMENT_FAILED]: [
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'customerName', label: 'Nume Client', description: 'Numele complet al clientului', example: 'Ion Popescu', required: true },
    { key: 'total', label: 'Total', description: 'Suma', example: '250.00 RON', required: true },
    { key: 'reason', label: 'Motiv', description: 'Motivul eșecului', example: 'Fonduri insuficiente', required: false },
  ],
  
  [NotificationTypes.PRODUCTION_OPERATION_ASSIGNED]: [
    { key: 'operatorName', label: 'Nume Operator', description: 'Numele operatorului', example: 'Maria Ionescu', required: true },
    { key: 'operationName', label: 'Nume Operațiune', description: 'Numele operațiunii', example: 'Tiparire', required: true },
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'machineName', label: 'Nume Echipament', description: 'Numele echipamentului', example: 'Printer HP 3000', required: false },
    { key: 'estimatedTime', label: 'Timp Estimat', description: 'Timpul estimat', example: '2h 30m', required: false },
  ],
  
  [NotificationTypes.PRODUCTION_OPERATION_COMPLETED]: [
    { key: 'operatorName', label: 'Nume Operator', description: 'Numele operatorului', example: 'Maria Ionescu', required: true },
    { key: 'operationName', label: 'Nume Operațiune', description: 'Numele operațiunii', example: 'Tiparire', required: true },
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'actualTime', label: 'Timp Real', description: 'Timpul real', example: '2h 15m', required: false },
  ],
  
  [NotificationTypes.PRODUCTION_OPERATION_DELAYED]: [
    { key: 'operationName', label: 'Nume Operațiune', description: 'Numele operațiunii', example: 'Tiparire', required: true },
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'delay', label: 'Întârziere', description: 'Timpul de întârziere', example: '30 minute', required: true },
    { key: 'reason', label: 'Motiv', description: 'Motivul întârzierii', example: 'Lipsă material', required: false },
  ],
  
  [NotificationTypes.PRODUCTION_MACHINE_MAINTENANCE]: [
    { key: 'machineName', label: 'Nume Echipament', description: 'Numele echipamentului', example: 'Printer HP 3000', required: true },
    { key: 'maintenanceType', label: 'Tip Întreținere', description: 'Tipul de întreținere', example: 'Preventivă', required: false },
    { key: 'scheduledDate', label: 'Dată Programată', description: 'Data programată', example: '15 Ian 2026', required: false },
  ],
  
  [NotificationTypes.PRODUCTION_OPERATOR_NEEDED]: [
    { key: 'operationName', label: 'Nume Operațiune', description: 'Numele operațiunii', example: 'Tiparire', required: true },
    { key: 'orderNumber', label: 'Număr Comandă', description: 'ID-ul comenzii', example: 'ORD-12345', required: true },
    { key: 'priority', label: 'Prioritate', description: 'Prioritatea operațiunii', example: 'URGENT', required: false },
  ],
};

// ==========================================
// NOTIFICATION HELPERS
// ==========================================

/**
 * Get notification type display name
 */
export function getNotificationTypeName(type: NotificationType): string {
  const names: Record<NotificationType, string> = {
    [NotificationTypes.ORDER_PLACED]: 'Comandă Plasată',
    [NotificationTypes.ORDER_PAID]: 'Comandă Plătită',
    [NotificationTypes.ORDER_IN_PRODUCTION]: 'Comandă în Producție',
    [NotificationTypes.ORDER_READY]: 'Comandă Gata',
    [NotificationTypes.ORDER_SHIPPED]: 'Comandă Expediată',
    [NotificationTypes.ORDER_COMPLETED]: 'Comandă Finalizată',
    [NotificationTypes.ORDER_CANCELLED]: 'Comandă Anulată',
    [NotificationTypes.PROJECT_UPLOADED]: 'Machetă Încărcată',
    [NotificationTypes.PROJECT_UPDATED]: 'Machetă Actualizată',
    [NotificationTypes.PROJECT_APPROVED]: 'Machetă Aprobată',
    [NotificationTypes.PROJECT_REJECTED]: 'Machetă Respinsă',
    [NotificationTypes.ADMIN_NEW_ORDER]: 'Comandă Nouă (Admin)',
    [NotificationTypes.ADMIN_ORDER_ISSUE]: 'Problemă Comandă (Admin)',
    [NotificationTypes.ADMIN_LOW_STOCK]: 'Stoc Scăzut (Admin)',
    [NotificationTypes.ADMIN_PAYMENT_FAILED]: 'Plată Eșuată (Admin)',
    [NotificationTypes.PRODUCTION_OPERATION_ASSIGNED]: 'Operațiune Asignată',
    [NotificationTypes.PRODUCTION_OPERATION_COMPLETED]: 'Operațiune Finalizată',
    [NotificationTypes.PRODUCTION_OPERATION_DELAYED]: 'Operațiune Întârziată',
    [NotificationTypes.PRODUCTION_MACHINE_MAINTENANCE]: 'Întreținere Echipament',
    [NotificationTypes.PRODUCTION_OPERATOR_NEEDED]: 'Operator Necesar',
  };
  
  return names[type] || type;
}

/**
 * Get notification priority color
 */
export function getNotificationPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    [NotificationPriority.LOW]: 'text-gray-600',
    [NotificationPriority.MEDIUM]: 'text-blue-600',
    [NotificationPriority.HIGH]: 'text-orange-600',
    [NotificationPriority.URGENT]: 'text-red-600',
  };
  
  return colors[priority];
}

/**
 * Get notification icon by type
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Partial<Record<NotificationType, string>> = {
    [NotificationTypes.ORDER_PLACED]: 'ShoppingCart',
    [NotificationTypes.ORDER_PAID]: 'CreditCard',
    [NotificationTypes.ORDER_IN_PRODUCTION]: 'Cog',
    [NotificationTypes.ORDER_READY]: 'CheckCircle',
    [NotificationTypes.ORDER_SHIPPED]: 'Truck',
    [NotificationTypes.ORDER_COMPLETED]: 'CheckCircle2',
    [NotificationTypes.ORDER_CANCELLED]: 'XCircle',
    [NotificationTypes.PROJECT_UPLOADED]: 'Upload',
    [NotificationTypes.PROJECT_UPDATED]: 'FileEdit',
    [NotificationTypes.ADMIN_NEW_ORDER]: 'Bell',
    [NotificationTypes.ADMIN_ORDER_ISSUE]: 'AlertTriangle',
    [NotificationTypes.PRODUCTION_OPERATION_ASSIGNED]: 'UserCheck',
    [NotificationTypes.PRODUCTION_OPERATION_COMPLETED]: 'CheckCircle',
    [NotificationTypes.PRODUCTION_MACHINE_MAINTENANCE]: 'Wrench',
  };
  
  return icons[type] || 'Bell';
}
