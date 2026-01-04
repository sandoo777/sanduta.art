'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { CheckoutCustomerForm } from '@/components/public/checkout/CheckoutCustomerForm';
import { CheckoutAddressForm } from '@/components/public/checkout/CheckoutAddressForm';
import { CheckoutDeliveryMethods } from '@/components/public/checkout/CheckoutDeliveryMethods';
import { CheckoutPaymentMethods } from '@/components/public/checkout/CheckoutPaymentMethods';
import { CheckoutSummary } from '@/components/public/checkout/CheckoutSummary';
import { useCheckout } from '@/modules/checkout/useCheckout';
import { useCartStore } from '@/modules/cart/cartStore';
import type {
  CustomerData,
  AddressData,
  DeliveryMethod,
  PaymentMethod,
} from '@/modules/checkout/useCheckout';

interface FormErrors {
  customer?: Record<string, string>;
  address?: Record<string, string>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { placeOrder, isLoading, error, calculateTotals } = useCheckout();
  const { items, getTotals } = useCartStore();

  // Form States
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    taxId: '',
  });

  const [addressData, setAddressData] = useState<AddressData>({
    country: 'România',
    city: '',
    street: '',
    number: '',
    apt: '',
    postalCode: '',
  });

  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryMethod | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  // Error states for form validation
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [orderError, setOrderError] = useState<string | null>(null);

  // Progress indicator for current step
  const [currentStep, setCurrentStep] = useState(1);

  // Validation handlers
  const handleValidateCustomer = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!customerData.firstName.trim()) {
      errors.firstName = 'Prenumele este obligatoriu';
    }
    if (!customerData.lastName.trim()) {
      errors.lastName = 'Numele de familie este obligatoriu';
    }
    if (!customerData.email.trim()) {
      errors.email = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.email = 'Email invalid';
    }
    if (!customerData.phone.trim()) {
      errors.phone = 'Telefonul este obligatoriu';
    }

    return errors;
  }, [customerData]);

  const handleValidateAddress = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!addressData.country) {
      errors.country = 'Selectează țara';
    }
    if (!addressData.city.trim()) {
      errors.city = 'Orașul este obligatoriu';
    }
    if (!addressData.street.trim()) {
      errors.street = 'Strada este obligatorie';
    }
    if (!addressData.number.trim()) {
      errors.number = 'Numărul este obligatoriu';
    }
    if (!addressData.postalCode.trim()) {
      errors.postalCode = 'Codul poștal este obligatoriu';
    }

    return errors;
  }, [addressData]);

  const handleValidateAll = useCallback(() => {
    const customerErrors = handleValidateCustomer();
    const addressErrors = handleValidateAddress();

    setFormErrors({
      customer: Object.keys(customerErrors).length > 0 ? customerErrors : undefined,
      address: Object.keys(addressErrors).length > 0 ? addressErrors : undefined,
    });

    return Object.keys(customerErrors).length === 0 && Object.keys(addressErrors).length === 0;
  }, [handleValidateCustomer, handleValidateAddress]);

  // Handle form submission
  const handleSubmitOrder = useCallback(async () => {
    // Validate all forms
    if (!handleValidateAll()) {
      setOrderError('Completeaza toate câmpurile obligatorii');
      return;
    }

    // Validate delivery method
    if (!selectedDelivery) {
      setOrderError('Selectează o metodă de livrare');
      return;
    }

    // Validate payment method
    if (!selectedPayment) {
      setOrderError('Selectează o metodă de plată');
      return;
    }

    setOrderError(null);

    // Calculate totals with shipping
    const totals = calculateTotals(selectedDelivery.price);

    // Call the placeOrder function
    const result = await placeOrder({
      customer: customerData,
      address: addressData,
      deliveryMethod: selectedDelivery,
      paymentMethod: selectedPayment,
      items,
      totals,
    });

    if (result.success) {
      // Redirect to success page with order ID
      router.push(`/checkout/success?orderId=${result.orderId}`);
    } else {
      setOrderError(result.error || 'Eroare la plasarea comenzii');
    }
  }, [
    handleValidateAll,
    selectedDelivery,
    selectedPayment,
    customerData,
    addressData,
    placeOrder,
    router,
    items,
    calculateTotals,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <a href="/" className="text-[#0066FF] hover:underline">
              Acasă
            </a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <a href="/products" className="text-[#0066FF] hover:underline">
              Produse
            </a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <a href="/cart" className="text-[#0066FF] hover:underline">
              Coș
            </a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold">Checkout</span>
          </nav>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">Finalizează comanda</h1>
          <p className="text-gray-600 mt-1">
            Completează datele și confirmă pentru a finaliza achiziția
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {orderError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Eroare</h3>
              <p className="text-sm text-red-700 mt-1">{orderError}</p>
            </div>
          </div>
        )}

        {/* Layout: Forms on left, Summary on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forms Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Form */}
            <CheckoutCustomerForm
              data={customerData}
              onChange={setCustomerData}
              errors={formErrors.customer}
            />

            {/* Address Form */}
            <CheckoutAddressForm
              data={addressData}
              onChange={setAddressData}
              errors={formErrors.address}
            />

            {/* Delivery Methods */}
            <CheckoutDeliveryMethods
              selected={selectedDelivery}
              onSelect={setSelectedDelivery}
            />

            {/* Payment Methods */}
            <CheckoutPaymentMethods
              selected={selectedPayment}
              onSelect={setSelectedPayment}
            />
          </div>

          {/* Summary Sidebar */}
          <div>
            <CheckoutSummary
              isLoading={isLoading}
              isProcessing={isLoading}
              onPlaceOrder={handleSubmitOrder}
            />
          </div>
        </div>

        {/* Mobile CTA (sticky bottom on mobile) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
          <button
            onClick={handleSubmitOrder}
            disabled={isLoading}
            className="w-full bg-[#0066FF] hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isLoading ? 'Se procesează...' : 'Plasează comanda'}
          </button>
        </div>

        {/* Bottom spacing for mobile CTA */}
        <div className="h-20 lg:hidden" />
      </div>
    </div>
  );
}
