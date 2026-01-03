import { Resend } from 'resend';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import AdminNewOrderEmail from '@/emails/admin-new-order';

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
  } catch (error) {
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
  } catch (error) {
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
