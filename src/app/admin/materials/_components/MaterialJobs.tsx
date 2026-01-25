"use client";

import { useMemo } from "react";
import { AuthLink } from '@/components/common/links/AuthLink';
import { Briefcase, ExternalLink } from "lucide-react";
import type { MaterialWithDetails } from "@/modules/materials/types";

interface MaterialJobsProps {
  material: MaterialWithDetails;
}

export function MaterialJobs({ material }: MaterialJobsProps) {
  // Group consumption by job
  const jobsWithConsumption = useMemo(() => {
    const jobMap = new Map<string, {
      job: any;
      totalQuantity: number;
      consumptions: any[];
    }>();

    material.consumption.forEach((consumption) => {
      if (consumption.job) {
        const existing = jobMap.get(consumption.job.id);
        if (existing) {
          existing.totalQuantity += consumption.quantity;
          existing.consumptions.push(consumption);
        } else {
          jobMap.set(consumption.job.id, {
            job: consumption.job,
            totalQuantity: consumption.quantity,
            consumptions: [consumption],
          });
        }
      }
    });

    return Array.from(jobMap.values());
  }, [material.consumption]);

  if (jobsWithConsumption.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>Nu există joburi care au consumat acest material</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "ON_HOLD":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "NORMAL":
        return "bg-blue-100 text-blue-800";
      case "LOW":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Joburi care au folosit acest material ({jobsWithConsumption.length})
      </h3>

      <div className="space-y-4">
        {jobsWithConsumption.map(({ job, totalQuantity, consumptions }) => (
          <div
            key={job.id}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{job.name}</h4>
                  <AuthLink
                    href={`/admin/production/${job.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </AuthLink>
                </div>
                {job.order && (
                  <p className="text-sm text-gray-600 mb-2">
                    Client: {job.order.customerName}
                    {job.order.customerEmail && (
                      <span className="text-gray-400"> • {job.order.customerEmail}</span>
                    )}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                    {job.priority}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Total consumat</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalQuantity} {material.unit}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {consumptions.length} {consumptions.length === 1 ? "operație" : "operații"}
                </p>
              </div>
            </div>

            {/* Individual Consumptions */}
            {consumptions.length > 1 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Detalii consum:</p>
                <div className="space-y-1">
                  {consumptions.map((consumption) => (
                    <div
                      key={consumption.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {new Date(consumption.createdAt).toLocaleDateString("ro-RO", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-medium text-gray-900">
                        {consumption.quantity} {material.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Calculation */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">Cost materiale</span>
              <span className="text-sm font-semibold text-gray-900">
                {(totalQuantity * Number(material.costPerUnit)).toFixed(2)} MDL
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Sumar</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-700">Total joburi</p>
            <p className="text-xl font-bold text-blue-900">{jobsWithConsumption.length}</p>
          </div>
          <div>
            <p className="text-blue-700">Total consumat</p>
            <p className="text-xl font-bold text-blue-900">
              {material.consumption.reduce((sum, c) => sum + c.quantity, 0)} {material.unit}
            </p>
          </div>
          <div>
            <p className="text-blue-700">Cost total</p>
            <p className="text-xl font-bold text-blue-900">
              {(
                material.consumption.reduce((sum, c) => sum + c.quantity, 0) *
                Number(material.costPerUnit)
              ).toFixed(2)}{" "}
              MDL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
