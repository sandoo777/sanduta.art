import { describe, expect, it } from 'vitest';
import { filterGroupedMaterials, groupMaterialsByCategory } from '@/app/admin/print-methods/_components/materialCompatibilityGrouping';

describe('print method compatible materials grouping', () => {
  it('groups materials by category and sorts by category and name', () => {
    const materials = [
      { id: 'm3', name: 'Backlit', categoryId: 'default_banner', categoryInfo: { id: 'default_banner', name: 'Banners' } },
      { id: 'm1', name: 'Coated Gloss 170g', categoryId: 'default_paper', categoryInfo: { id: 'default_paper', name: 'Papers' } },
      { id: 'm2', name: 'Monomeric', categoryId: 'default_self_adhesive', categoryInfo: { id: 'default_self_adhesive', name: 'Self Adhesive' } },
      { id: 'm4', name: 'Forex 3mm', categoryId: 'default_rigid', categoryInfo: { id: 'default_rigid', name: 'Rigid Materials' } },
      { id: 'm5', name: 'Offset 80g', categoryId: 'default_paper', categoryInfo: { id: 'default_paper', name: 'Papers' } },
    ] as any;

    const grouped = groupMaterialsByCategory(materials);

    expect(grouped.map((group) => group.categoryName)).toEqual([
      'Banners',
      'Papers',
      'Rigid Materials',
      'Self Adhesive',
    ]);

    expect(grouped[1].materials.map((material) => material.name)).toEqual([
      'Coated Gloss 170g',
      'Offset 80g',
    ]);
  });

  it('filters category names and material names by search query', () => {
    const grouped = [
      {
        categoryId: 'paper',
        categoryName: 'Papers',
        materials: [
          { id: 'm1', name: 'Offset 80g', category: { name: 'Papers' } },
          { id: 'm2', name: 'Coated Matte 300g', category: { name: 'Papers' } },
        ],
      },
      {
        categoryId: 'banner',
        categoryName: 'Banners',
        materials: [
          { id: 'm3', name: 'Frontlit', category: { name: 'Banners' } },
        ],
      },
    ] as any;

    const filtered = filterGroupedMaterials(grouped, 'matte');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].categoryName).toBe('Papers');
    expect(filtered[0].materials.map((material) => material.name)).toEqual(['Coated Matte 300g']);
  });
});
