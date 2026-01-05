"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type FileSortOption = "newest" | "oldest" | "az" | "za" | "type";

export interface SavedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  originalUrl: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  versionCount: number;
}

export interface SavedFileVersion {
  id: string;
  variant: string;
  format: string;
  size: number;
  url: string;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface SavedFileDetail extends SavedFile {
  versions: SavedFileVersion[];
}

export interface FileFilters {
  search: string;
  type: string;
  sort: FileSortOption;
}

interface UseSavedFilesLibraryOptions {
  autoLoad?: boolean;
  initialFilters?: Partial<FileFilters>;
}

const defaultFilters: FileFilters = {
  search: "",
  type: "all",
  sort: "newest",
};

export function useSavedFilesLibrary(options?: UseSavedFilesLibraryOptions) {
  const { autoLoad = true, initialFilters } = options ?? {};
  const [filters, setFilters] = useState<FileFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SavedFileDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const loadFiles = useCallback(async (activeFilters: FileFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (activeFilters.search) params.set("search", activeFilters.search.trim());
      if (activeFilters.sort && activeFilters.sort !== "newest") {
        params.set("sort", activeFilters.sort);
      }
      if (activeFilters.type && activeFilters.type !== "all") {
        params.set("type", activeFilters.type);
      }

      const query = params.toString();
      const response = await fetch(
        query ? `/api/account/files?${query}` : "/api/account/files"
      );

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.error || "Nu am putut încărca biblioteca de fișiere.");
      }

      const data = (await response.json()) as SavedFile[];
      setFiles(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "A apărut o eroare la încărcarea fișierelor."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoLoad) {
      setLoading(false);
      return;
    }

    loadFiles(filters);
  }, [autoLoad, filters, loadFiles]);

  const refresh = useCallback(() => {
    return loadFiles(filters);
  }, [filters, loadFiles]);

  const updateFilters = useCallback((patch: Partial<FileFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const fetchFileDetails = useCallback(async (fileId: string) => {
    setDetailLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/account/files/${fileId}`);
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.error || "Nu am putut încărca detaliile fișierului.");
      }

      const data = (await response.json()) as SavedFileDetail;
      setSelectedFile(data);
      setFiles((prev) =>
        prev.map((file) =>
          file.id === data.id
            ? {
                ...file,
                lastUsedAt: data.lastUsedAt,
                updatedAt: data.updatedAt,
                versionCount: data.versionCount,
              }
            : file
        )
      );
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "A apărut o eroare la încărcarea detaliilor."
      );
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const deleteFile = useCallback(
    async (fileId: string) => {
      setError(null);

      const response = await fetch(`/api/account/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.error || "Nu am putut șterge fișierul.");
      }

      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      setSelectedFile((prev) => (prev?.id === fileId ? null : prev));
    },
    []
  );

  const markFileAsUsed = useCallback(
    async (fileId: string) => {
      setError(null);
      const response = await fetch(`/api/account/files/${fileId}/reuse`, {
        method: "POST",
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.error || "Nu am putut marca fișierul ca utilizat.");
      }

      const data = (await response.json()) as Pick<
        SavedFile,
        | "id"
        | "lastUsedAt"
        | "updatedAt"
        | "versionCount"
        | "name"
        | "type"
        | "size"
        | "thumbnailUrl"
        | "previewUrl"
        | "originalUrl"
        | "createdAt"
      >;

      setFiles((prev) =>
        prev.map((file) =>
          file.id === data.id
            ? { ...file, lastUsedAt: data.lastUsedAt, updatedAt: data.updatedAt }
            : file
        )
      );

      setSelectedFile((prev) =>
        prev && prev.id === data.id
          ? { ...prev, lastUsedAt: data.lastUsedAt, updatedAt: data.updatedAt }
          : prev
      );

      return data;
    },
    []
  );

  const derived = useMemo(() => ({
    totalCount: files.length,
    recentCount: files.filter((file) => {
      if (!file.lastUsedAt) return false;
      const lastUsed = new Date(file.lastUsedAt).getTime();
      const thirtyDays = 1000 * 60 * 60 * 24 * 30;
      return Date.now() - lastUsed <= thirtyDays;
    }).length,
    totalSize: files.reduce((acc, file) => acc + (file.size || 0), 0),
  }), [files]);

  return {
    files,
    filters,
    loading,
    error,
    selectedFile,
    detailLoading,
    stats: derived,
    refresh,
    updateFilters,
    resetFilters,
    fetchFileDetails,
    deleteFile,
    markFileAsUsed,
    setSelectedFile,
  } as const;
}
