"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerFormSchema, type CustomerFormData } from "@/lib/validations/admin";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCustomers, type Customer } from "@/modules/customers/useCustomers";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

export default function CustomerModal({
  isOpen,
  onClose,
  onSuccess,
  customer,
}: CustomerModalProps) {
  const { createCustomer, updateCustomer, loading } = useCustomers();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      country: "",
    },
  });

  // Load customer data when editing
  useEffect(() => {
    if (!isOpen) return;
    
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        company: customer.company || "",
        address: customer.address || "",
        city: customer.city || "",
        country: customer.country || "",
      });
    } else {
      // Reset form when creating new
      form.reset({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        city: "",
        country: "",
      });
    }
  }, [customer, isOpen, form]);

  // Handle form submission
  const onSubmit = async (data: CustomerFormData) => {
    try {
      // Remove empty strings
      const cleanData: Record<string, string> = {
        name: data.name.trim(),
      };
      
      if (data.email?.trim()) cleanData.email = data.email.trim();
      if (data.phone?.trim()) cleanData.phone = data.phone.trim();
      if (data.company?.trim()) cleanData.company = data.company.trim();
      if (data.address?.trim()) cleanData.address = data.address.trim();
      if (data.city?.trim()) cleanData.city = data.city.trim();
      if (data.country?.trim()) cleanData.country = data.country.trim();

      if (customer) {
        await updateCustomer(customer.id, cleanData);
      } else {
        await createCustomer(cleanData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Eroare necunoscută";
      form.setError('root', { message: errorMessage });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {customer ? "Editează Client" : "Adaugă Client Nou"}
          </h2>
        </div>

        {/* Form */}
        <Form form={form} onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Error message */}
          {form.formState.errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {form.formState.errors.root.message}
            </div>
          )}

          {/* Name - Required */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <div>
                <FormLabel>
                  Nume <span className="text-red-500">*</span>
                </FormLabel>
                <Input {...field} placeholder="Ion Popescu" />
                <FormMessage />
              </div>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <div>
                <FormLabel>Email</FormLabel>
                <Input {...field} type="email" placeholder="ion@example.com" />
                <FormMessage />
              </div>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <div>
                <FormLabel>Telefon</FormLabel>
                <Input {...field} type="tel" placeholder="+40721234567" />
                <FormMessage />
              </div>
            )}
          />

          {/* Company */}
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <div>
                <FormLabel>Companie</FormLabel>
                <Input {...field} placeholder="SC Example SRL" />
                <FormMessage />
              </div>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <div>
                <FormLabel>Adresă</FormLabel>
                <Input {...field} placeholder="Str. Principală 123" />
                <FormMessage />
              </div>
            )}
          />

          {/* City and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <div>
                  <FormLabel>Oraș</FormLabel>
                  <Input {...field} placeholder="București" />
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <div>
                  <FormLabel>Țară</FormLabel>
                  <Input {...field} placeholder="România" />
                  <FormMessage />
                </div>
              )}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || form.formState.isSubmitting}
            >
              {loading || form.formState.isSubmitting ? "Se salvează..." : customer ? "Actualizează" : "Adaugă Client"}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
