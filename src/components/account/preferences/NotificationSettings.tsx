"use client";

import { useState } from "react";
import { usePreferences } from "@/modules/account/usePreferences";
import { useTranslations } from "@/modules/i18n";
import { Bell, Mail, Smartphone, CheckCircle2 } from "lucide-react";

export const NotificationSettings = () => {
  const { preferences, updateNotificationPreferences } = usePreferences();
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (field: string, value: boolean) => {
    try {
      setSaving(true);
      await updateNotificationPreferences({ [field]: value });
    } catch (_error) {
      console.error("Failed to update notification preferences:", error);
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
          <Bell className="w-5 h-5 text-[#0066FF]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("preferences.notifications.title")}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t("preferences.notifications.subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">
              {t("preferences.notifications.email.title")}
            </h4>
          </div>
          <div className="space-y-4 pl-6">
            {[
              {
                field: "emailOrders",
                label: t("preferences.notifications.email.orders"),
                desc: t("preferences.notifications.email.ordersDesc"),
              },
              {
                field: "emailProjects",
                label: t("preferences.notifications.email.projects"),
                desc: t("preferences.notifications.email.projectsDesc"),
              },
              {
                field: "emailFiles",
                label: t("preferences.notifications.email.files"),
                desc: t("preferences.notifications.email.filesDesc"),
              },
              {
                field: "emailPromotions",
                label: t("preferences.notifications.email.promotions"),
                desc: t("preferences.notifications.email.promotionsDesc"),
              },
            ].map((item) => (
              <div
                key={item.field}
                className="flex items-center justify-between py-2"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {item.desc}
                  </div>
                </div>
                <Toggle
                  checked={
                    preferences?.[item.field as keyof typeof preferences] as boolean ?? true
                  }
                  onChange={(value) => handleToggle(item.field, value)}
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">
              {t("preferences.notifications.push.title")}
            </h4>
          </div>
          <div className="flex items-center justify-between pl-6">
            <div className="flex-1">
              <div className="text-sm text-gray-600">
                {t("preferences.notifications.push.enable")}
              </div>
            </div>
            <Toggle
              checked={preferences?.pushNotifications ?? true}
              onChange={(value) => handleToggle("pushNotifications", value)}
              disabled={saving}
            />
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">
              {t("preferences.notifications.inApp.title")}
            </h4>
          </div>
          <div className="flex items-center justify-between pl-6">
            <div className="flex-1">
              <div className="text-sm text-gray-600">
                {t("preferences.notifications.inApp.enable")}
              </div>
            </div>
            <Toggle
              checked={preferences?.inAppNotifications ?? true}
              onChange={(value) => handleToggle("inAppNotifications", value)}
              disabled={saving}
            />
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
