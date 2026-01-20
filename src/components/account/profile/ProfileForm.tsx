"use client";

import { useEffect, useState } from "react";
import { useAccount, UserProfile } from "@/modules/account/useAccount";
import { Form, FormField, FormLabel, FormMessage, Input, Button } from "@/components/ui";
import { profileSchema, type ProfileFormData } from "@/lib/validations/user-panel";

export default function ProfileForm() {
  const { profile, loading, fetchProfile, updateProfile } = useAccount();
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    setSuccessMessage("");

    const success = await updateProfile(data);

    if (success) {
      setSuccessMessage("Profilul a fost actualizat cu succes!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Se încarcă datele...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <Form<ProfileFormData>
        schema={profileSchema}
        onSubmit={handleSubmit}
        defaultValues={{
          name: profile?.name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
          company: profile?.company || "",
          cui: profile?.cui || "",
        }}
        className="space-y-6"
      >
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informații personale
          </h3>
          <div className="space-y-4">
            <FormField<ProfileFormData> name="name">
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

            <FormField<ProfileFormData> name="email">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="email" required>Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={error}
                    placeholder="ion@example.com"
                  />
                  <FormMessage error={error} />
                  <p className="mt-1 text-xs text-gray-500">
                    Schimbarea email-ului poate necesita reverificare
                  </p>
                </div>
              )}
            </FormField>

            <FormField<ProfileFormData> name="phone">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="phone">Telefon</FormLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={value || ""}
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
        </div>

        {/* Company Information */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informații firmă (opțional)
          </h3>
          <div className="space-y-4">
            <FormField<ProfileFormData> name="company">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="company">Nume firmă</FormLabel>
                  <Input
                    id="company"
                    type="text"
                    value={value || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={error}
                    placeholder="SC Example SRL"
                  />
                  <FormMessage error={error} />
                </div>
              )}
            </FormField>

            <FormField<ProfileFormData> name="cui">
              {({ value, onChange, onBlur, error }) => (
                <div>
                  <FormLabel htmlFor="cui">CUI / CIF</FormLabel>
                  <Input
                    id="cui"
                    type="text"
                    value={value || ""}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={error}
                    placeholder="1234567890"
                  />
                  <FormMessage error={error} />
                  <p className="mt-1 text-xs text-gray-500">
                    Pentru facturi cu TVA
                  </p>
                </div>
              )}
            </FormField>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <Button
            type="submit"
            loading={saving}
            className="w-full md:w-auto px-8"
          >
            {saving ? "Se salvează..." : "Salvează modificările"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
