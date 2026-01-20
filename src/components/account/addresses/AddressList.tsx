"use client";

import { useEffect, useState } from "react";
import { useAccount, Address } from "@/modules/account/useAccount";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import AddressForm from "./AddressForm";
import { AddressFormData } from "@/lib/validations/user-panel";

export default function AddressList() {
  const {
    addresses,
    loading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAccount();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (data: AddressFormData): Promise<boolean> => {
    let success = false;
    if (editingAddress) {
      success = await updateAddress(editingAddress.id, data);
    } else {
      success = await addAddress(data);
    }
    
    if (success) {
      resetForm();
    }
    return success;
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi această adresă?")) {
      return;
    }
    await deleteAddress(addressId);
  };

  const handleSetDefault = async (addressId: string) => {
    await setDefaultAddress(addressId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Se încarcă adresele...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Address Button */}
      {!showForm && (
        <div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            Adaugă adresă nouă
          </button>
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <AddressForm
          editingAddress={editingAddress}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nu ai adrese salvate
            </h3>
            <p className="text-gray-600">
              Adaugă o adresă de livrare pentru a finaliza comenzile mai rapid.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-lg border-2 p-6 relative ${
                address.isDefault
                  ? "border-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    <CheckCircleIcon className="w-4 h-4" />
                    Implicită
                  </span>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {address.name}
                </h3>
                <p className="text-sm text-gray-600">{address.phone}</p>
                <p className="text-sm text-gray-700">{address.address}</p>
                <p className="text-sm text-gray-600">
                  {address.city}
                  {address.postalCode && `, ${address.postalCode}`},{" "}
                  {address.country}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Setează ca implicită
                  </button>
                )}
                <button
                  onClick={() => handleEdit(address)}
                  className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <PencilIcon className="w-4 h-4" />
                  Editează
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
