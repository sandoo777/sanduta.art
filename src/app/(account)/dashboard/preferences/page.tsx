"use client";

import { useTranslations } from "@/modules/i18n";
import { LanguageSettings } from "@/components/account/preferences/LanguageSettings";
import { ThemeSettings } from "@/components/account/preferences/ThemeSettings";
import { NotificationSettings } from "@/components/account/preferences/NotificationSettings";
import { EditorPreferences } from "@/components/account/preferences/EditorPreferences";
import { ConfiguratorPreferences } from "@/components/account/preferences/ConfiguratorPreferences";
import { CommunicationSettings } from "@/components/account/preferences/CommunicationSettings";
import { Settings } from "lucide-react";

export default function PreferencesPage() {
  const { t } = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Settings className="w-6 h-6 text-[#0066FF]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("preferences.title")}
          </h1>
        </div>
        <p className="text-gray-600">{t("preferences.subtitle")}</p>
      </div>

      {/* Grid Layout - 2 coloane pe desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coloana 1 */}
        <div className="space-y-6">
          <LanguageSettings />
          <NotificationSettings />
          <ConfiguratorPreferences />
        </div>

        {/* Coloana 2 */}
        <div className="space-y-6">
          <ThemeSettings />
          <EditorPreferences />
          <CommunicationSettings />
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          💡 Sfaturi utile
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Toate preferințele se salvează automat când efectuezi modificări</li>
          <li>• Schimbarea limbii va actualiza întreaga interfață imediat</li>
          <li>• Preferințele editorului se vor aplica la următoarea deschidere</li>
          <li>• Poți dezactiva notificările email oricând din această pagină</li>
        </ul>
      </div>
    </div>
  );
}
