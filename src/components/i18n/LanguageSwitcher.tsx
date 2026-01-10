'use client';

/**
 * Language Switcher Component
 * Permite utilizatorului să schimbe limba interfeței
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/i18n/config';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
  variant?: 'dropdown' | 'inline' | 'compact';
}

export function LanguageSwitcher({
  currentLocale,
  className = '',
  variant = 'dropdown',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const changeLocale = (newLocale: Locale) => {
    // Salvează preferința în cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 an

    // Construiește noul pathname
    const segments = pathname.split('/').filter(Boolean);
    
    // Înlocuiește primul segment (locale) cu noul locale
    if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0] as Locale)) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }

    const newPath = `/${segments.join('/')}`;
    
    setIsOpen(false);
    router.push(newPath);
    router.refresh();
  };

  if (variant === 'inline') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {SUPPORTED_LOCALES.map((locale) => (
          <button
            key={locale}
            onClick={() => changeLocale(locale)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              locale === currentLocale
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label={`Switch to ${LOCALE_NAMES[locale]}`}
          >
            {LOCALE_FLAGS[locale]} {LOCALE_NAMES[locale]}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {SUPPORTED_LOCALES.map((locale) => (
          <button
            key={locale}
            onClick={() => changeLocale(locale)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
              locale === currentLocale
                ? 'bg-blue-600 text-white scale-110'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            aria-label={`Switch to ${LOCALE_NAMES[locale]}`}
            title={LOCALE_NAMES[locale]}
          >
            {LOCALE_FLAGS[locale]}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:border-gray-400 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{LOCALE_FLAGS[currentLocale]}</span>
        <span className="font-medium text-gray-900">{LOCALE_NAMES[currentLocale]}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale}
              onClick={() => changeLocale(locale)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                locale === currentLocale
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{LOCALE_FLAGS[locale]}</span>
              <span className="font-medium">{LOCALE_NAMES[locale]}</span>
              {locale === currentLocale && (
                <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact Language Switcher pentru mobile
 */
export function MobileLanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  return <LanguageSwitcher currentLocale={currentLocale} variant="compact" />;
}
