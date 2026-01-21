"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductionPriority } from "@/modules/production/useProduction";
import { jobFormSchema, type JobFormData } from "@/lib/validations/admin";
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Order, User } from '@/types/models';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormData) => Promise<void>;
  initialData?: JobFormData;
  mode?: "create" | "edit";
}

export default function JobModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode = "create" 
}: JobModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      orderId: "",
      name: "",
      priority: "NORMAL",
      dueDate: "",
      notes: "",
      assignedToId: "",
    },
  });

  const { formState: { isSubmitting }, reset } = form;

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (initialData) {
        reset(initialData);
      }
    }
  }, [isOpen, initialData, reset]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [ordersRes, operatorsRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/users?role=MANAGER&role=OPERATOR"),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      if (operatorsRes.ok) {
        const operatorsData = await operatorsRes.json();
        setOperators(operatorsData.users || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFormSubmit = async (data: JobFormData) => {
    await onSubmit(data);
    handleClose();
  };

  const handleClose = () => {
    reset({
      orderId: "",
      name: "",
      priority: "NORMAL",
      dueDate: "",
      notes: "",
      assignedToId: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Create Production Job" : "Edit Production Job"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <Form form={form} onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Job Name */}
              <FormField
                name="name"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Job Name</FormLabel>
                    <Input
                      {...field}
                      placeholder="e.g., Printare 100 bannere"
                    />
                    <FormMessage />
                  </div>
                )}
              />

              {/* Order */}
              <FormField
                name="orderId"
                render={({ field }) => (
                  <div>
                    <FormLabel required>Order</FormLabel>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select an order</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.customerName} - {order.totalPrice} RON ({order.status})
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Priority */}
              <FormField
                name="priority"
                render={({ field }) => (
                  <div>
                    <FormLabel>Priority</FormLabel>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Due Date */}
              <FormField
                name="dueDate"
                render={({ field }) => (
                  <div>
                    <FormLabel>Due Date</FormLabel>
                    <Input
                      type="date"
                      {...field}
                    />
                    <FormMessage />
                  </div>
                )}
              />

              {/* Assigned Operator */}
              <FormField
                name="assignedToId"
                render={({ field }) => (
                  <div>
                    <FormLabel>Assign to Operator</FormLabel>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Unassigned</option>
                      {operators.map((operator) => (
                        <option key={operator.id} value={operator.id}>
                          {operator.name} ({operator.role})
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Notes */}
              <FormField
                name="notes"
                render={({ field }) => (
                  <div>
                    <FormLabel>Notes</FormLabel>
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Additional notes about this job..."
                    />
                    <FormMessage />
                  </div>
                )}
              />
            </>
          )}
        </Form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || loadingData}
            onClick={() => form.handleSubmit(handleFormSubmit)()}
          >
            {mode === "create" ? "Create Job" : "Update Job"}
          </Button>
        </div>
      </div>
    </div>
  );
}
