import { Edit, Trash2 } from "lucide-react";
import { User } from "@/modules/settings/useSettings";

const ROLE_COLORS = {
  ADMIN: "bg-red-100 text-red-800",
  MANAGER: "bg-blue-100 text-blue-800",
  OPERATOR: "bg-green-100 text-green-800",
  VIEWER: "bg-gray-100 text-gray-800",
};

interface UserCardProps {
  user: User;
  onEdit?: () => void;
  onToggleActive?: () => void;
  onDelete?: () => void;
}

export function UserCard({ user, onEdit, onToggleActive, onDelete }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            ROLE_COLORS[user.role]
          }`}
        >
          {user.role}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Status:</span>
          {onToggleActive ? (
            <button
              onClick={onToggleActive}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                user.active ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          ) : (
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.active
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {user.active ? "Active" : "Inactive"}
            </span>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Created: {new Date(user.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
