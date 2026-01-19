"use client";

import { useState } from "react";
import { usePreferences } from "@/modules/account/usePreferences";
import { useTranslations } from "@/modules/i18n";
import { Settings, CheckCircle2 } from "lucide-react";

export const ConfiguratorPreferences = () => {
  const { preferences, updateConfiguratorPreferences } = usePreferences();
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);

  const handleChange = async (field: string, value: unknown) => {
    try {
      setSaving(true);
      await updateConfiguratorPreferences({ [field]: value });
    } catch (error) {
      console.error("Failed to update configurator preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Settings className="w-5 h-5 text-[#0066FF]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("preferences.configurator.title")}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t("preferences.configurator.subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Default Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t("preferences.configurator.quantity")}
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={preferences?.configDefaultQuantity ?? 1}
            onChange={(e) =>
              handleChange("configDefaultQuantity", parseInt(e.target.value))
            }
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF] disabled:opacity-50"
          />
          <p className="text-xs text-gray-600 mt-1">
            {t("preferences.configurator.quantityDesc")}
          </p>
        </div>

        {/* Production Time */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t("preferences.configurator.productionTime")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                value: "standard",
                label: t("preferences.configurator.productionTimeStandard"),
              },
              {
                value: "express",
                label: t("preferences.configurator.productionTimeExpress"),
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange("configDefaultProductionTime", option.value)
                }
                disabled={saving}
                className={`
                  px-4 py-2 rounded-lg border-2 font-medium transition-all
                  ${
                    preferences?.configDefaultProductionTime === option.value
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

        {/* Delivery Method */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t("preferences.configurator.delivery")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                value: "courier",
                label: t("preferences.configurator.deliveryCourier"),
              },
              {
                value: "pickup",
                label: t("preferences.configurator.deliveryPickup"),
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange("configDefaultDelivery", option.value)
                }
                disabled={saving}
                className={`
                  px-4 py-2 rounded-lg border-2 font-medium transition-all
                  ${
                    preferences?.configDefaultDelivery === option.value
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

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t("preferences.configurator.payment")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                value: "card",
                label: t("preferences.configurator.paymentCard"),
              },
              {
                value: "cash",
                label: t("preferences.configurator.paymentCash"),
              },
              {
                value: "transfer",
                label: t("preferences.configurator.paymentTransfer"),
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleChange("configDefaultPayment", option.value)
                }
                disabled={saving}
                className={`
                  px-4 py-2 rounded-lg border-2 font-medium transition-all
                  ${
                    preferences?.configDefaultPayment === option.value
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
