"use client";

import { useState } from "react";
import Image from "next/image";
import { AuthLink } from '@/components/common/links/AuthLink';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  FolderIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import type { Project, ProjectFolder } from "@/modules/account/useProjects";

interface ProjectCardProps {
  project: Project;
  folders: ProjectFolder[];
  onDuplicate: (projectId: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  onMoveToFolder: (projectId: string, folderId: string | null) => Promise<void>;
}

export default function ProjectCard({
  project,
  folders,
  onDuplicate,
  onDelete,
  onMoveToFolder,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDuplicate = async () => {
    setLoading(true);
    await onDuplicate(project.id);
    setLoading(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (confirm(`Sigur dorești să ștergi proiectul "${project.name}"?`)) {
      setLoading(true);
      await onDelete(project.id);
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleMove = async (folderId: string | null) => {
    setLoading(true);
    await onMoveToFolder(project.id, folderId);
    setLoading(false);
    setShowMoveModal(false);
    setShowMenu(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Astăzi";
    } else if (diffDays === 1) {
      return "Ieri";
    } else if (diffDays < 7) {
      return `${diffDays} zile în urmă`;
    } else {
      return date.toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
        {/* Thumbnail */}
        <AuthLink
          href={`/editor/${project.id}`}
          className="block aspect-[4/3] bg-gray-100 relative overflow-hidden"
        >
          {project.thumbnailUrl ? (
            <Image
              src={project.thumbnailUrl}
              alt={project.name}
              fill
              className="object-cover"
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
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ArrowTopRightOnSquareIcon className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
        </AuthLink>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {project.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(project.updatedAt)}
              </p>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <AuthLink
                      href={`/editor/${project.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Deschide în editor
                    </AuthLink>
                    <button
                      onClick={handleDuplicate}
                      disabled={loading}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      Duplică
                    </button>
                    <button
                      onClick={() => {
                        setShowMoveModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FolderIcon className="w-4 h-4" />
                      Mută în folder
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Șterge
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Move to Folder Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Mută în folder
              </h3>
            </div>

            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <button
                onClick={() => handleMove(null)}
                disabled={loading}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  project.folderId === null
                    ? "bg-blue-50 text-[#0066FF] border-2 border-[#0066FF]"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent"
                }`}
              >
                <FolderIcon className="w-5 h-5" />
                <span className="font-medium">Fără folder</span>
              </button>

              <div className="mt-2 space-y-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleMove(folder.id)}
                    disabled={loading}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      project.folderId === folder.id
                        ? "bg-blue-50 text-[#0066FF] border-2 border-[#0066FF]"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <FolderIcon className="w-5 h-5" />
                    <span className="font-medium">{folder.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
