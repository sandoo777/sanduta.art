"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProduction, ProductionJob, ProductionStatus, ProductionPriority, JobFilters } from "@/modules/production/useProduction";
import JobCard from "./_components/JobCard";
import JobModal from "./_components/JobModal";
import { productionSearchFormSchema, type ProductionSearchFormData } from "@/lib/validations/admin";
import { Form, FormField } from "@/components/ui/form";
import { Input, Select } from "@/components/ui";

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const statusColumns: Array<{
  status: ProductionStatus;
  label: string;
  color: string;
  bgColor: string;
}> = [
  { status: "PENDING", label: "Pending", color: "text-yellow-700", bgColor: "bg-yellow-50" },
  { status: "IN_PROGRESS", label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-50" },
  { status: "ON_HOLD", label: "On Hold", color: "text-purple-700", bgColor: "bg-purple-50" },
  { status: "COMPLETED", label: "Completed", color: "text-green-700", bgColor: "bg-green-50" },
  { status: "CANCELED", label: "Canceled", color: "text-gray-700", bgColor: "bg-gray-50" },
];

export default function ProductionPage() {
  const { loading, error, getJobs, createJob } = useProduction();
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const form = useForm<ProductionSearchFormData>({
    resolver: zodResolver(productionSearchFormSchema),
    defaultValues: {
      search: "",
      priority: "",
    },
  });
  
  const { watch } = form;
  const searchQuery = watch("search");
  const priorityFilter = watch("priority");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const values = form.getValues();
      const allFilters: JobFilters = {};
      
      if (values.search) {
        allFilters.search = values.search;
      }
      if (values.priority) {
        allFilters.priority = values.priority as ProductionPriority;
      }
      
      const data = await getJobs(allFilters);
      setJobs(data);
    } catch (err) {
      console.error("Error loading jobs:", err);
    }
  };

  const handleCreateJob = async (data: any) => {
    try {
      await createJob(data);
      await loadJobs();
    } catch (err) {
      console.error("Error creating job:", err);
      throw err;
    }
  };

  const onSubmit = async () => {
    await loadJobs();
  };

  const getJobsByStatus = (status: ProductionStatus): ProductionJob[] => {
    return jobs.filter((job) => job.status === status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Production Workflow</h1>
              <p className="text-gray-600 mt-1">Manage production jobs and track progress</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Job
            </button>
          </div>

          {/* Search and Filters */}
          <Form form={form} onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <FormField
                name="search"
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      type="text"
                      {...field}
                      placeholder="Search by job name, order ID, or customer..."
                      onChange={(e) => {
                        field.onChange(e);
                        loadJobs();
                      }}
                    />
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                )}
              />
            </div>

            {/* Priority Filter */}
            <FormField
              name="priority"
              render={({ field }) => (
                <Select
                  {...field}
                  options={PRIORITY_OPTIONS}
                  onChange={(e) => {
                    field.onChange(e);
                    loadJobs();
                  }}
                  fullWidth={false}
                />
              )}
            />

            {/* Clear Filters */}
            {(priorityFilter || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  form.reset();
                  loadJobs();
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Clear Filters
              </button>
            )}
          </Form>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingState text="Se încarcă joburile de producție..." />
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {statusColumns.map((column) => {
              const columnJobs = getJobsByStatus(column.status);
              return (
                <div key={column.status} className="flex-shrink-0 w-[320px]">
                  {/* Column Header */}
                  <div className={`${column.bgColor} rounded-lg p-4 mb-4`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${column.color}`}>
                        {column.label}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${column.color} bg-white`}>
                        {columnJobs.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="space-y-3 min-h-[400px]">
                    {columnJobs.length > 0 ? (
                      columnJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-sm">No jobs</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateJob}
      />
    </div>
  );
}
