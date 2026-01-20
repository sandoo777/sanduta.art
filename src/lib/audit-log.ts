/**
 * Audit Logging System pentru acțiuni critice
 */

import { prisma } from '@/lib/prisma';
import { ActivityType } from '@prisma/client';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Loghează o acțiune în audit log
 */
export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    // Log în bază de date
    await prisma.securityActivity.create({
      data: {
        userId: entry.userId,
        type: mapActionToActivityType(entry.action),
        ipAddress: entry.ipAddress || 'unknown',
        userAgent: entry.userAgent || 'unknown',
        details: entry.details ? JSON.stringify(entry.details) : null,
      },
    });

    // Log în console pentru development/debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', {
        timestamp: new Date().toISOString(),
        ...entry,
      });
    }
  } catch (_error) {
    console.error('[AUDIT ERROR]', error);
    // Nu throw error pentru a nu întrerupe flow-ul principal
  }
}

/**
 * Map custom actions la ActivityType enum
 */
function mapActionToActivityType(action: string): ActivityType {
  const mapping: Record<string, ActivityType> = {
    login: ActivityType.LOGIN,
    logout: ActivityType.LOGOUT,
    password_change: ActivityType.PASSWORD_CHANGE,
    '2fa_enable': ActivityType.TWO_FACTOR_ENABLED,
    '2fa_disable': ActivityType.TWO_FACTOR_DISABLED,
    session_revoked: ActivityType.SESSION_REVOKED,
    failed_login: ActivityType.FAILED_LOGIN,
    new_device: ActivityType.NEW_DEVICE,
  };

  return mapping[action] || ActivityType.LOGIN;
}

/**
 * Actions constants pentru consistență
 */
export const AUDIT_ACTIONS = {
  // Auth
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'failed_login',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  
  // User Management
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_ROLE_CHANGE: 'user_role_change',
  
  // Orders
  ORDER_CREATE: 'order_create',
  ORDER_UPDATE: 'order_update',
  ORDER_DELETE: 'order_delete',
  ORDER_STATUS_CHANGE: 'order_status_change',
  ORDER_ASSIGN: 'order_assign',
  
  // Products
  PRODUCT_CREATE: 'product_create',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_DELETE: 'product_delete',
  
  // Customers
  CUSTOMER_CREATE: 'customer_create',
  CUSTOMER_UPDATE: 'customer_update',
  CUSTOMER_DELETE: 'customer_delete',
  
  // Materials
  MATERIAL_CREATE: 'material_create',
  MATERIAL_UPDATE: 'material_update',
  MATERIAL_DELETE: 'material_delete',
  MATERIAL_CONSUME: 'material_consume',
  
  // Projects
  PROJECT_CREATE: 'project_create',
  PROJECT_UPDATE: 'project_update',
  PROJECT_DELETE: 'project_delete',
  
  // Files
  FILE_UPLOAD: 'file_upload',
  FILE_DELETE: 'file_delete',
  
  // Security
  SESSION_REVOKE: 'session_revoked',
  TWO_FACTOR_ENABLE: '2fa_enable',
  TWO_FACTOR_DISABLE: '2fa_disable',
  
  // Production
  PRODUCTION_CREATE: 'production_create',
  PRODUCTION_UPDATE: 'production_update',
  PRODUCTION_DELETE: 'production_delete',
  PRODUCTION_STATUS_CHANGE: 'production_status_change',
} as const;

/**
 * Helper pentru a extrage IP și User Agent din request
 */
export function getRequestMetadata(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}

/**
 * Wrapper pentru a loga acțiuni automat în route handlers
 */
export function withAuditLog(
  action: string,
  resourceType: string,
  handler: (context: { user: { id: string }; params?: { id?: string } }) => Promise<Response>
) {
  return async (request: Request, context: { user: { id: string }; params?: { id?: string } }): Promise<Response> => {
    const { user: _user } = context;
    const metadata = getRequestMetadata(request);

    try {
      const response = await handler(context);

      // Log doar dacă requestul a fost success (status < 400)
      if (response.status < 400) {
        await logAuditAction({
          userId: user.id,
          action,
          resourceType,
          resourceId: context.params?.id,
          ...metadata,
        });
      }

      return response;
    } catch (_error) {
      // Log failed attempt
      await logAuditAction({
        userId: user.id,
        action: `${action}_failed`,
        resourceType,
        details: { error: (error as Error).message },
        ...metadata,
      });

      throw error;
    }
  };
}

/**
 * Queries pentru audit logs
 */
export async function getUserAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }
) {
  return prisma.securityActivity.findMany({
    where: {
      userId,
      ...(options?.startDate && {
        createdAt: {
          gte: options.startDate,
          ...(options?.endDate && { lte: options.endDate }),
        },
      }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}

/**
 * Șterge audit logs vechi (cleanup periodic)
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.securityActivity.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}
