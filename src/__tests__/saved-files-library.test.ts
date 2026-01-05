import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useSavedFilesLibrary,
  type SavedFile,
  type SavedFileDetail,
} from "@/modules/account/useSavedFilesLibrary";

const createResponse = (data: unknown, ok = true): Response =>
  ({
    ok,
    status: ok ? 200 : 500,
    json: async () => data,
  } as Response);

const baseFiles: SavedFile[] = [
  {
    id: "file_a",
    name: "Poster A",
    type: "pdf",
    size: 3 * 1024 * 1024,
    thumbnailUrl: null,
    previewUrl: null,
    originalUrl: "https://cdn.sanduta.art/poster-a.pdf",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    lastUsedAt: null,
    versionCount: 2,
  },
  {
    id: "file_b",
    name: "Sticker Pack",
    type: "png",
    size: 512 * 1024,
    thumbnailUrl: "https://cdn.sanduta.art/sticker-thumb.png",
    previewUrl: "https://cdn.sanduta.art/sticker-preview.png",
    originalUrl: "https://cdn.sanduta.art/sticker-pack.png",
    createdAt: "2025-01-05T00:00:00.000Z",
    updatedAt: "2025-01-05T00:00:00.000Z",
    lastUsedAt: "2025-01-10T00:00:00.000Z",
    versionCount: 1,
  },
];

const detailFixtures: Record<string, SavedFileDetail> = {
  file_a: {
    ...baseFiles[0],
    versions: [
      {
        id: "v1",
        variant: "original",
        format: "pdf",
        size: 3 * 1024 * 1024,
        url: "https://cdn.sanduta.art/poster-a.pdf",
        createdAt: "2025-01-01T00:00:00.000Z",
        metadata: { dpi: 300 },
      },
      {
        id: "v2",
        variant: "preview",
        format: "png",
        size: 420 * 1024,
        url: "https://cdn.sanduta.art/poster-a-preview.png",
        createdAt: "2025-01-02T00:00:00.000Z",
        metadata: { width: 1200 },
      },
    ],
  },
  file_b: {
    ...baseFiles[1],
    versions: [
      {
        id: "vb1",
        variant: "original",
        format: "png",
        size: 512 * 1024,
        url: "https://cdn.sanduta.art/sticker-pack.png",
        createdAt: "2025-01-05T00:00:00.000Z",
        metadata: { pages: 1 },
      },
    ],
  },
};

const resolveUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return (input as Request).url;
};

describe("useSavedFilesLibrary", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let filesSnapshot: SavedFile[];

  beforeEach(() => {
    filesSnapshot = baseFiles.map((file) => ({ ...file }));

    fetchSpy = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = resolveUrl(input);

      if (requestUrl.startsWith("/api/account/files/")) {
        const match = requestUrl.match(/\/api\/account\/files\/(.+?)(?:\/|$)/);
        const fileId = match?.[1];

        if (requestUrl.endsWith("/reuse")) {
          const reusePayload = {
            ...filesSnapshot.find((file) => file.id === fileId)!,
            lastUsedAt: "2025-02-01T00:00:00.000Z",
            updatedAt: "2025-02-01T00:00:00.000Z",
          } satisfies Partial<SavedFile> & {
            id: string;
            lastUsedAt: string;
            updatedAt: string;
          };
          return createResponse(reusePayload);
        }

        if (init?.method === "DELETE") {
          filesSnapshot = filesSnapshot.filter((file) => file.id !== fileId);
          return createResponse({ success: true });
        }

        if (fileId && detailFixtures[fileId]) {
          return createResponse(detailFixtures[fileId]);
        }
      }

      if (requestUrl.startsWith("/api/account/files")) {
        return createResponse(filesSnapshot);
      }

      return createResponse({ error: "not-found" }, false);
    });

    global.fetch = fetchSpy as unknown as typeof fetch;
  });

  it("loads files on mount and computes stats", async () => {
    const { result } = renderHook(() => useSavedFilesLibrary());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchSpy).toHaveBeenCalledWith("/api/account/files");
    expect(result.current.files).toHaveLength(2);
    expect(result.current.stats.totalCount).toBe(2);
    expect(result.current.stats.totalSize).toBe(
      baseFiles[0].size + baseFiles[1].size
    );
  });

  it("fetches file details and updates selected file state", async () => {
    const { result } = renderHook(() => useSavedFilesLibrary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.fetchFileDetails("file_a");
    });

    expect(result.current.selectedFile?.id).toBe("file_a");
    expect(result.current.selectedFile?.versions).toHaveLength(2);
    expect(
      result.current.files.find((file) => file.id === "file_a")?.versionCount
    ).toBe(detailFixtures.file_a.versionCount);
  });

  it("removes files locally after a successful delete", async () => {
    const { result } = renderHook(() => useSavedFilesLibrary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteFile("file_a");
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].id).toBe("file_b");
  });

  it("marks files as used and syncs timestamps", async () => {
    const { result } = renderHook(() => useSavedFilesLibrary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.fetchFileDetails("file_b");
    });

    await act(async () => {
      await result.current.markFileAsUsed("file_b");
    });

    const target = result.current.files.find((file) => file.id === "file_b");
    expect(target?.lastUsedAt).toBe("2025-02-01T00:00:00.000Z");
    expect(result.current.selectedFile?.lastUsedAt).toBe(
      "2025-02-01T00:00:00.000Z"
    );
  });
});
