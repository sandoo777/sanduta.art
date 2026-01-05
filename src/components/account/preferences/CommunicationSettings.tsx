"use client";

import { useState } from "react";
import { usePreferences } from "@/modules/account/usePreferences";
import { useTranslations } from "@/modules/i18n";
import { Mail, CheckCircle2 } from "lucide-react";

export const CommunicationSettings = () => {
  const { preferences, updateCommunicationPreferences } = usePreferences();
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (field: string, value: boolean) => {
    try {
      setSaving(true);
      await updateCommunicationPreferences({ [field]: value });
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
      field: "newsletter",
      label: t("preferences.communication.newsletter"),
      desc: t("preferences.communication.newsletterDesc"),
    },
    {
      field: "specialOffers",
      label: t("preferences.communication.specialOffers"),
      desc: t("preferences.communication.specialOffersDesc"),
    },
    {
      field: "personalizedRecommend",
      label: t("preferences.communication.recommendations"),
      desc: t("preferences.communication.recommendationsDesc"),
    },
    {
      field: "productNews",
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

      <div className="space-y-4">
        {communications.map((item) => (
          <div
            key={item.field}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900">{item.label}</div>
              <div className="text-sm text-gray-600 mt-0.5">{item.desc}</div>
            </div>
            <Toggle
              checked={
                preferences?.[
                  item.field as keyof typeof preferences
                ] as boolean ?? false
              }
              onChange={(value) => handleToggle(item.field, value)}
              disabled={saving}
            />
          </div>
        ))}
      </div>

      {saving && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
          <CheckCircle2 className="w-4 h-4 animate-pulse" />
          {t("common.loading")}
        </div>
      )}
    </div>
  );
};
