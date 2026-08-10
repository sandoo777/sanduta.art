"use client";

import { createElement } from 'react';
import { AuthLink } from '@/components/common/links/AuthLink';
import { Card, CardContent, Badge } from "@/components/ui";
import { ProductionJob, ProductionPriority, ProductionStatus } from "@/modules/production/useProduction";
import { Clock3, Cpu, Layers, Printer, Scissors, Wallet } from 'lucide-react';
import { MACHINE_STATUS_CONFIG, MACHINE_TYPES } from '@/modules/machines/types';
import { getMaterialCategoryIcon } from '@/app/admin/materials/_components/materialListUtils';
import type { MaterialCategory } from '@/modules/materials/types';

interface JobCardProps {
  job: ProductionJob;
  onStatusChange?: (jobId: string, status: ProductionStatus) => void;
  updating?: boolean;
}

const priorityColors: Record<ProductionPriority, string> = {
  LOW: "bg-blue-100 text-blue-800 border-blue-200",
  NORMAL: "bg-gray-100 text-gray-800 border-gray-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  URGENT: "bg-red-100 text-red-800 border-red-200",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatMinutes(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}

function formatCurrency(amount?: number | null): string | null {
  if (!amount || amount <= 0) return null;
  return `${amount.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON`;
}

function getMachineIcon(job: ProductionJob) {
  const typeMatch = job.machine?.type ? MACHINE_TYPES.find((item) => item.value === job.machine?.type) : null;
  if (typeMatch) return typeMatch.icon;

  switch (job.machine?.equipmentType) {
    case 'LARGE_FORMAT':
      return Printer;
    case 'DIGITAL':
      return Layers;
    case 'HOURLY':
      return Scissors;
    default:
      return Cpu;
  }
}

export default function JobCard({ job, onStatusChange, updating }: JobCardProps) {
  const overdue = isOverdue(job.dueDate);
  const statusCfg = job.machine ? MACHINE_STATUS_CONFIG[job.machine.status as keyof typeof MACHINE_STATUS_CONFIG] : null;
  const machineIconElement = createElement(getMachineIcon(job), { className: 'h-4.5 w-4.5' });
  const estimatedTime = formatMinutes(job.estimatedMinutes);
  const estimatedCost = formatCurrency(job.estimatedCost);

  return (
    <AuthLink href={`/admin/production/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
            {job.name}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[job.priority]}`}>
            {job.priority}
          </span>
        </div>

        {/* Order Info */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-mono truncate">{job.orderId}</span>
          </div>
          
          {job.order?.customerName && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{job.order.customerName}</span>
            </div>
          )}
        </div>

        {/* Machine */}
        {job.machine && (
          <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700 border border-gray-200">
                {machineIconElement}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Echipament</p>
                <p className="truncate text-sm font-semibold text-gray-900">{job.machine.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 border border-gray-200">
                    {job.machine.type}
                  </span>
                  {statusCfg && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {(job.printMethod || job.material) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {job.printMethod && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800">
                <Printer className="h-3.5 w-3.5" />
                {job.printMethod.name}
              </span>
            )}
            {job.material && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">
                {job.material.category
                  ? <span className="text-sm leading-none">{getMaterialCategoryIcon(job.material.category as MaterialCategory)}</span>
                  : <Layers className="h-3.5 w-3.5" />}
                {job.material.name}
              </span>
            )}
          </div>
        )}

        {(estimatedTime || estimatedCost) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {estimatedTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
                <Clock3 className="h-3.5 w-3.5" />
                {estimatedTime}
              </span>
            )}
            {estimatedCost && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800">
                <Wallet className="h-3.5 w-3.5" />
                {estimatedCost}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Assigned Operator */}
          {job.assignedTo ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">
                {getInitials(job.assignedTo.name)}
              </div>
              <span className="text-xs text-gray-600 truncate max-w-[100px]">
                {job.assignedTo.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-xs">Unassigned</span>
            </div>
          )}

          {/* Due Date */}
          {job.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {new Date(job.dueDate).toLocaleDateString("ro-RO", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {overdue && (
                <Badge variant="danger" size="sm" className="text-[10px] font-medium">
                  OVERDUE
                </Badge>
              )}  
            </div>
          )}
        </div>

        {/* Quick Status Change */}
        {onStatusChange && (
          <div
            className="mt-3 pt-3 border-t border-gray-100"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <select
              value={job.status}
              disabled={updating}
              onChange={(e) => {
                const newStatus = e.target.value as ProductionStatus;
                if (newStatus !== job.status) onStatusChange(job.id, newStatus);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50 text-gray-700 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>
        )}
        </CardContent>
      </Card>
    </AuthLink>
  );
}
