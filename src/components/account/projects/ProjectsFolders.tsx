"use client";

import { useState } from "react";
import {
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { ProjectFolder } from "@/modules/account/useProjects";

interface ProjectsFoldersProps {
  folders: ProjectFolder[];
  selectedFolderId: string | null;
  totalProjects: number;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
}

export default function ProjectsFolders({
  folders,
  selectedFolderId,
  totalProjects,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: ProjectsFoldersProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    await onCreateFolder(newFolderName);
    setNewFolderName("");
    setIsCreating(false);
  };

  const handleRename = async (folderId: string) => {
    if (!editingName.trim()) return;
    await onRenameFolder(folderId, editingName);
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (folderId: string) => {
    if (confirm("Sigur dorești să ștergi acest folder? Proiectele vor fi mutate în categoria Toate proiectele.")) {
      await onDeleteFolder(folderId);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Foldere</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 text-gray-600 hover:text-[#0066FF] hover:bg-blue-50 rounded transition-colors"
          title="Folder nou"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-1">
        {/* All Projects */}
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedFolderId === null
              ? "bg-blue-50 text-[#0066FF] font-medium"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {selectedFolderId === null ? (
            <FolderOpenIcon className="w-5 h-5" />
          ) : (
            <FolderIcon className="w-5 h-5" />
          )}
          <span className="flex-1 text-left">Toate proiectele</span>
          <span className="text-xs text-gray-500">{totalProjects}</span>
        </button>

        {/* Custom Folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedFolderId === folder.id
                ? "bg-blue-50 text-[#0066FF] font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {editingId === folder.id ? (
              <>
                <FolderIcon className="w-5 h-5 flex-shrink-0" />
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRename(folder.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(folder.id);
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setEditingName("");
                    }
                  }}
                  className="flex-1 px-2 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  autoFocus
                />
              </>
            ) : (
              <>
                <button
                  onClick={() => onSelectFolder(folder.id)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  {selectedFolderId === folder.id ? (
                    <FolderOpenIcon className="w-5 h-5" />
                  ) : (
                    <FolderIcon className="w-5 h-5" />
                  )}
                  <span className="truncate">{folder.name}</span>
                </button>
                <span className="text-xs text-gray-500 mr-2">
                  {folder.projectCount || 0}
                </span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingId(folder.id);
                      setEditingName(folder.name);
                    }}
                    className="p-1 text-gray-400 hover:text-[#0066FF] rounded"
                    title="Redenumește"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(folder.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Șterge"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Create New Folder */}
        {isCreating && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
            <FolderIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={handleCreate}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewFolderName("");
                }
              }}
              placeholder="Nume folder..."
              className="flex-1 px-2 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
