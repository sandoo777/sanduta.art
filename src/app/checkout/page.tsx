'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { cart, total, clearCart, removeFromCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Корзина пуста');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: cart,
          total,
          customer_name: customerName,
          customer_email: customerEmail,
        }),
      });
      const data = await res.json();
      setResponse(data);
      if (res.ok) {
        clearCart();
      }
    } catch (err) {
      setResponse({ error: 'Failed to submit order' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>

        {cart.length === 0 ? (
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

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Отправка...' : 'Оформить заказ'}
              </button>
            </form>

            {response && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-semibold mb-4">Ответ сервера</h2>
                <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(response, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}