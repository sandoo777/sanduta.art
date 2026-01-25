"use client";

import { useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Button";
import { useSettings } from "@/modules/settings/useSettings";
import { systemSettingsFormSchema, type SystemSettingsFormData } from "@/lib/validations/admin";
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui";

const CURRENCIES = [
  { value: "MDL", label: "MDL (Moldovan Leu)" },
  { value: "USD", label: "USD (US Dollar)" },
  { value: "EUR", label: "EUR (Euro)" },
  { value: "RON", label: "RON (Romanian Leu)" },
];

const TIMEZONES = [
  { value: "Europe/Chisinau", label: "Europe/Chisinau" },
  { value: "Europe/Bucharest", label: "Europe/Bucharest" },
  { value: "Europe/Kiev", label: "Europe/Kiev" },
  { value: "UTC", label: "UTC" },
];

export function SystemSettingsForm() {
  const { getSystemSettings, updateSystemSettings, loading, error } = useSettings();
  
  const form = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsFormSchema),
    defaultValues: {
      company_name: "",
      company_email: "",
      default_currency: "MDL",
      timezone: "Europe/Chisinau",
      low_stock_threshold: "10",
    },
  });

  const { formState: { isSubmitting, isSubmitSuccessful }, reset } = form;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSystemSettings();
      
      // Map settings to form data
      reset({
        company_name: settings.company_name || "",
        company_email: settings.company_email || "",
        default_currency: settings.default_currency || "MDL",
        timezone: settings.timezone || "Europe/Chisinau",
        low_stock_threshold: settings.low_stock_threshold || "10",
      });
    } catch (_error) {
      console.error("Error loading settings:", error);
    }
  };

  const onSubmit = async (data: SystemSettingsFormData) => {
    await updateSystemSettings(data);
  };

  const handleReset = () => {
    loadSettings();
  };

  if (loading && !form.getValues("company_name")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      {/* Success Message */}
      {isSubmitSuccessful && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          Settings saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="company_name"
            render={({ field }) => (
              <div>
                <FormLabel>Company Name</FormLabel>
                <Input
                  {...field}
                  placeholder="Sanduta Print"
                />
                <FormMessage />
              </div>
            )}
          />
          <FormField
            name="company_email"
            render={({ field }) => (
              <div>
                <FormLabel>Company Email</FormLabel>
                <Input
                  type="email"
                  {...field}
                  placeholder="contact@sanduta.art"
                />
                <FormMessage />
              </div>
            )}
          />
        </div>
      </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="default_currency"
            render={({ field }) => (
              <div>
                <FormLabel>Default Currency</FormLabel>
                <Select
                  {...field}
                  options={CURRENCIES}
                  fullWidth={true}
                />
                <FormMessage />
              </div>
            )}
          />
          <FormField
            name="timezone"
            render={({ field }) => (
              <div>
                <FormLabel>Timezone</FormLabel>
                <Select
                  {...field}
                  options={TIMEZONES}
                  fullWidth={true}
                />
                <FormMessage />
              </div>
            )}
          />
        </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="low_stock_threshold"
            render={({ field }) => (
              <div>
                <FormLabel>Low Stock Threshold</FormLabel>
                <Input
                  type="number"
                  min="0"
                  placeholder="10"
                  {...field}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alert when stock falls below this value
                </p>
                <FormMessage />
              </div>
            )}
          />
        </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          loading={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset
        </Button>
      </div>
    </Form>
  );
}
