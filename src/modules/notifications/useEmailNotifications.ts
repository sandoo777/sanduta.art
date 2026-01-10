/**
 * Email Notifications Module
 * Handles email sending, template rendering, and queueing
 */

import { 
  NotificationTemplate, 
  EmailNotification, 
  NotificationType 
} from '@/lib/notifications/notificationTypes';
import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// EMAIL CONFIGURATION
// ==========================================

const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Sanduta.art <noreply@sanduta.art>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@sanduta.art',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@sanduta.art',
};

// ==========================================
// TEMPLATE RENDERING
// ==========================================

/**
 * Render template with data variables
 */
export function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  
  // Replace all {{variable}} with data[variable]
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  });
  
  // Remove any remaining unreplaced variables
  rendered = rendered.replace(/{{[^}]+}}/g, '');
  
  return rendered;
}

/**
 * Render notification template with data
 */
export async function renderNotificationTemplate(
  type: NotificationType,
  data: Record<string, any>
): Promise<{ subject: string; htmlBody: string; textBody: string } | null> {
  try {
    // Fetch template from database
    const res = await fetch(`/api/notifications/templates?type=${type}&channel=email`);
    if (!res.ok) return null;
    
    const templates: NotificationTemplate[] = await res.json();
    const template = templates.find(t => t.enabled && t.type === type);
    
    if (!template) return null;
    
    return {
      subject: renderTemplate(template.emailSubject || '', data),
      htmlBody: renderTemplate(template.emailBodyHtml || '', data),
      textBody: renderTemplate(template.emailBodyText || '', data),
    };
  } catch (error) {
    console.error('Failed to render template:', error);
    return null;
  }
}

// ==========================================
// EMAIL SENDING
// ==========================================

/**
 * Send email using Resend
 */
export async function sendEmail(
  notification: EmailNotification
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: notification.from || EMAIL_CONFIG.from,
      to: Array.isArray(notification.to) ? notification.to : [notification.to],
      cc: notification.cc,
      bcc: notification.bcc,
      replyTo: notification.replyTo || EMAIL_CONFIG.replyTo,
      subject: notification.subject,
      html: notification.htmlBody,
      text: notification.textBody,
      attachments: notification.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      })),
    });
    
    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email with template
 */
