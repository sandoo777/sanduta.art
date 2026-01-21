'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '@/components/ui';
import { MapPin, Plus, Edit2, Trash2, Star, Loader2 } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  county: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    name: '',
    phone: '',
    street: '',
    city: '',
    county: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/account/addresses');
      const data = await response.json();
      setAddresses(data);
    } catch (_error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : '/api/account/addresses';
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save address');

      await fetchAddresses();
      resetForm();
    } catch (_error) {
      console.error('Error saving address:', error);
      alert('Eroare la salvarea adresei');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur vrei să ștergi această adresă?')) return;

    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete address');

      await fetchAddresses();
    } catch (_error) {
      console.error('Error deleting address:', error);
      alert('Eroare la ștergerea adresei');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/account/addresses/${id}/default`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to set default');

      await fetchAddresses();
    } catch (_error) {
      console.error('Error setting default:', error);
      alert('Eroare la setarea adresei implicite');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      county: address.county,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      street: '',
      city: '',
      county: '',
      postalCode: '',
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <LoadingState text="Se încarcă adresele..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Adresele Mele</h1>
          <p className="text-gray-600 mt-2">
            Gestionează adresele de livrare
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Adresă
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingId ? 'Editează Adresa' : 'Adaugă Adresă Nouă'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Contact *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ion Popescu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="0712345678"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresă Completă *
                </label>
                <Input
                  type="text"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="Strada, Număr, Bloc, Scara, Apartament"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oraș *
                </label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="București"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Județ *
                </label>
                <Input
                  type="text"
                  value={formData.county}
                  onChange={(e) =>
                    setFormData({ ...formData, county: e.target.value })
                  }
                  placeholder="Ilfov"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cod Poștal *
                </label>
                <Input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  placeholder="012345"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Setează ca adresă implicită
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                onClick={resetForm}
                variant="secondary"
              >
                Anulează
              </Button>
              <Button type="submit" variant="primary">
                {editingId ? 'Actualizează' : 'Adaugă'} Adresa
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nicio adresă salvată
            </h3>
            <p className="text-gray-600 mb-4">
              Adaugă o adresă pentru a facilita procesul de comandă
            </p>
            <Button onClick={() => setShowForm(true)} variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Prima Adresă
            </Button>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {address.name}
                    </h3>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        Implicit
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {address.street}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    {address.city}, {address.county}, {address.postalCode}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tel: {address.phone}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!address.isDefault && (
                    <Button
                      onClick={() => handleSetDefault(address.id)}
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleEdit(address)}
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(address.id)}
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
