'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Корзина пуста');
      return;
    }

    if (!customerPhone || !city) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (deliveryMethod === 'pickup' && !selectedPickupPoint) {
      setError('Пожалуйста, выберите пункт выдачи');
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
      setError(err instanceof Error ? err.message : 'Failed to submit order');
    }
    setLoading(false);
  };

  if (status === 'loading') {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>

        {cart.length === 0 && !response ? (
          <p className="text-center">Корзина пуста</p>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Ваша корзина</h2>
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <div>
                    <span>{item.product.name}</span>
                    <span className="ml-2 text-gray-600">x{item.quantity}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{item.product.price * item.quantity} руб.</span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-4">
                <div className="flex justify-between font-bold">
                  <span>Итого:</span>
                  <span>{total} руб.</span>
                </div>
              </div>
            </div>

            {!response && (
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                {/* Personal Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Личные данные</h3>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Имя</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Телефон *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="+380501234567"
                      required
                    />
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Доставка</h3>
                  <div className="mb-4">
                    <label className="flex items-center mb-2">
                      <input
                        type="radio"
                        value="home"
                        checked={deliveryMethod === 'home'}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="mr-2"
                      />
                      Доставка на дом (Nova Poshta)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="pickup"
                        checked={deliveryMethod === 'pickup'}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="mr-2"
                      />
                      Пункт выдачи (Nova Poshta)
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Город *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        handleCitySearch(e.target.value);
                      }}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Введите город"
                      required
                    />
                    {cities.length > 0 && (
                      <div className="mt-2 border rounded max-h-40 overflow-y-auto">
                        {cities.map((c) => (
                          <div
                            key={c.Ref}
                            onClick={() => handleCitySelect(c.Description)}
                            className="p-2 cursor-pointer hover:bg-gray-100"
                          >
                            {c.Description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {deliveryMethod === 'home' && (
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Адрес *</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Улица, дом, квартира"
                        required
                      />
                    </div>
                  )}

                  {deliveryMethod === 'pickup' && pickupPoints.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Пункт выдачи *</label>
                      <select
                        value={selectedPickupPoint}
                        onChange={(e) => setSelectedPickupPoint(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                      >
                        <option value="">Выберите пункт выдачи</option>
                        {pickupPoints.map((p) => (
                          <option key={p.Ref} value={p.Ref}>
                            {p.Description} - {p.Address}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Способ оплаты</h3>
                  <label className="flex items-center mb-2">
                    <input
                      type="radio"
                      value="paynet"
                      checked={paymentMethod === 'paynet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Карта VISA/MasterCard (Paynet)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />
                    Оплата при получении (CoD)
                  </label>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Обработка...' : 'Оформить заказ'}
                </button>
              </form>
            )}

            {response && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-semibold mb-4">
                  {response.message}
                </h2>
                {response.orderId && (
                  <p className="text-gray-600">
                    ID заказа: <span className="font-mono font-semibold">{response.orderId}</span>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}