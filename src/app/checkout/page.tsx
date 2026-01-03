'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateCheckoutForm, validateEmail, validatePhone, ValidationError } from '@/lib/validation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface City {
  Ref: string;
  Description: string;
}

interface PickupPoint {
  Ref: string;
  Description: string;
  Address: string;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
        <Footer />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { cart, total, clearCart, removeFromCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paynet');
  const [deliveryMethod, setDeliveryMethod] = useState('home');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    } else {
      setCustomerName(session.user?.name || '');
      setCustomerEmail(session.user?.email || '');
    }
  }, [session, status, router]);

  // Check if coming back from payment
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const payment = searchParams.get('payment');
    if (orderId && payment === 'success') {
      setResponse({
        message: 'Payment successful! Your order has been confirmed.',
        orderId,
      });
    }
  }, [searchParams]);

  const handleCitySearch = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setCities([]);
      return;
    }

    try {
      const res = await fetch(
        `/api/delivery/novaposhta/cities?search=${encodeURIComponent(searchTerm)}`
      );
      const data = await res.json();
      setCities(data.cities || []);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  const handleCitySelect = async (selectedCity: string) => {
    setCity(selectedCity);
    setCities([]);
    setFieldErrors(prev => ({ ...prev, city: '' }));

    // Fetch pickup points for selected city
    if (deliveryMethod === 'pickup') {
      try {
        const res = await fetch(
          `/api/delivery/novaposhta/pickup-points?city=${encodeURIComponent(selectedCity)}`
        );
        const data = await res.json();
        setPickupPoints(data.pickupPoints || []);
      } catch (err) {
        console.error('Error fetching pickup points:', err);
      }
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    switch (field) {
      case 'customerName':
        setCustomerName(value);
        break;
      case 'customerEmail':
        setCustomerEmail(value);
        break;
      case 'customerPhone':
        setCustomerPhone(value);
        break;
      case 'address':
        setAddress(value);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (cart.length === 0) {
      setResponse({ error: 'Корзина пуста' });
      return;
    }

    // Validate form
    const errors = validateCheckoutForm({
      customerName,
      customerEmail,
      customerPhone,
      city,
      address: deliveryMethod === 'pickup' ? selectedPickupPoint : address,
      deliveryMethod,
    });

    if (errors.length > 0) {
      const errorMap: { [key: string]: string } = {};
      errors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setFieldErrors(errorMap);
      return;
    }

    if (deliveryMethod === 'pickup' && !selectedPickupPoint) {
      setFieldErrors({ selectedPickupPoint: 'Пожалуйста, выберите пункт выдачи' });
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: cart,
          total,
          customer_name: customerName,
          customer_email: customerEmail,
          userId: session?.user?.id,
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderRes.json();
      const orderId = orderData.order.id;

      // Register delivery with Nova Poshta
      try {
        const deliveryRes = await fetch('/api/delivery/novaposhta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            customerPhone,
            city,
            address: deliveryMethod === 'pickup' ? selectedPickupPoint : address,
            deliveryType: deliveryMethod,
            pickupPointRef: deliveryMethod === 'pickup' ? selectedPickupPoint : undefined,
          }),
        });

        if (!deliveryRes.ok) {
          console.error('Failed to create shipment');
        }
      } catch (err) {
        console.error('Error registering delivery:', err);
      }

      // Handle payment
      if (paymentMethod === 'paynet') {
        const paymentRes = await fetch('/api/payment/paynet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        if (!paymentRes.ok) {
          throw new Error('Failed to create payment session');
        }

        const paymentData = await paymentRes.json();
        setResponse({
          message: 'Redirecting to payment...',
          orderId,
        });

        // Redirect to Paynet
        window.location.href = paymentData.paymentUrl;
      } else {
        // COD (Cash on Delivery)
        setResponse({
          message: 'Order created successfully! You will pay upon delivery.',
          orderId,
        });
        clearCart();
      }
    } catch (err) {
      setFieldErrors({ 
        submit: err instanceof Error ? err.message : 'Failed to submit order'
      });
    }
    setLoading(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>

          {cart.length === 0 && !response ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600">Корзина пуста</p>
            </div>
          ) : (
            <>
              {/* Cart Summary */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Ваша корзина</h2>
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium">{item.product.name}</span>
                      <span className="ml-2 text-gray-600">x{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Итого:</span>
                    <span className="text-blue-600">{total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>

              {!response && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Delivery Error */}
                  {fieldErrors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {fieldErrors.submit}
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-6">Личные данные</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Имя *</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => handleFieldChange('customerName', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            fieldErrors.customerName ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {fieldErrors.customerName && (
                          <p className="text-red-600 text-sm mt-1">{fieldErrors.customerName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Email *</label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => handleFieldChange('customerEmail', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            fieldErrors.customerEmail ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {fieldErrors.customerEmail && (
                          <p className="text-red-600 text-sm mt-1">{fieldErrors.customerEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Телефон *</label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            fieldErrors.customerPhone ? 'border-red-500' : ''
                          }`}
                          placeholder="+380501234567"
                          required
                        />
                        {fieldErrors.customerPhone && (
                          <p className="text-red-600 text-sm mt-1">{fieldErrors.customerPhone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-6">Доставка</h3>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50" style={{ borderColor: deliveryMethod === 'home' ? '#2563eb' : '#e5e7eb' }}>
                          <input
                            type="radio"
                            value="home"
                            checked={deliveryMethod === 'home'}
                            onChange={(e) => {
                              setDeliveryMethod(e.target.value);
                              setPickupPoints([]);
                              setSelectedPickupPoint('');
                            }}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">Доставка на дом (Nova Poshta)</div>
                            <div className="text-sm text-gray-600">Стандартная доставка почтой</div>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50" style={{ borderColor: deliveryMethod === 'pickup' ? '#2563eb' : '#e5e7eb' }}>
                          <input
                            type="radio"
                            value="pickup"
                            checked={deliveryMethod === 'pickup'}
                            onChange={(e) => {
                              setDeliveryMethod(e.target.value);
                              if (city) {
                                handleCitySelect(city);
                              }
                            }}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">Пункт выдачи (Nova Poshta)</div>
                            <div className="text-sm text-gray-600">Быстрее и дешевле</div>
                          </div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Город *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            handleCitySearch(e.target.value);
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            fieldErrors.city ? 'border-red-500' : ''
                          }`}
                          placeholder="Введите город"
                          required
                        />
                        {fieldErrors.city && (
                          <p className="text-red-600 text-sm mt-1">{fieldErrors.city}</p>
                        )}
                        {cities.length > 0 && (
                          <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto bg-white">
                            {cities.map((c) => (
                              <div
                                key={c.Ref}
                                onClick={() => handleCitySelect(c.Description)}
                                className="p-3 cursor-pointer hover:bg-blue-100 border-b last:border-0"
                              >
                                {c.Description}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {deliveryMethod === 'home' && (
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Адрес *</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => handleFieldChange('address', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                              fieldErrors.address ? 'border-red-500' : ''
                            }`}
                            placeholder="Улица, дом, квартира"
                            required={deliveryMethod === 'home'}
                          />
                          {fieldErrors.address && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.address}</p>
                          )}
                        </div>
                      )}

                      {deliveryMethod === 'pickup' && pickupPoints.length > 0 && (
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Пункт выдачи *</label>
                          <select
                            value={selectedPickupPoint}
                            onChange={(e) => {
                              setSelectedPickupPoint(e.target.value);
                              setFieldErrors(prev => ({ ...prev, selectedPickupPoint: '' }));
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                              fieldErrors.selectedPickupPoint ? 'border-red-500' : ''
                            }`}
                            required
                          >
                            <option value="">Выберите пункт выдачи</option>
                            {pickupPoints.map((p) => (
                              <option key={p.Ref} value={p.Ref}>
                                {p.Description} - {p.Address}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.selectedPickupPoint && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.selectedPickupPoint}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-6">Способ оплаты</h3>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50" style={{ borderColor: paymentMethod === 'paynet' ? '#2563eb' : '#e5e7eb' }}>
                        <input
                          type="radio"
                          value="paynet"
                          checked={paymentMethod === 'paynet'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Карта VISA/MasterCard (Paynet)</div>
                          <div className="text-sm text-gray-600">Безопасная онлайн оплата</div>
                        </div>
                      </label>

                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50" style={{ borderColor: paymentMethod === 'cod' ? '#2563eb' : '#e5e7eb' }}>
                        <input
                          type="radio"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Оплата при получении</div>
                          <div className="text-sm text-gray-600">Удобно и безопасно</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Обработка...' : 'Оформить заказ'}
                  </button>
                </form>
              )}

              {response && (
                <div className={`bg-white p-8 rounded-lg shadow-md text-center ${response.error ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`}>
                  {response.error ? (
                    <>
                      <h2 className="text-xl font-semibold text-red-600 mb-2">Ошибка</h2>
                      <p className="text-gray-600">{response.error}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-green-600 mb-2">{response.message}</h2>
                      {response.orderId && (
                        <p className="text-gray-600 mt-4">
                          ID заказа: <span className="font-mono font-semibold">{response.orderId}</span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
