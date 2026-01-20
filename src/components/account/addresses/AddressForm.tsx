"use client";

import { Form, FormField, FormLabel, FormMessage, Input, Button } from "@/components/ui";
import { addressSchema, type AddressFormData } from "@/lib/validations/user-panel";
import { Address } from "@/modules/account/useAccount";

interface AddressFormProps {
  editingAddress?: Address | null;
  onSubmit: (data: AddressFormData) => Promise<boolean>;
  onCancel: () => void;
}

export default function AddressForm({ editingAddress, onSubmit, onCancel }: AddressFormProps) {
  const handleSubmit = async (data: AddressFormData) => {
    const success = await onSubmit(data);
    if (success) {
      onCancel(); // Close form after success
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingAddress ? "Editează adresa" : "Adresă nouă"}
      </h3>
      
      <Form<AddressFormData>
        schema={addressSchema}
        onSubmit={handleSubmit}
        defaultValues={{
          name: editingAddress?.name || "",
          phone: editingAddress?.phone || "",
          address: editingAddress?.address || "",
          city: editingAddress?.city || "",
          country: editingAddress?.country || "Moldova",
          postalCode: editingAddress?.postalCode || "",
          isDefault: editingAddress?.isDefault || false,
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField<AddressFormData> name="name">
            {({ value, onChange, onBlur, error }) => (
              <div>
                <FormLabel htmlFor="name" required>Nume complet</FormLabel>
                <Input
                  id="name"
                  type="text"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="Ion Popescu"
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>

          <FormField<AddressFormData> name="phone">
            {({ value, onChange, onBlur, error }) => (
              <div>
                <FormLabel htmlFor="phone" required>Telefon</FormLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="+373 69 123 456"
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>
        </div>

        <FormField<AddressFormData> name="address">
          {({ value, onChange, onBlur, error }) => (
            <div>
              <FormLabel htmlFor="address" required>Adresă completă</FormLabel>
              <Input
                id="address"
                type="text"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={error}
                placeholder="Strada, număr, bloc, scară, apartament"
              />
              <FormMessage error={error} />
            </div>
          )}
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField<AddressFormData> name="city">
            {({ value, onChange, onBlur, error }) => (
              <div>
                <FormLabel htmlFor="city" required>Oraș</FormLabel>
                <Input
                  id="city"
                  type="text"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="Chișinău"
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>

          <FormField<AddressFormData> name="country">
            {({ value, onChange, onBlur, error }) => (
              <div>
                <FormLabel htmlFor="country" required>Țară</FormLabel>
                <Input
                  id="country"
                  type="text"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="Moldova"
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>

          <FormField<AddressFormData> name="postalCode">
            {({ value, onChange, onBlur, error }) => (
              <div>
                <FormLabel htmlFor="postalCode">Cod poștal</FormLabel>
                <Input
                  id="postalCode"
                  type="text"
                  value={value || ""}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={error}
                  placeholder="MD-2001"
                />
                <FormMessage error={error} />
              </div>
            )}
          </FormField>
        </div>

        <FormField<AddressFormData> name="isDefault">
          {({ value, onChange, onBlur }) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={value}
                onChange={(e) => onChange({ target: { value: e.target.checked } } as any)}
                onBlur={onBlur}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Setează ca adresă implicită
              </label>
            </div>
          )}
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="px-6">
            {editingAddress ? "Actualizează" : "Adaugă adresa"}
          </Button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Anulează
          </button>
        </div>
      </Form>
    </div>
  );
}
