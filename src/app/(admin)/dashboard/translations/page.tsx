'use client';

/**
 * Admin Translations Manager
 * Interfață pentru administrarea traducerilor
 */

import { useState, useEffect } from 'react';
import { SUPPORTED_LOCALES, LOCALE_NAMES, type Locale } from '@/i18n/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface TranslationEntry {
  key: string;
  translations: Record<Locale, string>;
}

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTranslations();
  }, []);

  async function loadTranslations() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/translations');
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveTranslation(key: string, locale: Locale, value: string) {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, locale, value }),
      });

      if (response.ok) {
        setTranslations((prev) =>
          prev.map((t) =>
            t.key === key
              ? { ...t, translations: { ...t.translations, [locale]: value } }
              : t
          )
        );
      }
    } catch (error) {
      console.error('Failed to save translation:', error);
    } finally {
      setIsSaving(false);
    }
  }

  async function exportTranslations() {
    try {
      const response = await fetch('/api/admin/translations/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Failed to export translations:', error);
    }
  }

  async function importTranslations(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/translations/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await loadTranslations();
      }
    } catch (error) {
      console.error('Failed to import translations:', error);
    }
  }

  const filteredTranslations = translations.filter((t) =>
    t.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Se încarcă traducerile...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Administrare Traduceri
        </h1>
        <p className="text-gray-600">
          Gestionează toate traducerile platformei din această interfață centralizată
        </p>
      </div>

      {/* Acțiuni */}
      <div className="mb-6 flex gap-4">
        <Input
          type="search"
          placeholder="Caută după cheie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={exportTranslations} variant="secondary">
          Exportă JSON
        </Button>
        <label>
          <input
            type="file"
            accept=".json"
            onChange={(e) => e.target.files?.[0] && importTranslations(e.target.files[0])}
            className="hidden"
          />
          <Button as="span" variant="secondary">
            Importă JSON
          </Button>
        </label>
      </div>

      {/* Listă traduceri */}
      <div className="space-y-4">
        {filteredTranslations.map((entry) => (
          <Card key={entry.key} className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {entry.key}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUPPORTED_LOCALES.map((locale) => (
                <div key={locale}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {LOCALE_NAMES[locale]}
                  </label>
                  <Input
                    value={entry.translations[locale] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTranslations((prev) =>
                        prev.map((t) =>
                          t.key === entry.key
                            ? { ...t, translations: { ...t.translations, [locale]: value } }
                            : t
                        )
                      );
                    }}
                    onBlur={(e) => saveTranslation(entry.key, locale, e.target.value)}
                    placeholder={`Traducere ${locale.toUpperCase()}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}

        {filteredTranslations.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">
              {searchQuery
                ? 'Nu s-au găsit traduceri pentru acest criteriu'
                : 'Nu există traduceri'}
            </p>
          </Card>
        )}
      </div>

      {/* Statistici */}
      <Card className="mt-8 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistici</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {translations.length}
            </div>
            <div className="text-sm text-gray-600">Chei traduceri</div>
          </div>
          {SUPPORTED_LOCALES.map((locale) => {
            const complete = translations.filter(
              (t) => t.translations[locale]?.trim()
            ).length;
            const percentage = translations.length
              ? Math.round((complete / translations.length) * 100)
              : 0;

            return (
              <div key={locale}>
                <div className="text-2xl font-bold text-green-600">
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600">
                  {LOCALE_NAMES[locale]} ({complete}/{translations.length})
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
