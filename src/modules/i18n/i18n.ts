"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import roTranslations from "./languages/ro.json";
import enTranslations from "./languages/en.json";
import ruTranslations from "./languages/ru.json";

export type Language = "RO" | "EN" | "RU";

export type Translations = typeof roTranslations;

const translations: Record<Language, Translations> = {
  RO: roTranslations,
  EN: enTranslations,
  RU: ruTranslations,
};

interface I18nStore {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      language: "RO",
      setLanguage: (language: Language) => {
        set({ language });
        // SalveazÄƒ È™i Ã®n localStorage direct
        if (typeof window !== "undefined") {
          localStorage.setItem("language", language);
        }
      },
      t: (key: string) => {
        const { language } = get();
        const keys = key.split(".");
        let value: unknown = translations[language];

        for (const k of keys) {
          if (value && typeof value === "object" && k in value) {
            value = value[k];
          } else {
            // Fallback la romÃ¢nÄƒ dacÄƒ nu gÄƒseÈ™te cheia
            console.warn(`Translation key not found: ${key}`);
            let fallback: unknown = translations.RO;
            for (const fk of keys) {
              if (fallback && typeof fallback === "object" && fk in fallback) {
                fallback = fallback[fk];
              } else {
                return key;
              }
            }
            return fallback;
          }
        }

        return typeof value === "string" ? value : key;
      },
    }),
    {
      name: "i18n-storage",
    }
  )
);

// Helper hook pentru traduceri
export const useTranslations = () => {
  const { t, language } = useI18n();
  return { t, language };
};

// Detectare limbÄƒ browser
export const detectBrowserLanguage = (): Language => {
  if (typeof window === "undefined") return "RO";

  const browserLang = navigator.language.toLowerCase();

  if (browserLang.startsWith("ro")) return "RO";
  if (browserLang.startsWith("en")) return "EN";
  if (browserLang.startsWith("ru")) return "RU";

  return "RO"; // Default fallback
};

// IniÈ›ializare limbÄƒ
export const initializeLanguage = () => {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem("language") as Language | null;
  if (stored && ["RO", "EN", "RU"].includes(stored)) {
    useI18n.getState().setLanguage(stored);
  } else {
    const detected = detectBrowserLanguage();
    useI18n.getState().setLanguage(detected);
  }
};
