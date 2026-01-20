"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { userFormSchema, type UserFormData } from "@/lib/validations/admin";
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { FormLabel } from "@/components/ui/FormLabel";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSettings, User } from "@/modules/settings/useSettings";
import { UserRole } from "@prisma/client";

interface UserModalProps {
  user?: User | null;
  onClose: (reload?: boolean) => void;
  canManageRoles: boolean;
}

export function UserModal({ user, onClose, canManageRoles }: UserModalProps) {
  const { createUser, updateUser, loading, error } = useSettings();
  const isEditing = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "OPERATOR" as UserRole,
      active: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        active: user.active,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: "OPERATOR" as UserRole,
        active: true,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UserFormData) => {
    // Custom validation: password required for new users
    if (!isEditing && !data.password) {
      form.setError('password', { message: 'Password is required' });
      return;
    }

    try {
      if (isEditing) {
        const updateData: any = {
          name: data.name,
          email: data.email,
          active: data.active,
        };

        if (canManageRoles) {
          updateData.role = data.role;
        }

        if (data.password) {
          updateData.password = data.password;
        }

        await updateUser(user!.id, updateData);
      } else {
        await createUser({
          name: data.name,
          email: data.email,
          password: data.password!,
          role: canManageRoles ? data.role : "OPERATOR",
          active: data.active,
        });
      }

      onClose(true);
    } catch (_error) {
      // Error is handled by the hook
      console.error("Error saving user:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit User" : "Add User"}
          </h2>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <Form form={form} onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <div>
                <FormLabel>
                  Name <span className="text-red-500">*</span>
                </FormLabel>
                <Input {...field} placeholder="John Doe" />
                <FormMessage />
              </div>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <div>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <Input {...field} type="email" placeholder="john@example.com" />
                <FormMessage />
              </div>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <div>
                <FormLabel>
                  Password {!isEditing && <span className="text-red-500">*</span>}
                  {isEditing && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
                </FormLabel>
                <Input
                  {...field}
                  type="password"
                  placeholder={isEditing ? "••••••••" : "Enter password"}
                />
                <FormMessage />
              </div>
            )}
          />

          {/* Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <div>
                <FormLabel>Role</FormLabel>
                <select
                  {...field}
                  disabled={!canManageRoles}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !canManageRoles ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="OPERATOR">Operator</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                {!canManageRoles && (
                  <p className="mt-1 text-xs text-gray-500">
                    Only admins can change user roles
                  </p>
                )}
                <FormMessage />
              </div>
            )}
          />

          {/* Active Status */}
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Inactive users cannot log in
                </p>
              </div>
            )}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onClose()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || form.formState.isSubmitting}
              className="flex-1"
            >
              {loading || form.formState.isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
