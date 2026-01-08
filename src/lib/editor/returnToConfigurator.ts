/**
 * Utilities for returning from editor to configurator
 */

export interface EditorReturnParams {
  productId: string;
  productSlug?: string;
  projectId: string;
  previewImage: string;
  status: 'saved' | 'cancelled';
}

/**
 * Generate return URL to configurator with project data
 */
export function generateReturnUrl(params: EditorReturnParams): string {
  const baseUrl = params.productSlug
    ? `/products/${params.productSlug}`
    : `/configurator/${params.productId}`;

  const searchParams = new URLSearchParams();

  if (params.status === 'saved') {
    searchParams.set('projectId', params.projectId);
    searchParams.set('previewImage', params.previewImage);
    searchParams.set('editorStatus', 'saved');
  } else {
    searchParams.set('editorStatus', 'cancelled');
  }

  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Parse return parameters from URL
 */
export function parseReturnParams(searchParams: URLSearchParams): {
  projectId?: string;
  previewImage?: string;
  editorStatus?: 'saved' | 'cancelled';
} {
  const projectId = searchParams.get('projectId') || undefined;
  const previewImage = searchParams.get('previewImage') || undefined;
  const editorStatus = searchParams.get('editorStatus') as 'saved' | 'cancelled' | undefined;

  return {
    projectId,
    previewImage,
    editorStatus,
  };
}

/**
 * Handle editor return in client component
 */
export function handleEditorReturn(
  searchParams: URLSearchParams,
  onProjectLoaded: (projectId: string, previewImage: string) => void,
  onCancelled?: () => void
): void {
  const { projectId, previewImage, editorStatus } = parseReturnParams(searchParams);

  if (editorStatus === 'saved' && projectId && previewImage) {
    onProjectLoaded(projectId, previewImage);
  } else if (editorStatus === 'cancelled' && onCancelled) {
    onCancelled();
  }
}
