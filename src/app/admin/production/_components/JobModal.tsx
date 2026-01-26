"use client";

import { useState, useEffect } from "react";
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductionPriority } from "@/modules/production/useProduction";
import { jobFormSchema, type JobFormData } from "@/lib/validations/admin";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { fetchOrders, fetchUsers } from '@/lib/api';
import { Order, User } from '@/types/models';

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

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
      title: "",
      orderId: "",
      status: "PENDING",
      assignedTo: "",
      deadline: "",
      notes: "",
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
      const [ordersRes, managersRes, operatorsRes] = await Promise.all([
        fetchOrders(),
        fetchUsers({ role: 'MANAGER' }),
        fetchUsers({ role: 'OPERATOR' }),
      ]);

      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }

      const combined = [
        ...(managersRes.data || []),
        ...(operatorsRes.data || [])
      ];
      setOperators(combined);
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
      title: "",
      orderId: "",
      status: "PENDING",
      assignedTo: "",
      deadline: "",
      notes: "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Create Production Job" : "Edit Production Job"}
          </h2>
        </div>

        {/* Body */}
        <Form form={form} onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {loadingData ? (
            <LoadingState size="sm" text="" />
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
                    <Select
                      {...field}
                      options={[
                        { value: "", label: "Select an order" },
                        ...orders.map((order) => ({
                          value: order.id,
                          label: `${order.customerName} - ${order.totalPrice} RON (${order.status})`
                        }))
                      ]}
                      fullWidth={true}
                    />
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
                    <Select
                      {...field}
                      options={PRIORITY_OPTIONS}
                      fullWidth={true}
                    />
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
                    <Select
                      {...field}
                      options={[
                        { value: "", label: "Unassigned" },
                        ...operators.map((operator) => ({
                          value: operator.id,
                          label: `${operator.name} (${operator.role})`
                        }))
                      ]}
                      fullWidth={true}
                    />
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
    </Modal>
  );
}
