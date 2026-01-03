import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateAddress,
  validateCustomerName,
  validateCheckoutForm,
} from '@/lib/validation';

describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    expect(validateEmail('admin+tag@site.org')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@domain')).toBe(false);
    expect(validateEmail('user @domain.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should accept valid phone numbers', () => {
    expect(validatePhone('+380501234567')).toBe(true);
    expect(validatePhone('0501234567')).toBe(true);
    expect(validatePhone('+1 (555) 123-4567')).toBe(true);
    expect(validatePhone('1234567890')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('abc')).toBe(false);
    expect(validatePhone('')).toBe(false);
    expect(validatePhone('12345')).toBe(false); // Too short
  });

  it('should handle phone numbers with spaces', () => {
    expect(validatePhone('+380 50 123 45 67')).toBe(true);
    expect(validatePhone('050 123 4567')).toBe(true);
  });
});

describe('validateAddress', () => {
  it('should accept valid addresses', () => {
    expect(validateAddress('Main Street 123')).toBe(true);
    expect(validateAddress('Khreschatyk 42, apt 5')).toBe(true);
    expect(validateAddress('12345')).toBe(true); // Minimum 5 characters
  });

  it('should reject invalid addresses', () => {
    expect(validateAddress('123')).toBe(false);
    expect(validateAddress('test')).toBe(false); // Less than 5 characters
    expect(validateAddress('  ')).toBe(false); // Only spaces
    expect(validateAddress('')).toBe(false);
  });

  it('should trim whitespace', () => {
    expect(validateAddress('  Street 123  ')).toBe(true);
    expect(validateAddress('   12   ')).toBe(false); // Less than 5 after trim
  });
});

describe('validateCustomerName', () => {
  it('should accept valid names', () => {
    expect(validateCustomerName('John')).toBe(true);
    expect(validateCustomerName('Андрей')).toBe(true);
    expect(validateCustomerName('A B')).toBe(true);
    expect(validateCustomerName('AB')).toBe(true); // Minimum 2 characters
  });

  it('should reject invalid names', () => {
    expect(validateCustomerName('A')).toBe(false);
    expect(validateCustomerName(' ')).toBe(false);
    expect(validateCustomerName('')).toBe(false);
  });

  it('should trim whitespace', () => {
    expect(validateCustomerName('  John  ')).toBe(true);
    expect(validateCustomerName('  A  ')).toBe(false);
  });
});

describe('validateCheckoutForm', () => {
  const validData = {
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+380501234567',
    city: 'Kyiv',
    address: 'Main Street 123',
    deliveryMethod: 'home',
  };

  it('should return no errors for valid data', () => {
    const errors = validateCheckoutForm(validData);
    expect(errors).toHaveLength(0);
  });

  it('should validate customer name', () => {
    const errors = validateCheckoutForm({
      ...validData,
      customerName: 'A',
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('customerName');
    expect(errors[0].message).toContain('не менее 2');
  });

  it('should validate email', () => {
    const errors = validateCheckoutForm({
      ...validData,
      customerEmail: 'invalid-email',
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('customerEmail');
    expect(errors[0].message).toContain('email');
  });

  it('should validate phone', () => {
    const errors = validateCheckoutForm({
      ...validData,
      customerPhone: '123',
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('customerPhone');
    expect(errors[0].message).toContain('телефона');
  });

  it('should validate city', () => {
    const errors = validateCheckoutForm({
      ...validData,
      city: '',
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('city');
    expect(errors[0].message).toContain('город');
  });

  it('should validate address for home delivery', () => {
    const errors = validateCheckoutForm({
      ...validData,
      address: '123',
      deliveryMethod: 'home',
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('address');
    expect(errors[0].message).toContain('адрес');
  });

  it('should not validate address for pickup delivery', () => {
    const errors = validateCheckoutForm({
      ...validData,
      address: '',
      deliveryMethod: 'pickup',
    });
    expect(errors).toHaveLength(0);
  });

  it('should return multiple errors for multiple invalid fields', () => {
    const errors = validateCheckoutForm({
      customerName: 'A',
      customerEmail: 'invalid',
      customerPhone: '123',
      city: '',
      address: '12',
      deliveryMethod: 'home',
    });
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});
