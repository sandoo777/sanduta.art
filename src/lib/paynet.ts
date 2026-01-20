import crypto from 'crypto';

interface PaynetConfig {
  apiKey: string;
  secret: string;
  merchantId: string;
  apiUrl: string;
}

interface PaynetSessionData {
  amount: number;
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
}

interface PaynetSessionResponse {
  session_id: string;
  payment_url: string;
  status: string;
}

class PaynetClient {
  private config: PaynetConfig;

  constructor() {
    this.config = {
      apiKey: process.env.PAYNET_API_KEY || '',
      secret: process.env.PAYNET_SECRET || '',
      merchantId: process.env.PAYNET_MERCHANT_ID || '',
      apiUrl: process.env.PAYNET_API_URL || 'https://api.paynet.example.com',
    };

    if (!this.config.apiKey || !this.config.secret) {
      console.warn('Paynet credentials not configured');
    }
  }

  private generateSignature(data: string): string {
    return crypto
      .createHmac('sha256', this.config.secret)
      .update(data)
      .digest('hex');
  }

  async createSession(data: PaynetSessionData): Promise<PaynetSessionResponse> {
    try {
      const payload = {
        merchant_id: this.config.merchantId,
        order_id: data.orderId,
        amount: data.amount,
        currency: 'RUB',
        description: data.description,
        customer_email: data.customerEmail,
        customer_name: data.customerName,
        return_url: data.returnUrl,
        language: 'ru',
      };

      const signature = this.generateSignature(JSON.stringify(payload));

      const response = await fetch(`${this.config.apiUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Signature': signature,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Paynet API error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (_error) {
      console.error('Error creating Paynet session:', error);
      throw error;
    }
  }

  async verifyWebhook(signature: string, body: string): Promise<boolean> {
    const calculatedSignature = this.generateSignature(body);
    return calculatedSignature === signature;
  }

  async getSessionStatus(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Paynet API error: ${response.status}`);
      }

      return await response.json();
    } catch (_error) {
      console.error('Error getting Paynet session status:', error);
      throw error;
    }
  }
}

export const paynetClient = new PaynetClient();
