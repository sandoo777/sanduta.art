"use client";

import { useState, useEffect } from "react";
import { Plus, Package, Calendar, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMaterials } from "@/modules/materials/useMaterials";
import type { MaterialWithDetails } from "@/modules/materials/types";
import { materialConsumptionFormSchema, type MaterialConsumptionFormData } from "@/lib/validations/admin";
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface MaterialConsumptionProps {
  material: MaterialWithDetails;
  onUpdate: () => void;
}

export function MaterialConsumption({ material, onUpdate }: MaterialConsumptionProps) {
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  const { consumeMaterial, isLoading } = useMaterials();

  const form = useForm<MaterialConsumptionFormData>({
    resolver: zodResolver(materialConsumptionFormSchema),
    defaultValues: {
      jobId: "",
      quantity: 0,
    },
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch("/api/admin/production");
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (_error) {
      console.error("Error loading jobs:", error);
    }
  };

  const onSubmit = async (data: MaterialConsumptionFormData) => {
    if (data.quantity > material.stock) {
      form.setError("quantity", {
        type: "manual",
        message: `Stoc insuficient (disponibil: ${material.stock} ${material.unit})`,
      });
      return;
    }

    const result = await consumeMaterial(material.id, data);

    if (result) {
      setIsConsumeModalOpen(false);
      form.reset();
      onUpdate();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Istoric consum</h3>
        <button
          onClick={() => setIsConsumeModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Consumă material</span>
        </button>
      </div>

      {/* Consumption List */}
      {material.consumption.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Nu există consum înregistrat pentru acest material</p>
        </div>
      ) : (
        <div className="space-y-3">
          {material.consumption.map((consumption) => (
            <div
              key={consumption.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {consumption.job?.name || "Job necunoscut"}
                  </h4>
                  {consumption.job?.order && (
                    <p className="text-sm text-gray-600">
                      Client: {consumption.job.order.customerName}
                    </p>
                  )}
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {consumption.quantity} {material.unit}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {consumption.job && (
                  <>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        consumption.job.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : consumption.job.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {consumption.job.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        consumption.job.priority === "URGENT"
                          ? "bg-red-100 text-red-800"
                          : consumption.job.priority === "HIGH"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {consumption.job.priority}
                    </span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(consumption.createdAt).toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consume Modal */}
      {isConsumeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Consumă material: {material.name}
            </h3>

            {/* Stock Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                Stoc disponibil:{" "}
                <span className="font-bold">
                  {material.stock} {material.unit}
                </span>
              </p>
            </div>

            {/* Low Stock Warning */}
            {material.lowStock && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">
                  Atenție: Stoc sub pragul minim!
                </p>
              </div>
            )}

            <Form form={form} onSubmit={onSubmit}>
              {/* Job Selection */}
              <FormField
                name="jobId"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Job de producție</FormLabel>
                    <select
                      {...field}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selectează job-ul</option>
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.name} - {job.status}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Quantity */}
              <FormField
                name="quantity"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Cantitate ({material.unit})</FormLabel>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={material.stock}
                      placeholder={`Max ${material.stock}`}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    <FormMessage />
                  </div>
                )}
              />

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsConsumeModalOpen(false);
                    form.reset();
                  }}
                  disabled={isLoading}
                >
                  Anulează
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                >
                  Consumă
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
