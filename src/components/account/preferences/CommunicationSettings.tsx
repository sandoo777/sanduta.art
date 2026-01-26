"use client";

import { useState, useEffect } from "react";
import { usePreferences } from "@/modules/account/usePreferences";
import { useTranslations } from "@/modules/i18n";
import { Mail, CheckCircle2 } from "lucide-react";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { communicationPreferencesSchema, type CommunicationPreferencesFormData } from "@/lib/validations/user-panel";

export const CommunicationSettings = () => {
  const { preferences, updateCommunicationPreferences } = usePreferences();
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: CommunicationPreferencesFormData) => {
    try {
      setSaving(true);
      await updateCommunicationPreferences(data);
    } catch (error) {
      console.error("Failed to update communication preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({
    checked,
    onChange,
    disabled,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? "bg-[#0066FF]" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );

  const communications = [
    {
      field: "newsletter" as const,
      label: t("preferences.communication.newsletter"),
      desc: t("preferences.communication.newsletterDesc"),
    },
    {
      field: "specialOffers" as const,
      label: t("preferences.communication.specialOffers"),
      desc: t("preferences.communication.specialOffersDesc"),
    },
    {
      field: "personalizedRecommend" as const,
      label: t("preferences.communication.recommendations"),
      desc: t("preferences.communication.recommendationsDesc"),
    },
    {
      field: "productNews" as const,
      label: t("preferences.communication.productNews"),
      desc: t("preferences.communication.productNewsDesc"),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Mail className="w-5 h-5 text-[#0066FF]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("preferences.communication.title")}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t("preferences.communication.subtitle")}
          </p>
        </div>
      </div>

      <Form<CommunicationPreferencesFormData>
        schema={communicationPreferencesSchema}
        onSubmit={handleSubmit}
        defaultValues={{
          newsletter: preferences?.newsletter ?? false,
          specialOffers: preferences?.specialOffers ?? false,
          personalizedRecommend: preferences?.personalizedRecommend ?? false,
          productNews: preferences?.productNews ?? false,
        }}
      >
        <div className="space-y-4">
          {communications.map((item) => (
            <FormField<CommunicationPreferencesFormData> key={item.field} name={item.field}>
              {({ value, onChange }) => (
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{item.desc}</div>
                  </div>
                  <Toggle
                    checked={value as boolean}
                    onChange={async (newValue) => {
                      onChange({ target: { value: newValue } } as any);
                      // Auto-submit on toggle
                      const newData = {
                        newsletter: item.field === 'newsletter' ? newValue : (preferences?.newsletter ?? false),
                        specialOffers: item.field === 'specialOffers' ? newValue : (preferences?.specialOffers ?? false),
                        personalizedRecommend: item.field === 'personalizedRecommend' ? newValue : (preferences?.personalizedRecommend ?? false),
                        productNews: item.field === 'productNews' ? newValue : (preferences?.productNews ?? false),
                      };
                      handleSubmit(newData);
                    }}
                    disabled={saving}
                  />
                </div>
              )}
            </FormField>
          ))}
        </div>
      </Form>

      {saving && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
          <CheckCircle2 className="w-4 h-4 animate-pulse" />
          {t("common.loading")}
        </div>
      )}
    </div>
  );
};
