"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n, Language } from "@/modules/i18n";
import { Globe, Check } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "default" | "compact";
}

export const LanguageSwitcher = ({ variant = "default" }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: "RO", label: "Română", flag: "🇷🇴" },
    { value: "EN", label: "English", flag: "🇬🇧" },
    { value: "RU", label: "Русский", flag: "🇷🇺" },
  ];

  const currentLanguage = languages.find((lang) => lang.value === language);

  // Închide dropdown când se dă click în afară
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = async (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);

    // Actualizează și în DB dacă utilizatorul este autentificat
    try {
      await fetch("/api/account/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: newLanguage }),
      });
    } catch (_error) {
      console.error("Failed to save language preference:", error);
    }
  };

  if (variant === "compact") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">{currentLanguage?.flag}</span>
          <span className="text-sm font-medium text-gray-700">
            {currentLanguage?.value}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLanguageChange(lang.value)}
                className={`
                  w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                  ${language === lang.value ? "text-[#0066FF] bg-blue-50" : "text-gray-700"}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {language === lang.value && (
                  <Check className="w-4 h-4 text-[#0066FF]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 bg-white transition-colors"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-xl">{currentLanguage?.flag}</span>
        <span className="font-medium text-gray-700">
          {currentLanguage?.label}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              className={`
                w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors
                ${language === lang.value ? "text-[#0066FF] bg-blue-50" : "text-gray-700"}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
              </div>
              {language === lang.value && (
                <Check className="w-5 h-5 text-[#0066FF]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
