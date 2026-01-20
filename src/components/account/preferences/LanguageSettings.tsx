"use client";

import { useState } from "react";
import { usePreferences, Language } from "@/modules/account/usePreferences";
import { useTranslations } from "@/modules/i18n";
import { CheckCircle2, Globe } from "lucide-react";

export const LanguageSettings = () => {
  const { preferences, updateLanguage } = usePreferences();
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);

  const languages: { value: Language; label: string; nativeLabel: string }[] = [
    { value: "RO", label: t("preferences.language.ro"), nativeLabel: "Română" },
    { value: "EN", label: t("preferences.language.en"), nativeLabel: "English" },
    { value: "RU", label: t("preferences.language.ru"), nativeLabel: "Русский" },
  ];

  const handleLanguageChange = async (language: Language) => {
    try {
      setSaving(true);
      await updateLanguage(language);
      // UI se va actualiza automat prin i18n store
    } catch (_error) {
      console.error("Failed to update language:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Globe className="w-5 h-5 text-[#0066FF]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("preferences.language.title")}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t("preferences.language.subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {languages.map((lang) => {
          const isSelected = preferences?.language === lang.value;
          return (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              disabled={saving || isSelected}
              className={`
                w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? "border-[#0066FF] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }
                ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? "border-[#0066FF] bg-[#0066FF]" : "border-gray-300"}
                `}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    {lang.nativeLabel}
                  </div>
                  <div className="text-sm text-gray-600">{lang.label}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {saving && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          {t("common.loading")}
        </div>
      )}
    </div>
  );
};
