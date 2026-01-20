"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useProduction, ProductionJob, UpdateJobData } from "@/modules/production/useProduction";
import { StatusBadge } from "../_components/StatusManager";
import { PriorityBadge } from "../_components/PriorityManager";
import StatusManager from "../_components/StatusManager";
import PriorityManager from "../_components/PriorityManager";
import AssignOperator from "../_components/AssignOperator";
import JobNotes from "../_components/JobNotes";
import JobTimeline from "../_components/JobTimeline";

type Tab = "overview" | "order" | "notes" | "timeline";

function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
  }).format(amount);
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;
  
  const { loading, error, getJob, updateJob } = useProduction();
  const [job, setJob] = useState<ProductionJob | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const data = await getJob(jobId);
      setJob(data);
    } catch (err) {
      console.error("Error loading job:", err);
    }
  };

  const handleUpdate = async (data: UpdateJobData) => {
    try {
      setUpdating(true);
      const updated = await updateJob(jobId, data);
      setJob(updated);
    } catch (err) {
      console.error("Error updating job:", err);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    await handleUpdate({ status });
  };

  const handlePriorityChange = async (priority: string) => {
    await handleUpdate({ priority });
  };

  const handleAssignOperator = async (userId: string | null) => {
    await handleUpdate({ assignedToId: userId || undefined });
  };

  const handleNotesUpdate = async (notes: string) => {
    await handleUpdate({ notes });
  };

  if (loading && !job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
          {error || "Job not found"}
        </div>
        <Link href="/admin/production" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
          ← Back to Production Board
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <Link 
            href="/admin/production" 
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-4 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Production Board
          </Link>

          {/* Job Info */}
          <div className="flex items-start justify-between gap-4 mt-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{job.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                <StatusBadge status={job.status} />
                <PriorityBadge priority={job.priority} />
                <span className="text-sm text-gray-500">
                  Created {formatDate(job.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-8 border-b border-gray-200">
            {[
              { id: "overview", label: "Overview" },
              { id: "order", label: "Order" },
              { id: "notes", label: "Notes" },
              { id: "timeline", label: "Timeline" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Job Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500">Order ID</dt>
                      <dd className="mt-1 font-mono text-sm font-medium text-gray-900">{job.orderId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Customer</dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900">{job.order?.customerName || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Started At</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(job.startedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Completed At</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(job.completedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Due Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(job.dueDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Order Total</dt>
                      <dd className="mt-1 text-sm font-medium text-gray-900">
                        {job.order ? formatCurrency(job.order.totalPrice) : "N/A"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </>
            )}

            {activeTab === "order" && job.order && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
                
                {/* Customer Info */}
                {job.order.customer && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                    <dl className="space-y-1 text-sm">
                      <div>
                        <dt className="inline text-gray-500">Name: </dt>
                        <dd className="inline font-medium">{job.order.customer.name}</dd>
                      </div>
                      <div>
                        <dt className="inline text-gray-500">Email: </dt>
                        <dd className="inline">{job.order.customer.email}</dd>
                      </div>
                      {job.order.customer.phone && (
                        <div>
                          <dt className="inline text-gray-500">Phone: </dt>
                          <dd className="inline">{job.order.customer.phone}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {/* Order Items */}
                {job.order.orderItems && job.order.orderItems.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {job.order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.product.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                            </div>
                          </div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(item.lineTotal)}
                          </div>
                        </div>
                      ))}
                      
                      {/* Total */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(job.order.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <JobNotes
                jobId={job.id}
                notes={job.notes}
                onUpdate={handleNotesUpdate}
              />
            )}

            {activeTab === "timeline" && (
              <JobTimeline
                jobId={job.id}
                createdAt={job.createdAt}
                updatedAt={job.updatedAt}
                startedAt={job.startedAt}
                completedAt={job.completedAt}
                status={job.status}
                priority={job.priority}
                assignedTo={job.assignedTo}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Manager */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
              <StatusManager
                currentStatus={job.status}
                onStatusChange={handleStatusChange}
                loading={updating}
              />
            </div>

            {/* Priority Manager */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Priority</h3>
              <PriorityManager
                currentPriority={job.priority}
                onPriorityChange={handlePriorityChange}
                loading={updating}
              />
            </div>

            {/* Assign Operator */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Assigned Operator</h3>
              <AssignOperator
                currentOperatorId={job.assignedToId}
                currentOperator={job.assignedTo}
                onAssign={handleAssignOperator}
                loading={updating}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
