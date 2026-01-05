"use client";

import { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import ProjectCard from "./ProjectCard";
import type {
  Project,
  ProjectFolder,
  ProjectFilters,
} from "@/modules/account/useProjects";

interface ProjectsListProps {
  projects: Project[];
  folders: ProjectFolder[];
  filters: ProjectFilters;
  onFiltersChange: (filters: Partial<ProjectFilters>) => void;
  onDuplicate: (projectId: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  onMoveToFolder: (projectId: string, folderId: string | null) => Promise<void>;
}

export default function ProjectsList({
  projects,
  folders,
  filters,
  onFiltersChange,
  onDuplicate,
  onDelete,
  onMoveToFolder,
}: ProjectsListProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search)
      );
    }

    // Filter by folder
    if (filters.folderId !== null) {
      filtered = filtered.filter((p) => p.folderId === filters.folderId);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "az":
          return a.name.localeCompare(b.name, "ro");
        case "za":
          return b.name.localeCompare(a.name, "ro");
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, filters]);

  const sortOptions = [
    { value: "newest", label: "Cele mai recente" },
    { value: "oldest", label: "Cele mai vechi" },
    { value: "az", label: "Alfabetic (A-Z)" },
    { value: "za", label: "Alfabetic (Z-A)" },
  ];

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Proiectele mele
        </h1>
        <p className="text-gray-600">
          Gestionează și organizează toate proiectele tale
        </p>
      </div>

      {/* Search and Sort */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Caută proiecte..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {sortOptions.find((o) => o.value === filters.sortBy)?.label ||
                "Sortează"}
            </span>
          </button>

          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFiltersChange({
                        sortBy: option.value as ProjectFilters["sortBy"],
                      });
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filters.sortBy === option.value
                        ? "bg-blue-50 text-[#0066FF] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filters.search
              ? "Niciun proiect găsit"
              : "Niciun proiect încă"}
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search
              ? "Încearcă un alt termen de căutare"
              : "Creează primul tău proiect în editor"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              folders={folders}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onMoveToFolder={onMoveToFolder}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredProjects.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          {filteredProjects.length === projects.length ? (
            <span>
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1 ? "proiect" : "proiecte"}
            </span>
          ) : (
            <span>
              {filteredProjects.length} din {projects.length}{" "}
              {projects.length === 1 ? "proiect" : "proiecte"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
