import { useCallback, useState } from 'react';
import { useCartStore } from '@/modules/cart/cartStore';
import {
  sendOrderConfirmation,
  sendAdminOrderNotification,
} from './sendOrderConfirmation';

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  taxId?: string;
}

export interface AddressData {
  country: string;
  city: string;
  street: string;
  number: string;
  apt?: string;
  postalCode: string;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  estimatedDays: string;
  price: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'cash' | 'transfer' | 'pickup';
  icon?: string;
}

export interface CheckoutData {
  customer: CustomerData;
  address: AddressData;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  items: any[];
  totals: {
    subtotal: number;
    discount: number;
    vat: number;
    shipping: number;
    total: number;
  };
  createdAt: Date;
}

export function useCheckout() {
  const { getTotals, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validare email
  const isValidEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Validare telefon
  const isValidPhone = useCallback((phone: string) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }, []);

  // Validare date personale
  const validateCustomerData = useCallback(
    (data: CustomerData): { valid: boolean; errors: Record<string, string> } => {
      const errors: Record<string, string> = {};

      if (!data.firstName?.trim()) {
        errors.firstName = 'Numele este obligatoriu';
      }

      if (!data.lastName?.trim()) {
        errors.lastName = 'Prenumele este obligatoriu';
      }

      if (!data.email?.trim()) {
        errors.email = 'Email-ul este obligatoriu';
      } else if (!isValidEmail(data.email)) {
        errors.email = 'Email-ul nu este valid';
      }

      if (!data.phone?.trim()) {
        errors.phone = 'Telefonul este obligatoriu';
      } else if (!isValidPhone(data.phone)) {
        errors.phone = 'Telefonul nu este valid (min 10 cifre)';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [isValidEmail, isValidPhone]
  );

  // Validare adresă
  const validateAddress = useCallback(
    (data: AddressData): { valid: boolean; errors: Record<string, string> } => {
      const errors: Record<string, string> = {};

      if (!data.country?.trim()) {
        errors.country = 'Țara este obligatorie';
      }

      if (!data.city?.trim()) {
        errors.city = 'Orașul este obligatoriu';
      }

      if (!data.street?.trim()) {
        errors.street = 'Strada este obligatorie';
      }

      if (!data.number?.trim()) {
        errors.number = 'Numărul este obligatoriu';
      }

      if (!data.postalCode?.trim()) {
        errors.postalCode = 'Codul poștal este obligatoriu';
      }

      return {
        valid: Object.keys(errors).length === 0,
        errors,
      };
    },
    []
  );

  // Calculare totaluri
  const calculateTotals = useCallback(
    (shippingPrice: number) => {
      const cartTotals = getTotals();

      return {
        subtotal: cartTotals.subtotal,
        discount: cartTotals.discount,
        vat: cartTotals.vat,
        shipping: shippingPrice,
        total: cartTotals.subtotal - cartTotals.discount + cartTotals.vat + shippingPrice,
      };
    },
    [getTotals]
  );

  // Plasare comandă
  const placeOrder = useCallback(
    async (checkoutData: Omit<CheckoutData, 'createdAt'>) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validare date
        const customerValidation = validateCustomerData(checkoutData.customer);
        if (!customerValidation.valid) {
          throw new Error('Datele personale sunt incomplete');
        }

        const addressValidation = validateAddress(checkoutData.address);
        if (!addressValidation.valid) {
          throw new Error('Adresa este incompletă');
        }

        // Prepare payload
        const orderPayload = {
          ...checkoutData,
          createdAt: new Date(),
        };

        // Send to API
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Eroare la plasarea comenzii');
        }

        const result = await response.json();

        // Trimite email de confirmare către client
        try {
          await sendOrderConfirmation({
            orderId: result.orderId || result.id,
            orderNumber: result.orderNumber,
            customerName: `${checkoutData.customer.firstName} ${checkoutData.customer.lastName}`,
            customerEmail: checkoutData.customer.email,
            customerPhone: checkoutData.customer.phone,
            deliveryAddress: {
              street: checkoutData.address.street,
              number: checkoutData.address.number,
              apt: checkoutData.address.apt,
              city: checkoutData.address.city,
              country: checkoutData.address.country,
              postalCode: checkoutData.address.postalCode,
            },
            items: checkoutData.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              quantity: item.specifications?.quantity || 1,
              price: item.priceBreakdown?.basePrice || 0,
              totalPrice: item.totalPrice,
              specifications: {
                dimensions: item.specifications?.dimensions,
                material: item.specifications?.material,
              },
            })),
            subtotal: checkoutData.totals.subtotal,
            vat: checkoutData.totals.vat,
            shippingCost: checkoutData.totals.shipping,
            total: checkoutData.totals.total,
            deliveryMethod: {
              name: checkoutData.deliveryMethod.name,
              estimatedDays: checkoutData.deliveryMethod.estimatedDays,
            },
            paymentMethod: {
              name: checkoutData.paymentMethod.name,
              type: checkoutData.paymentMethod.type,
            },
            createdAt: new Date(),
          });

          // Trimite notificare către admin
          await sendAdminOrderNotification({
            orderId: result.orderId || result.id,
            orderNumber: result.orderNumber,
            customerName: `${checkoutData.customer.firstName} ${checkoutData.customer.lastName}`,
            customerEmail: checkoutData.customer.email,
            customerPhone: checkoutData.customer.phone,
            deliveryAddress: {
              street: checkoutData.address.street,
              number: checkoutData.address.number,
              apt: checkoutData.address.apt,
              city: checkoutData.address.city,
              country: checkoutData.address.country,
              postalCode: checkoutData.address.postalCode,
            },
            items: checkoutData.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              quantity: item.specifications?.quantity || 1,
              price: item.priceBreakdown?.basePrice || 0,
              totalPrice: item.totalPrice,
              specifications: {
                dimensions: item.specifications?.dimensions,
                material: item.specifications?.material,
              },
            })),
            subtotal: checkoutData.totals.subtotal,
            vat: checkoutData.totals.vat,
            shippingCost: checkoutData.totals.shipping,
            total: checkoutData.totals.total,
            deliveryMethod: {
              name: checkoutData.deliveryMethod.name,
              estimatedDays: checkoutData.deliveryMethod.estimatedDays,
            },
            paymentMethod: {
              name: checkoutData.paymentMethod.name,
              type: checkoutData.paymentMethod.type,
            },
            createdAt: new Date(),
          });
        } catch (emailError) {
          // Log email error but don't fail the order
          console.error('Failed to send confirmation email:', emailError);
        }

        // Clear cart on success
        clearCart();

        return {
          success: true,
          orderId: result.orderId,
          orderNumber: result.orderNumber,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Eroare necunoscută';
        setError(message);
        return {
          success: false,
          error: message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [validateCustomerData, validateAddress, clearCart]
  );

  return {
    isLoading,
    error,
    validateCustomerData,
    validateAddress,
    calculateTotals,
    placeOrder,
  };
}