export async function sendEmailWithTemplate(
  type: NotificationType,
  to: string | string[],
  data: Record<string, any>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Render template
    const rendered = await renderNotificationTemplate(type, data);
    if (!rendered) {
      return { success: false, error: 'Template not found or disabled' };
    }
    
    // Send email
    return await sendEmail({
      to,
      subject: rendered.subject,
      htmlBody: rendered.htmlBody,
      textBody: rendered.textBody,
    });
  } catch (error: any) {
    console.error('Failed to send email with template:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// NOTIFICATION QUEUE
// ==========================================

interface QueuedNotification {
  id: string;
  type: NotificationType;
  to: string | string[];
  data: Record<string, any>;
  scheduledAt: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  error?: string;
}

// In-memory queue (in production, use Redis or database)
const notificationQueue: QueuedNotification[] = [];

/**
 * Add notification to queue
 */
export function queueEmail(
  type: NotificationType,
  to: string | string[],
  data: Record<string, any>,
  scheduledAt: Date = new Date()
): string {
  const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  notificationQueue.push({
    id,
    type,
    to,
    data,
    scheduledAt,
    attempts: 0,
    maxAttempts: 3,
    status: 'pending',
  });
  
  return id;
}

/**
 * Process notification queue
 */
export async function processNotificationQueue() {
  const now = new Date();
  
  const pendingNotifications = notificationQueue.filter(
    n => n.status === 'pending' && n.scheduledAt <= now
  );
  
  for (const notification of pendingNotifications) {
    notification.status = 'processing';
    notification.attempts++;
    
    const result = await sendEmailWithTemplate(
      notification.type,
      notification.to,
      notification.data
    );
    
    if (result.success) {
      notification.status = 'sent';
    } else {
      if (notification.attempts >= notification.maxAttempts) {
        notification.status = 'failed';
        notification.error = result.error;
      } else {
        // Retry later
        notification.status = 'pending';
        notification.scheduledAt = new Date(Date.now() + 60000 * notification.attempts); // Exponential backoff
      }
    }
  }
  
  // Clean up sent notifications older than 1 hour
  const oneHourAgo = new Date(Date.now() - 3600000);
  const indicesToRemove = notificationQueue
    .map((n, i) => (n.status === 'sent' && n.scheduledAt < oneHourAgo ? i : -1))
    .filter(i => i !== -1)
    .reverse();
  
  indicesToRemove.forEach(i => notificationQueue.splice(i, 1));
}

// Start queue processor (run every 30 seconds)
if (typeof window === 'undefined') {
  setInterval(processNotificationQueue, 30000);
}

// ==========================================
// QUICK SEND FUNCTIONS
// ==========================================

/**
 * Send order placed notification
 */
export async function sendOrderPlacedEmail(
  customerEmail: string,
  orderData: {
    orderNumber: string;
    customerName: string;
    total: string;
    date: string;
    trackingUrl?: string;
  }
) {
  return await sendEmailWithTemplate('order_placed', customerEmail, orderData);
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(
  type: NotificationType,
  customerEmail: string,
  orderData: Record<string, any>
) {
  return await sendEmailWithTemplate(type, customerEmail, orderData);
}

/**
 * Send admin notification
 */
export async function sendAdminNotification(
  type: NotificationType,
  data: Record<string, any>
) {
  return await sendEmailWithTemplate(type, EMAIL_CONFIG.adminEmail, data);
}

/**
 * Send production notification to operator
 */
export async function sendProductionNotification(
  operatorEmail: string,
  type: NotificationType,
  data: Record<string, any>
) {
  return await sendEmailWithTemplate(type, operatorEmail, data);
}

// ==========================================
// EMAIL TEMPLATES (DEFAULT FALLBACKS)
// ==========================================

export const defaultEmailTemplates: Record<string, { subject: string; html: string; text: string }> = {
  order_placed: {
    subject: 'Comanda ta #{{orderNumber}} a fost plasată',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Comandă Confirmată</h1>
        <p>Bună {{customerName}},</p>
        <p>Îți mulțumim pentru comandă! Am primit comanda ta <strong>#{{orderNumber}}</strong>.</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Număr comandă:</strong> {{orderNumber}}</p>
          <p><strong>Total:</strong> {{total}}</p>
          <p><strong>Dată:</strong> {{date}}</p>
        </div>
        <p>Vei primi un email când comanda va intra în producție.</p>
        <p style="margin-top: 30px;">
          <a href="{{trackingUrl}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Vezi Comanda
          </a>
        </p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Cu stimă,<br>
          Echipa Sanduta.art
        </p>
      </div>
    `,
    text: `
      Bună {{customerName}},
      
      Îți mulțumim pentru comandă! Am primit comanda ta #{{orderNumber}}.
      
      Număr comandă: {{orderNumber}}
      Total: {{total}}
      Dată: {{date}}
      
      Vei primi un email când comanda va intra în producție.
      
      Vezi comanda: {{trackingUrl}}
      
      Cu stimă,
      Echipa Sanduta.art
    `,
  },
  
  order_in_production: {
    subject: 'Comanda ta #{{orderNumber}} este în producție',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Comandă în Producție</h1>
        <p>Bună {{customerName}},</p>
        <p>Comanda ta <strong>#{{orderNumber}}</strong> a intrat în producție!</p>
        <p>Livrare estimată: <strong>{{estimatedDelivery}}</strong></p>
        <p>Vei primi o notificare când comanda este gata.</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Cu stimă,<br>
          Echipa Sanduta.art
        </p>
      </div>
    `,
    text: `
      Bună {{customerName}},
      
      Comanda ta #{{orderNumber}} a intrat în producție!
      
      Livrare estimată: {{estimatedDelivery}}
      
      Vei primi o notificare când comanda este gata.
      
      Cu stimă,
      Echipa Sanduta.art
    `,
  },
  
  admin_new_order: {
    subject: 'Comandă nouă #{{orderNumber}} primită',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">🔔 Comandă Nouă</h1>
        <p>O comandă nouă a fost plasată:</p>
        <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 20px 0;">
          <p><strong>Comandă:</strong> #{{orderNumber}}</p>
          <p><strong>Client:</strong> {{customerName}}</p>
          <p><strong>Produs:</strong> {{productName}}</p>
          <p><strong>Total:</strong> {{total}}</p>
        </div>
        <p>
          <a href="{{adminUrl}}" style="background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Vezi în Admin
          </a>
        </p>
      </div>
    `,
    text: `
      🔔 Comandă Nouă
      
      O comandă nouă a fost plasată:
      
      Comandă: #{{orderNumber}}
      Client: {{customerName}}
      Produs: {{productName}}
      Total: {{total}}
      
      Vezi în admin: {{adminUrl}}
    `,
  },
};

/**
 * Get default template if custom template not found
 */
export function getDefaultTemplate(type: string): { subject: string; html: string; text: string } | null {
  return defaultEmailTemplates[type] || null;
}
