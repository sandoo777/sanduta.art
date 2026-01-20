/**
 * Simplified upload utility for editor exports.
 * Replace the placeholder upload endpoints with your storage service.
 */

export async function uploadPdf(file: Blob, filename: string): Promise<string> {
  return uploadFile(file, filename, 'application/pdf');
}

export async function uploadPreview(file: Blob, filename: string): Promise<string> {
  return uploadFile(file, filename, 'image/png');
}

async function uploadFile(file: Blob, filename: string, contentType: string): Promise<string> {
  try {
    const form = new FormData();
    form.append('file', file, filename);
    form.append('contentType', contentType);

    const res = await fetch('/api/upload-export', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data?.url) {
      throw new Error('Upload response missing url');
    }

    return data.url as string;
  } catch (_error) {
    console.warn('[uploadExport] Falling back to local URL', error);
    // Fallback: createObjectURL so flow keeps working in dev
    return URL.createObjectURL(file);
  }
}
