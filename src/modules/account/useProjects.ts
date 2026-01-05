"use client";

import { useState } from "react";

export interface ProjectFolder {
  id: string;
  name: string;
  createdAt: string;
  projectCount?: number;
}

export interface Project {
  id: string;
  name: string;
  folderId: string | null;
  thumbnailUrl: string | null;
  updatedAt: string;
  createdAt: string;
  data?: Record<string, unknown> | null;
}

export interface ProjectFilters {
  search: string;
  folderId: string | null;
  sortBy: "newest" | "oldest" | "az" | "za";
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    folderId: null,
    sortBy: "newest",
  });

  // Fetch all projects
  const fetchProjects = async (): Promise<Project[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/account/projects");
      
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      
      const data: Project[] = await response.json();
      setProjects(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all folders
  const fetchFolders = async (): Promise<ProjectFolder[]> => {
    try {
      const response = await fetch("/api/account/projects/folders");
      
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      
      const data: ProjectFolder[] = await response.json();
      setFolders(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch folders");
      return [];
    }
  };

  // Create new folder
  const createFolder = async (name: string): Promise<ProjectFolder | null> => {
    try {
      const response = await fetch("/api/account/projects/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create folder");
      }
      
      const newFolder = await response.json();
      setFolders([...folders, newFolder]);
      return newFolder;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
      return null;
    }
  };

  // Rename folder
  const renameFolder = async (folderId: string, newName: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/account/projects/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to rename folder");
      }
      
      setFolders(folders.map(f => 
        f.id === folderId ? { ...f, name: newName } : f
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename folder");
      return false;
    }
  };

  // Delete folder
  const deleteFolder = async (folderId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/account/projects/folders/${folderId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete folder");
      }
      
      setFolders(folders.filter(f => f.id !== folderId));
      // Move projects from deleted folder to null (no folder)
      setProjects(projects.map(p => 
        p.folderId === folderId ? { ...p, folderId: null } : p
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete folder");
      return false;
    }
  };

  // Move project to folder
  const moveProjectToFolder = async (
    projectId: string,
    folderId: string | null
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/account/projects/${projectId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to move project");
      }
      
      setProjects(projects.map(p => 
        p.id === projectId ? { ...p, folderId } : p
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move project");
      return false;
    }
  };

  // Delete project
  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/account/projects/${projectId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
      
      setProjects(projects.filter(p => p.id !== projectId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      return false;
    }
  };

  // Duplicate project
  const duplicateProject = async (projectId: string): Promise<Project | null> => {
    try {
      const response = await fetch(`/api/account/projects/${projectId}/duplicate`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to duplicate project");
      }
      
      const duplicatedProject = await response.json();
      setProjects([duplicatedProject, ...projects]);
      return duplicatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate project");
      return null;
    }
  };

  // Filter and sort projects
  const filterProjects = (filters: ProjectFilters): Project[] => {
    let filtered = [...projects];

    // Filter by folder
    if (filters.folderId !== null) {
      filtered = filtered.filter(p => p.folderId === filters.folderId);
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case "oldest":
        filtered.sort((a, b) => 
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
      case "az":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return filtered;
  };

  return {
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
    filterProjects,
    setFilters,
  };
}
