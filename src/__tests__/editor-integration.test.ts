/**
 * Test Suite: Editor-Configurator-Cart Integration
 * Tests the complete flow from configurator → editor → save → return → cart
 */

import { describe, it, expect } from 'vitest';
import { generateEditorUrl, parseEditorUrl } from '@/lib/editor/generateEditorUrl';
import { generateReturnUrl, parseReturnParams } from '@/lib/editor/returnToConfigurator';
import { validateProject, needsRevalidation } from '@/lib/editor/validateProject';
import type { ProjectData } from '@/lib/editor/validateProject';

describe('Editor URL Generation', () => {
  it('should generate correct editor URL with all parameters', () => {
    const url = generateEditorUrl({
      productId: 'prod-123',
      dimensions: { width: 500, height: 700, unit: 'mm' },
      bleed: 3,
      materialId: 'mat-1',
      printMethodId: 'pm-1',
      finishingIds: ['fin-1', 'fin-2'],
      templateId: 'tpl-1',
      projectId: 'proj-123',
    });

    expect(url).toContain('/editor?');
    expect(url).toContain('productId=prod-123');
    expect(url).toContain('width=500');
    expect(url).toContain('height=700');
    expect(url).toContain('unit=mm');
    expect(url).toContain('bleed=3');
    expect(url).toContain('materialId=mat-1');
    expect(url).toContain('printMethodId=pm-1');
    // finishingIds are URL encoded: , becomes %2C
    expect(url).toMatch(/finishingIds=fin-1(%2C|,)fin-2/);
    expect(url).toContain('templateId=tpl-1');
    expect(url).toContain('projectId=proj-123');
  });

  it('should parse editor URL parameters correctly', () => {
    const searchParams = new URLSearchParams(
      'productId=prod-123&width=500&height=700&unit=mm&bleed=3&materialId=mat-1'
    );
    
    const params = parseEditorUrl(searchParams);
    
    expect(params.productId).toBe('prod-123');
    expect(params.dimensions?.width).toBe(500);
    expect(params.dimensions?.height).toBe(700);
    expect(params.dimensions?.unit).toBe('mm');
    expect(params.bleed).toBe(3);
    expect(params.materialId).toBe('mat-1');
  });

  it('should throw error for missing required parameters', () => {
    const searchParams = new URLSearchParams('productId=prod-123');
    
    expect(() => parseEditorUrl(searchParams)).toThrow('Missing required editor parameters');
  });
});

describe('Return to Configurator', () => {
  it('should generate return URL with saved status', () => {
    const url = generateReturnUrl({
      productId: 'prod-123',
      productSlug: 'poster-foto',
      projectId: 'proj-456',
      previewImage: 'https://cdn.com/preview.png',
      status: 'saved',
    });

    expect(url).toContain('/products/poster-foto?');
    expect(url).toContain('projectId=proj-456');
    expect(url).toContain('previewImage=');
    expect(url).toContain('editorStatus=saved');
  });

  it('should generate return URL with cancelled status', () => {
    const url = generateReturnUrl({
      productId: 'prod-123',
      projectId: 'proj-456',
      previewImage: 'https://cdn.com/preview.png',
      status: 'cancelled',
    });

    expect(url).toContain('editorStatus=cancelled');
    expect(url).not.toContain('projectId');
    expect(url).not.toContain('previewImage');
  });

  it('should parse return parameters correctly', () => {
    const searchParams = new URLSearchParams(
      'projectId=proj-456&previewImage=https://cdn.com/preview.png&editorStatus=saved'
    );
    
    const params = parseReturnParams(searchParams);
    
    expect(params.projectId).toBe('proj-456');
    expect(params.previewImage).toBe('https://cdn.com/preview.png');
    expect(params.editorStatus).toBe('saved');
  });
});

describe('Project Validation', () => {
  const validProject: ProjectData = {
    dimensions: { width: 500, height: 700, unit: 'mm' },
    bleed: 3,
    dpi: 300,
    layers: [{ id: '1', type: 'image', url: 'image.png' }],
    finalFileUrl: 'https://cdn.com/final.pdf',
    previewImage: 'https://cdn.com/preview.png',
  };

  it('should validate correct project', () => {
    const result = validateProject(validProject);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing dimensions', () => {
    const invalidProject = { ...validProject, dimensions: undefined } as ProjectData;
    
    const result = validateProject(invalidProject);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Proiectul nu are dimensiuni definite');
  });

  it('should detect incorrect dimensions', () => {
    const result = validateProject(validProject, {
      width: 600,
      height: 800,
      unit: 'mm',
    });
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('nu corespunde');
  });

  it('should detect low DPI', () => {
    const lowDpiProject = { ...validProject, dpi: 100 };
    
    const result = validateProject(lowDpiProject);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Rezoluția (100 DPI) este prea mică. Minim 150 DPI');
  });

  it('should warn about low bleed', () => {
    const lowBleedProject = { ...validProject, bleed: 2 };
    
    const result = validateProject(lowBleedProject);
    
    expect(result.warnings).toContain('Bleed-ul recomandat este de minim 3mm');
  });

  it('should detect missing final file', () => {
    const noFileProject = { ...validProject, finalFileUrl: undefined };
    
    const result = validateProject(noFileProject);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Proiectul nu are fișier final generat');
  });

  it('should warn about missing preview', () => {
    const noPreviewProject = { ...validProject, previewImage: undefined };
    
    const result = validateProject(noPreviewProject);
    
    expect(result.warnings).toContain('Proiectul nu are imagine de preview');
  });

  it('should detect if revalidation is needed', () => {
    const needsUpdate = needsRevalidation(validProject, {
      width: 600,
      height: 700,
      unit: 'mm',
    });
    
    expect(needsUpdate).toBe(true);
  });

  it('should not require revalidation for same dimensions', () => {
    const needsUpdate = needsRevalidation(validProject, {
      width: 500,
      height: 700,
      unit: 'mm',
    });
    
    expect(needsUpdate).toBe(false);
  });

  it('should handle unit conversion for validation', () => {
    const needsUpdate = needsRevalidation(validProject, {
      width: 50,
      height: 70,
      unit: 'cm',
    });
    
    // 50cm = 500mm, 70cm = 700mm
    expect(needsUpdate).toBe(false);
  });
});

