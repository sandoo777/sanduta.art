import type { DimensionUnit } from '@/modules/configurator/types';

export interface EditorUrlParams {
  productId: string;
  dimensions: {
    width: number;
    height: number;
    unit: DimensionUnit;
  };
  bleed?: number;
  materialId?: string;
  printMethodId?: string;
  finishingIds?: string[];
  templateId?: string;
  projectId?: string;
}

/**
 * Generates a URL to open the editor with specific parameters
 */
export function generateEditorUrl(params: EditorUrlParams): string {
  const searchParams = new URLSearchParams();

  // Required parameters
  searchParams.set('productId', params.productId);
  searchParams.set('width', params.dimensions.width.toString());
  searchParams.set('height', params.dimensions.height.toString());
  searchParams.set('unit', params.dimensions.unit);

  // Optional parameters
  if (params.bleed !== undefined) {
    searchParams.set('bleed', params.bleed.toString());
  }

  if (params.materialId) {
    searchParams.set('materialId', params.materialId);
  }

  if (params.printMethodId) {
    searchParams.set('printMethodId', params.printMethodId);
  }

  if (params.finishingIds && params.finishingIds.length > 0) {
    searchParams.set('finishingIds', params.finishingIds.join(','));
  }

  if (params.templateId) {
    searchParams.set('templateId', params.templateId);
  }

  if (params.projectId) {
    searchParams.set('projectId', params.projectId);
  }

  return `/editor?${searchParams.toString()}`;
}

/**
 * Parses editor URL parameters back to EditorUrlParams
 */
export function parseEditorUrl(searchParams: URLSearchParams): Partial<EditorUrlParams> {
  const productId = searchParams.get('productId');
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  const unit = searchParams.get('unit') as DimensionUnit;

  if (!productId || !width || !height || !unit) {
    throw new Error('Missing required editor parameters');
  }

  const params: EditorUrlParams = {
    productId,
    dimensions: {
      width: parseFloat(width),
      height: parseFloat(height),
      unit,
    },
  };

  const bleed = searchParams.get('bleed');
  if (bleed) {
    params.bleed = parseFloat(bleed);
  }

  const materialId = searchParams.get('materialId');
  if (materialId) {
    params.materialId = materialId;
  }

  const printMethodId = searchParams.get('printMethodId');
  if (printMethodId) {
    params.printMethodId = printMethodId;
  }

  const finishingIds = searchParams.get('finishingIds');
  if (finishingIds) {
    params.finishingIds = finishingIds.split(',');
  }

  const templateId = searchParams.get('templateId');
  if (templateId) {
    params.templateId = templateId;
  }

  const projectId = searchParams.get('projectId');
  if (projectId) {
    params.projectId = projectId;
  }

  return params;
}
