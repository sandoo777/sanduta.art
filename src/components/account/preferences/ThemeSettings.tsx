"use client";

import { useState } from "react";
import { usePreferences, Theme } from "@/modules/account/usePreferences";
import { useTranslations } from "@/modules/i18n";
import { Sun, Moon, Monitor, CheckCircle2 } from "lucide-react";

export const ThemeSettings = () => {
  const { preferences, updateTheme } = usePreferences();
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);

  const themes: {
    value: Theme;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      value: "LIGHT",
      label: t("preferences.theme.light"),
      icon: <Sun className="w-5 h-5" />,
      description: "Pentru utilizare în timpul zilei",
    },
    {
      value: "DARK",
      label: t("preferences.theme.dark"),
      icon: <Moon className="w-5 h-5" />,
      description: "Pentru utilizare pe timp de noapte",
    },
    {
      value: "SYSTEM",
      label: t("preferences.theme.system"),
      icon: <Monitor className="w-5 h-5" />,
      description: "Adaptează automat la setările sistemului",
    },
  ];

  const handleThemeChange = async (theme: Theme) => {
    try {
      setSaving(true);
      await updateTheme(theme);
    } catch (_error) {
      console.error("Failed to update theme:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t("preferences.theme.title")}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {t("preferences.theme.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themes.map((theme) => {
          const isSelected = preferences?.theme === theme.value;
          return (
            <button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              disabled={saving || isSelected}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? "border-[#0066FF] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }
                ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0066FF]" />
                </div>
              )}

              <div
                className={`
                p-2 rounded-lg w-fit mb-3
                ${isSelected ? "bg-[#0066FF] text-white" : "bg-gray-100 text-gray-700"}
              `}
              >
                {theme.icon}
              </div>

              <div className="font-medium text-gray-900 mb-1">
                {theme.label}
              </div>
              <div className="text-xs text-gray-600">{theme.description}</div>
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
