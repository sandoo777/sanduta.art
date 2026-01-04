'use client';

import { useState } from 'react';
import { useOrders } from '@/modules/orders/useOrders';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  customDescription?: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

interface OrderItemsManagerProps {
  orderId: string;
  items: OrderItem[];
  onItemsChanged?: () => void;
}

export function OrderItemsManager({
  orderId,
  items,
  onItemsChanged,
}: OrderItemsManagerProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0,
    customDescription: '',
  });

  const { addItem, updateItem, deleteItem } = useOrders();

  const handleAddItem = async () => {
    if (!formData.productId || formData.quantity <= 0) {
      toast.error('Completează toate câmpurile');
      return;
    }

    setIsAddingItem(true);
    const result = await addItem(orderId, {
      productId: formData.productId,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      customDescription: formData.customDescription,
    });

    if (result.success) {
      toast.success('Articol adăugat cu succes');
      setFormData({
        productId: '',
        quantity: 1,
        unitPrice: 0,
        customDescription: '',
      });
      setShowAddForm(false);
      onItemsChanged?.();
    } else {
      toast.error('Eroare: ' + result.error);
    }
    setIsAddingItem(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Ștergi această articol?')) return;

    const result = await deleteItem(orderId, itemId);
    if (result.success) {
      toast.success('Articol șters cu succes');
      onItemsChanged?.();
    } else {
      toast.error('Eroare: ' + result.error);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleDeleteItem(itemId);
      return;
    }

    const result = await updateItem(orderId, itemId, { quantity: newQuantity });
    if (result.success) {
      toast.success('Cantitate actualizată');
      onItemsChanged?.();
    } else {
      toast.error('Eroare: ' + result.error);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Articole ({items.length})</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg
            text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Adaugă articol
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Produs
              </label>
              <input
                type="text"
                value={formData.productId}
                onChange={(e) =>
                  setFormData({ ...formData, productId: e.target.value })
                }
                placeholder="ex: prod_123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantitate
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preț unitar
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descriere (opțional)
              </label>
              <input
                type="text"
                value={formData.customDescription}
                onChange={(e) =>
                  setFormData({ ...formData, customDescription: e.target.value })
                }
                placeholder="Detalii suplimentare"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              disabled={isAddingItem}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium
                hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isAddingItem ? 'Se adaugă...' : 'Adaugă'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  productId: '',
                  quantity: 1,
                  unitPrice: 0,
                  customDescription: '',
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium
                hover:bg-gray-400 transition-colors"
            >
              Anulează
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nu sunt articole în comanda
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200
                rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {item.product?.name || `Produs ${item.productId}`}
                </p>
                {item.customDescription && (
                  <p className="text-xs text-gray-500 truncate">
                    {item.customDescription}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    className="px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
                <div className="w-20 text-right">
                  <p className="text-sm font-semibold">
                    {item.lineTotal.toFixed(2)} RON
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.unitPrice.toFixed(2)} /buc
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="pt-4 border-t-2 border-gray-300 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total articole:</span>
            <span className="font-semibold">{totalItems}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-green-600">{totalAmount.toFixed(2)} RON</span>
          </div>
        </div>
      )}
    </div>
  );
}
