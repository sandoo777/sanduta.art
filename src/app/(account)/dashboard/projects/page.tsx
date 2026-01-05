"use client";

import { useEffect } from "react";
import { useProjects } from "@/modules/account/useProjects";
import ProjectsList from "@/components/account/projects/ProjectsList";
import ProjectsFolders from "@/components/account/projects/ProjectsFolders";

export default function ProjectsPage() {
  const {
    projects,
    folders,
    filters,
    loading,
    error,
    fetchProjects,
    fetchFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveProjectToFolder,
    deleteProject,
    duplicateProject,
    setFilters,
  } = useProjects();

  useEffect(() => {
    fetchProjects();
    fetchFolders();
  }, [fetchProjects, fetchFolders]);

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Se încarcă proiectele...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Eroare la încărcarea proiectelor
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              fetchProjects();
              fetchFolders();
            }}
            className="px-6 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <ProjectsFolders
        folders={folders}
        selectedFolderId={filters.folderId}
        totalProjects={projects.length}
        onSelectFolder={(folderId) => setFilters({ ...filters, folderId })}
        onCreateFolder={async (name) => {
          await createFolder(name);
        }}
        onRenameFolder={async (folderId, newName) => {
          await renameFolder(folderId, newName);
        }}
        onDeleteFolder={async (folderId) => {
          await deleteFolder(folderId);
        }}
      />

      {/* Main Content */}
      <ProjectsList
        projects={projects}
        folders={folders}
        filters={filters}
        onFiltersChange={(newFilters) =>
          setFilters({ ...filters, ...newFilters })
        }
        onDuplicate={async (projectId) => {
          await duplicateProject(projectId);
        }}
        onDelete={async (projectId) => {
          await deleteProject(projectId);
        }}
        onMoveToFolder={async (projectId, folderId) => {
          await moveProjectToFolder(projectId, folderId);
        }}
      />
    </div>
  );
}
