"use client";

import { useState, useEffect } from "react";
import { ProductionPriority, CreateJobData } from "@/modules/production/useProduction";

interface Order {
  id: string;
  customerName: string;
  totalPrice: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobData) => Promise<void>;
  initialData?: CreateJobData;
  mode?: "create" | "edit";
}

export default function JobModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode = "create" 
}: JobModalProps) {
  const [formData, setFormData] = useState<CreateJobData>({
    orderId: "",
    name: "",
    priority: "NORMAL",
    dueDate: "",
    notes: "",
    assignedToId: "",
  });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (initialData) {
        setFormData(initialData);
      }
    }
  }, [isOpen, initialData]);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Job name is required";
    }

    if (!formData.orderId) {
      newErrors.orderId = "Order is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      
      // Clean up data before submission
      const submitData: CreateJobData = {
        orderId: formData.orderId,
        name: formData.name.trim(),
        priority: formData.priority,
      };

      if (formData.dueDate) {
        submitData.dueDate = formData.dueDate;
      }

      if (formData.notes?.trim()) {
        submitData.notes = formData.notes.trim();
      }

      if (formData.assignedToId) {
        submitData.assignedToId = formData.assignedToId;
      }

      await onSubmit(submitData);
      handleClose();
    } catch (err) {
      console.error("Error submitting job:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      orderId: "",
      name: "",
      priority: "NORMAL",
      dueDate: "",
      notes: "",
      assignedToId: "",
    });
    setErrors({});
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Job Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Printare 100 bannere"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.orderId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select an order</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.customerName} - {order.totalPrice} RON ({order.status})
                    </option>
                  ))}
                </select>
                {errors.orderId && (
                  <p className="text-red-500 text-sm mt-1">{errors.orderId}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as ProductionPriority })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Assigned Operator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Operator
                </label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name} ({operator.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Additional notes about this job..."
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || loadingData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : mode === "create" ? "Create Job" : "Update Job"}
          </button>
        </div>
      </div>
    </div>
  );
}
