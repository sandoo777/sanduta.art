import { Resend } from 'resend';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import AdminNewOrderEmail from '@/emails/admin-new-order';
import OrderStatusUpdateEmail from '@/emails/order-status-update';

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not configured');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress?: string;
  city?: string;
  novaPoshtaWarehouse?: string;
  trackingNumber?: string;
  createdAt: Date;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Sanduta Art <noreply@sanduta.art>',
      to: data.customerEmail,
      subject: `Подтверждение заказа #${data.orderNumber}`,
      react: OrderConfirmationEmail(data),
    });

    if (error) {
      console.error('Failed to send order confirmation email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (_error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendAdminNewOrderEmail(data: OrderEmailData) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sanduta.art';

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Sanduta Art <noreply@sanduta.art>',
      to: adminEmail,
      subject: `Новый заказ #${data.orderNumber}`,
      react: AdminNewOrderEmail(data),
    });

    if (error) {
      console.error('Failed to send admin notification email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (_error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error };
  }
}

export async function sendOrderEmails(data: OrderEmailData) {
  // Send both emails in parallel
  const [customerResult, adminResult] = await Promise.all([
    sendOrderConfirmationEmail(data),
    sendAdminNewOrderEmail(data),
  ]);

  return {
    customer: customerResult,
    admin: adminResult,
  };
}

// Status labels in Russian
const statusLabels: Record<string, { label: string; message: string }> = {
  PENDING: {
    label: 'Заказ в обработке',
    message: 'Мы получили ваш заказ и начинаем его обработку',
  },
  IN_PREPRODUCTION: {
    label: 'Подготовка к производству',
    message: 'Ваш заказ находится на этапе подготовки к производству',
  },
  IN_DESIGN: {
    label: 'Дизайн и макетирование',
    message: 'Наши дизайнеры работают над макетом вашего заказа',
  },
  IN_PRODUCTION: {
    label: 'Заказ в производстве',
    message: 'Производство вашего заказа началось! Мы держим вас в курсе.',
  },
  IN_PRINTING: {
    label: 'Печать заказа',
    message: 'Ваш заказ находится в процессе печати',
  },
  QUALITY_CHECK: {
    label: 'Контроль качества',
    message: 'Мы проверяем качество вашего заказа перед упаковкой',
  },
  READY_FOR_DELIVERY: {
    label: 'Готов к отправке',
    message: 'Ваш заказ готов и будет отправлен в ближайшее время!',
  },
  DELIVERED: {
    label: 'Заказ доставлен',
    message: 'Ваш заказ был успешно доставлен! Спасибо за покупку!',
  },
  CANCELLED: {
    label: 'Заказ отменен',
    message: 'Ваш заказ был отменен. Если у вас есть вопросы, свяжитесь с нами.',
  },
};

export interface OrderStatusUpdateData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export async function sendOrderStatusUpdateEmail(data: OrderStatusUpdateData) {
  try {
    const resend = getResendClient();
    const statusConfig = statusLabels[data.status] || statusLabels.PENDING;

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Sanduta Art <noreply@sanduta.art>',
      to: data.customerEmail,
      subject: `${statusConfig.label} - Заказ #${data.orderNumber}`,
      react: OrderStatusUpdateEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        status: data.status,
        statusLabel: statusConfig.label,
        statusMessage: statusConfig.message,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
      }),
    });

    if (error) {
      console.error('Failed to send order status update email:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (_error) {
    console.error('Error sending order status update email:', error);
    return { success: false, error };
  }
}
