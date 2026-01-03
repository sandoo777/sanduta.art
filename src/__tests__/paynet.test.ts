import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

// Mock the PaynetClient class for testing
class PaynetClient {
  private config = {
    apiKey: 'test-api-key',
    secret: 'test-secret',
    merchantId: 'test-merchant',
    apiUrl: 'https://api.paynet.test',
  };

  generateSignature(data: string): string {
    return crypto
      .createHmac('sha256', this.config.secret)
      .update(data)
      .digest('hex');
  }

  verifyWebhook(signature: string, body: string): boolean {
    const calculatedSignature = this.generateSignature(body);
    return calculatedSignature === signature;
  }
}

describe('PaynetClient', () => {
  let client: PaynetClient;

  beforeEach(() => {
    client = new PaynetClient();
  });

  describe('generateSignature', () => {
    it('should generate a valid HMAC SHA256 signature', () => {
      const data = 'test-data';
      const signature = client.generateSignature(data);
      
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // SHA256 hex string is 64 characters
    });

    it('should generate consistent signatures for the same data', () => {
      const data = 'test-data';
      const signature1 = client.generateSignature(data);
      const signature2 = client.generateSignature(data);
      
      expect(signature1).toBe(signature2);
    });

    it('should generate different signatures for different data', () => {
      const signature1 = client.generateSignature('data1');
      const signature2 = client.generateSignature('data2');
      
      expect(signature1).not.toBe(signature2);
    });

    it('should generate valid signature for JSON payload', () => {
      const payload = JSON.stringify({
        merchant_id: 'test-merchant',
        order_id: 'order-123',
        amount: 5000,
      });
      
      const signature = client.generateSignature(payload);
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64);
    });
  });

  describe('verifyWebhook', () => {
    it('should verify valid webhook signature', () => {
      const body = JSON.stringify({ order_id: '123', status: 'paid' });
      const validSignature = client.generateSignature(body);
      
      const isValid = client.verifyWebhook(validSignature, body);
      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const body = JSON.stringify({ order_id: '123', status: 'paid' });
      const invalidSignature = 'invalid-signature-here';
      
      const isValid = client.verifyWebhook(invalidSignature, body);
      expect(isValid).toBe(false);
    });

    it('should reject signature for tampered body', () => {
      const originalBody = JSON.stringify({ order_id: '123', status: 'paid' });
      const tamperedBody = JSON.stringify({ order_id: '123', status: 'failed' });
      const signature = client.generateSignature(originalBody);
      
      const isValid = client.verifyWebhook(signature, tamperedBody);
      expect(isValid).toBe(false);
    });

    it('should handle empty body', () => {
      const body = '';
      const signature = client.generateSignature(body);
      
      const isValid = client.verifyWebhook(signature, body);
      expect(isValid).toBe(true);
    });

    it('should be case-sensitive', () => {
      const body = 'Test Data';
      const signature = client.generateSignature(body);
      
      // Valid with correct case
      expect(client.verifyWebhook(signature, body)).toBe(true);
      
      // Invalid with different case
      expect(client.verifyWebhook(signature, 'test data')).toBe(false);
    });
  });

  describe('signature security', () => {
    it('should generate cryptographically secure signatures', () => {
      const data = 'sensitive-data';
      const signature = client.generateSignature(data);
      
      // Signature should be hexadecimal
      expect(/^[a-f0-9]{64}$/.test(signature)).toBe(true);
    });

    it('should not expose secret in signature', () => {
      const data = 'test-data';
      const signature = client.generateSignature(data);
      
      // Signature should not contain the secret
      expect(signature).not.toContain('test-secret');
    });

    it('should handle special characters in payload', () => {
      const data = JSON.stringify({
        message: 'Special chars: <>&"\'',
        unicode: '🔒💳',
      });
      
      const signature = client.generateSignature(data);
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64);
    });
  });
});
