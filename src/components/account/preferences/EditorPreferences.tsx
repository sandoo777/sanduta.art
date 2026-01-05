"use client";

import { useState } from "react";
import { usePreferences, EditorUnit, UIDensity } from "@/modules/account/usePreferences";
import { useTranslations } from "@/modules/i18n";
import { Grid3x3, Ruler, Clock, Layout, CheckCircle2 } from "lucide-react";

export const EditorPreferences = () => {
  const { preferences, updateEditorPreferences } = usePreferences();
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (field: string, value: boolean) => {
    try {
      setSaving(true);
      await updateEditorPreferences({ [field]: value });
    } catch (error) {
      console.error("Failed to update editor preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = async (field: string, value: any) => {
    try {
      setSaving(true);
      await updateEditorPreferences({ [field]: value });
    } catch (error) {
      console.error("Failed to update editor preferences:", error);
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Grid3x3 className="w-5 h-5 text-[#0066FF]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("preferences.editor.title")}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t("preferences.editor.subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Grid Settings */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">
            {t("preferences.editor.grid.title")}
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {t("preferences.editor.grid.snapToGrid")}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {t("preferences.editor.grid.snapToGridDesc")}
                </div>
              </div>
              <Toggle
                checked={preferences?.editorSnapToGrid ?? true}
                onChange={(value) => handleToggle("editorSnapToGrid", value)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {t("preferences.editor.grid.showGrid")}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {t("preferences.editor.grid.showGridDesc")}
                </div>
              </div>
              <Toggle
                checked={preferences?.editorGridVisible ?? true}
                onChange={(value) => handleToggle("editorGridVisible", value)}
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t("preferences.editor.grid.gridSize")}
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={preferences?.editorGridSize ?? 10}
                onChange={(e) =>
                  handleSelect("editorGridSize", parseInt(e.target.value))
                }
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF] disabled:opacity-50"
              />
              <p className="text-xs text-gray-600 mt-1">
                {t("preferences.editor.grid.gridSizeDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">
              {t("preferences.editor.units.title")}
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["PX", "MM", "CM"] as EditorUnit[]).map((unit) => (
              <button
                key={unit}
                onClick={() => handleSelect("editorUnit", unit)}
                disabled={saving}
                className={`
                  px-4 py-2 rounded-lg border-2 font-medium transition-all
                  ${
                    preferences?.editorUnit === unit
                      ? "border-[#0066FF] bg-blue-50 text-[#0066FF]"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }
                  ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {t(`preferences.editor.units.${unit.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Auto Save */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">
              {t("preferences.editor.autoSave.title")}
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 5, label: t("preferences.editor.autoSave.5sec") },
              { value: 10, label: t("preferences.editor.autoSave.10sec") },
              { value: 30, label: t("preferences.editor.autoSave.30sec") },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect("editorAutoSave", option.value)}
                disabled={saving}
                className={`
                  px-4 py-2 rounded-lg border-2 font-medium transition-all
                  ${
                    preferences?.editorAutoSave === option.value
                      ? "border-[#0066FF] bg-blue-50 text-[#0066FF]"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }
                  ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* UI Density */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">
              {t("preferences.editor.uiDensity.title")}
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["COMPACT", "STANDARD", "SPACIOUS"] as UIDensity[]).map(
              (density) => (
                <button
                  key={density}
                  onClick={() => handleSelect("editorUIDensity", density)}
                  disabled={saving}
                  className={`
                    px-4 py-2 rounded-lg border-2 font-medium transition-all
                    ${
                      preferences?.editorUIDensity === density
                        ? "border-[#0066FF] bg-blue-50 text-[#0066FF]"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }
                    ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {t(
                    `preferences.editor.uiDensity.${density.toLowerCase()}`
                  )}
                </button>
              )
            )}
          </div>
        </div>
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
