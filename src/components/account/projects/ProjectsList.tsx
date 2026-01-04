"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, Project } from "@/modules/account/useAccount";
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function ProjectsList() {
  const router = useRouter();
  const { projects, loading, fetchProjects, deleteProject, duplicateProject } =
    useAccount();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi acest proiect?")) {
      return;
    }

    setDeletingId(projectId);
    const success = await deleteProject(projectId);
    setDeletingId(null);

    if (success) {
      // Project list is automatically refreshed
    }
  };

  const handleDuplicate = async (projectId: string) => {
    setDuplicatingId(projectId);
    const success = await duplicateProject(projectId);
    setDuplicatingId(null);

    if (success) {
      // Project list is automatically refreshed
    }
  };

  const handleEdit = (projectId: string) => {
    router.push(`/editor?projectId=${projectId}`);
  };

  const handleNewProject = () => {
    router.push("/editor");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Se încarcă proiectele...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Project Button */}
      <div>
        <button
          onClick={handleNewProject}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Proiect nou
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nu ai proiecte salvate
            </h3>
            <p className="text-gray-600 mb-6">
              Creează primul tău proiect în editor și salvează-l pentru a-l
              accesa mai târziu.
            </p>
            <button
              onClick={handleNewProject}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              Crează proiect nou
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
                  {project.name || "Proiect fără nume"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Modificat: {formatDate(project.updatedAt)}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Editează
                  </button>
                  <button
                    onClick={() => handleDuplicate(project.id)}
                    disabled={duplicatingId === project.id}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title="Duplică"
                  >
                    {duplicatingId === project.id ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Șterge"
                  >
                    {deletingId === project.id ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