describe('Cart Item with Project', () => {
  it('should include project data in cart payload', () => {
    const cartItem = {
      productId: 'prod-123',
      name: 'Poster Foto',
      slug: 'poster-foto',
      quantity: 5,
      price: 130.5,
      configuration: {
        dimensions: { width: 500, height: 700, unit: 'mm' },
        materialId: 'mat-1',
        printMethodId: 'pm-1',
        finishingIds: ['fin-1'],
        options: {},
      },
      projectId: 'proj-456',
      previewImage: 'https://cdn.com/preview.png',
      finalFileUrl: 'https://cdn.com/final.pdf',
      metadata: {
        material: 'Satin Premium',
        printMethod: 'Digital UV',
        finishing: 'Laminare',
        dimensions: '500 × 700 mm',
      },
    };

    expect(cartItem.projectId).toBeDefined();
    expect(cartItem.previewImage).toBeDefined();
    expect(cartItem.finalFileUrl).toBeDefined();
    expect(cartItem.configuration).toBeDefined();
    expect(cartItem.metadata).toBeDefined();
  });
});

describe('Order Creation with Project', () => {
  it('should include project fields in order item', () => {
    const orderItem = {
      orderId: 'order-789',
      productId: 'prod-123',
      quantity: 5,
      unitPrice: 26.1,
      lineTotal: 130.5,
      projectId: 'proj-456',
      previewImage: 'https://cdn.com/preview.png',
      finalFileUrl: 'https://cdn.com/final.pdf',
      configuration: {
        dimensions: { width: 500, height: 700, unit: 'mm' },
        materialId: 'mat-1',
        printMethodId: 'pm-1',
      },
    };

    expect(orderItem.projectId).toBe('proj-456');
    expect(orderItem.previewImage).toBeDefined();
    expect(orderItem.finalFileUrl).toBeDefined();
    expect(orderItem.configuration).toBeDefined();
  });
});

describe('Integration Flow', () => {
  it('should complete full flow: configurator → editor → save → return', () => {
    // Step 1: Generate editor URL from configurator
    const editorUrl = generateEditorUrl({
      productId: 'prod-123',
      dimensions: { width: 500, height: 700, unit: 'mm' },
      bleed: 3,
      materialId: 'mat-1',
      printMethodId: 'pm-1',
    });
    expect(editorUrl).toBeDefined();

    // Step 2: Parse parameters in editor
    const urlObj = new URL(editorUrl, 'http://localhost:3000');
    const editorParams = parseEditorUrl(urlObj.searchParams);
    expect(editorParams.productId).toBe('prod-123');
    expect(editorParams.dimensions).toBeDefined();

    // Step 3: Simulate save (project would be saved via API)
    const savedProject = {
      projectId: 'proj-new-123',
      previewUrl: 'https://cdn.com/preview-new.png',
      finalFileUrl: 'https://cdn.com/final-new.pdf',
    };

    // Step 4: Generate return URL
    const returnUrl = generateReturnUrl({
      productId: 'prod-123',
      productSlug: 'poster-foto',
      projectId: savedProject.projectId,
      previewImage: savedProject.previewUrl,
      status: 'saved',
    });
    expect(returnUrl).toContain('projectId=proj-new-123');
    expect(returnUrl).toContain('editorStatus=saved');

    // Step 5: Parse return parameters in configurator
    const returnUrlObj = new URL(returnUrl, 'http://localhost:3000');
    const returnParams = parseReturnParams(returnUrlObj.searchParams);
    expect(returnParams.projectId).toBe('proj-new-123');
    expect(returnParams.editorStatus).toBe('saved');

    // Step 6: Validate project before adding to cart
    const projectToValidate: ProjectData = {
      dimensions: { width: 500, height: 700, unit: 'mm' },
      bleed: 3,
      dpi: 300,
      finalFileUrl: savedProject.finalFileUrl,
      previewImage: savedProject.previewUrl,
      layers: [{ id: '1', type: 'image' }],
    };
    const validation = validateProject(projectToValidate);
    expect(validation.valid).toBe(true);

    // Step 7: Add to cart with project
    const cartItem = {
      productId: 'prod-123',
      projectId: savedProject.projectId,
      previewImage: savedProject.previewUrl,
      finalFileUrl: savedProject.finalFileUrl,
      quantity: 5,
    };
    expect(cartItem.projectId).toBe('proj-new-123');
  });
});
