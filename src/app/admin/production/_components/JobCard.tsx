"use client";

import { AuthLink } from '@/components/common/links/AuthLink';
import { Card, CardContent, Badge } from "@/components/ui";
import { ProductionJob, ProductionPriority } from "@/modules/production/useProduction";

interface JobCardProps {
  job: ProductionJob;
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

export default function JobCard({ job }: JobCardProps) {
  const overdue = isOverdue(job.dueDate);

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
        </CardContent>
      </Card>
    </AuthLink>
  );
}
