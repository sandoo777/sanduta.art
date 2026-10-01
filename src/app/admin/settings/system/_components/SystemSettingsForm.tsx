"use client";

import { useCallback, useEffect } from "react";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
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
      production_electricity_cost: "2.4",
      production_operator_cost: "20",
      finishing_operator_cost: "18",
      design_operator_cost: "25",
      default_working_hours_per_day: "8",
    },
  });

  const { formState: { isSubmitting, isSubmitSuccessful }, reset } = form;

  const loadSettings = useCallback(async () => {
    try {
      const settings = await getSystemSettings();
      
      reset({
        company_name: settings.company_name || "",
        company_email: settings.company_email || "",
        default_currency: settings.default_currency || "MDL",
        timezone: settings.timezone || "Europe/Chisinau",
        low_stock_threshold: settings.low_stock_threshold || "10",
        production_electricity_cost: settings['production_cost.electricity_cost_mdl_per_kwh'] || "2.4",
        production_operator_cost: settings['production_cost.production_operator_cost_mdl_per_hour'] || "20",
        finishing_operator_cost: settings['production_cost.finishing_operator_cost_mdl_per_hour'] || "18",
        design_operator_cost: settings['production_cost.design_operator_cost_mdl_per_hour'] || "25",
        default_working_hours_per_day: settings['production_cost.default_working_hours_per_day'] || "8",
      });
    } catch (loadError) {
      console.error("Error loading settings:", loadError);
    }
  }, [getSystemSettings, reset]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const onSubmit = async (data: SystemSettingsFormData) => {
    const settingsToSave = {
      ...data,
      'production_cost.electricity_cost_mdl_per_kwh': data.production_electricity_cost,
      'production_cost.production_operator_cost_mdl_per_hour': data.production_operator_cost,
      'production_cost.finishing_operator_cost_mdl_per_hour': data.finishing_operator_cost,
      'production_cost.design_operator_cost_mdl_per_hour': data.design_operator_cost,
      'production_cost.default_working_hours_per_day': data.default_working_hours_per_day || '8',
    };

    delete (settingsToSave as Record<string, unknown>).company_name;
    delete (settingsToSave as Record<string, unknown>).company_email;
    delete (settingsToSave as Record<string, unknown>).default_currency;
    delete (settingsToSave as Record<string, unknown>).timezone;
    delete (settingsToSave as Record<string, unknown>).low_stock_threshold;
    delete (settingsToSave as Record<string, unknown>).production_electricity_cost;
    delete (settingsToSave as Record<string, unknown>).production_operator_cost;
    delete (settingsToSave as Record<string, unknown>).finishing_operator_cost;
    delete (settingsToSave as Record<string, unknown>).design_operator_cost;
    delete (settingsToSave as Record<string, unknown>).default_working_hours_per_day;

    await updateSystemSettings(settingsToSave as Record<string, string>);
  };

  const handleReset = () => {
    void loadSettings();
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
      {isSubmitSuccessful && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          Settings saved successfully!
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

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

      <Card>
        <CardHeader>
          <CardTitle>Production Cost Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="production_electricity_cost" render={({ field }) => (
              <div>
                <FormLabel>Electricity Cost (MDL/kWh)</FormLabel>
                <Input type="number" step="0.01" min="0" placeholder="2.40" {...field} />
                <FormMessage />
              </div>
            )} />
            <FormField name="production_operator_cost" render={({ field }) => (
              <div>
                <FormLabel>Production Operator Cost (MDL/hour)</FormLabel>
                <Input type="number" step="0.01" min="0" placeholder="20" {...field} />
                <FormMessage />
              </div>
            )} />
            <FormField name="finishing_operator_cost" render={({ field }) => (
              <div>
                <FormLabel>Finishing Operator Cost (MDL/hour)</FormLabel>
                <Input type="number" step="0.01" min="0" placeholder="18" {...field} />
                <FormMessage />
              </div>
            )} />
            <FormField name="design_operator_cost" render={({ field }) => (
              <div>
                <FormLabel>Design Operator Cost (MDL/hour)</FormLabel>
                <Input type="number" step="0.01" min="0" placeholder="25" {...field} />
                <FormMessage />
              </div>
            )} />
            <FormField name="default_working_hours_per_day" render={({ field }) => (
              <div className="md:col-span-2">
                <FormLabel>Default Working Hours Per Day</FormLabel>
                <Input type="number" step="0.5" min="1" placeholder="8" {...field} />
                <FormMessage />
              </div>
            )} />
          </div>
        </CardContent>
      </Card>

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
