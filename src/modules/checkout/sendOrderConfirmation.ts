import { render } from '@react-email/render';
import OrderConfirmationEmail from '@/emails/orderConfirmation';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  specifications?: {
    dimensions?: {
      width: number;
      height: number;
      depth?: number;
    };
    material?: {
      name: string;
    };
  };
}

interface SendOrderConfirmationParams {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    number: string;
    apt?: string;
    city: string;
    country: string;
    postalCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  vat: number;
  shippingCost: number;
  total: number;
  deliveryMethod: {
    name: string;
    estimatedDays: string;
  };
  paymentMethod: {
    name: string;
    type: string;
  };
  createdAt: Date;
}

interface SendEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Trimite email de confirmare pentru comandă
 * Folosește Resend ca provider de email
 */
export async function sendOrderConfirmation(
  params: SendOrderConfirmationParams
): Promise<SendEmailResult> {
  try {
    // Generează HTML-ul emailului
    const emailHtml = render(OrderConfirmationEmail(params));

    // Trimite email prin provider
    // TODO: Implementează integrarea cu Resend/SendGrid/Mailgun
    
    // Verifică dacă există API key pentru Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return {
        success: false,
        error: 'Email provider not configured',
      };
    }

    // Trimite email prin Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Sanduta Art <comenzi@sanduta.art>',
        to: params.customerEmail,
        subject: `Confirmarea comenzii #${params.orderNumber}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send email:', errorData);
      return {
        success: false,
        error: 'Failed to send email',
      };
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Trimite email de notificare către admin pentru comandă nouă
 */
export async function sendAdminOrderNotification(
  params: SendOrderConfirmationParams
): Promise<SendEmailResult> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sanduta.art';

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured. Admin notification not sent.');
      return {
        success: false,
        error: 'Email provider not configured',
      };
    }

    // Email simplu pentru admin
    const adminEmailHtml = `
      <h2>Comandă nouă #${params.orderNumber}</h2>
      <p><strong>Client:</strong> ${params.customerName}</p>
      <p><strong>Email:</strong> ${params.customerEmail}</p>
      <p><strong>Telefon:</strong> ${params.customerPhone}</p>
      <p><strong>Total:</strong> ${params.total.toFixed(2)} RON</p>
      <p><strong>Produse:</strong> ${params.items.length}</p>
      <hr />
      <p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders/${params.orderId}">
          Vezi comanda în admin
        </a>
      </p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Sanduta Art <comenzi@sanduta.art>',
        to: adminEmail,
        subject: `Comandă nouă #${params.orderNumber}`,
        html: adminEmailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send admin notification:', errorData);
      return {
        success: false,
        error: 'Failed to send admin notification',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
