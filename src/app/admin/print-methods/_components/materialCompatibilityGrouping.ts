export interface MaterialCategoryGroupItem {
  id: string;
  name: string;
  category?: string | { id?: string | null; name?: string | null } | null;
  categoryInfo?: { id?: string | null; name?: string | null } | null;
  categoryId?: string | null;
  unit?: string;
  stock?: number;
  minStock?: number;
}

export interface MaterialCategoryGroup {
  categoryId: string;
  categoryName: string;
  materials: MaterialCategoryGroupItem[];
}

function normalizeCategoryName(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || 'Uncategorized';
  }

  return 'Uncategorized';
}

function resolveCategoryMeta(material: MaterialCategoryGroupItem): { id: string; name: string } {
  const explicitInfoName = material.categoryInfo?.name;
  const explicitInfoId = material.categoryInfo?.id ?? material.categoryId;
  if (explicitInfoName && String(explicitInfoName).trim()) {
    return {
      id: explicitInfoId && String(explicitInfoId).trim() ? String(explicitInfoId) : String(explicitInfoName).toLowerCase(),
      name: String(explicitInfoName).trim(),
    };
  }

  const legacyCategory = material.category;
  if (typeof legacyCategory === 'string' && legacyCategory.trim()) {
    return {
      id: material.categoryId && String(material.categoryId).trim() ? String(material.categoryId) : legacyCategory.toLowerCase(),
      name: legacyCategory.trim(),
    };
  }

  if (legacyCategory && typeof legacyCategory === 'object' && 'name' in legacyCategory) {
    const name = String((legacyCategory as { name?: unknown }).name ?? '').trim();
    const id = material.categoryId && String(material.categoryId).trim()
      ? String(material.categoryId)
      : (legacyCategory as { id?: unknown }).id && String((legacyCategory as { id?: unknown }).id ?? '').trim()
        ? String((legacyCategory as { id?: unknown }).id)
        : name.toLowerCase();

    return {
      id,
      name: name || 'Uncategorized',
    };
  }

  if (material.categoryId && String(material.categoryId).trim()) {
    return {
      id: String(material.categoryId),
      name: normalizeCategoryName(material.categoryId),
    };
  }

  return {
    id: 'uncategorized',
    name: 'Uncategorized',
  };
}

export function groupMaterialsByCategory(
  materials: MaterialCategoryGroupItem[]
): MaterialCategoryGroup[] {
  const grouped = new Map<string, MaterialCategoryGroup>();

  for (const material of materials) {
    const categoryMeta = resolveCategoryMeta(material);
    const categoryName = normalizeCategoryName(categoryMeta.name);
    const categoryId = categoryMeta.id || 'uncategorized';

    if (!grouped.has(categoryId)) {
      grouped.set(categoryId, {
        categoryId,
        categoryName,
        materials: [],
      });
    }

    grouped.get(categoryId)!.materials.push(material);
  }

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      materials: group.materials.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    }))
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
}

export function filterGroupedMaterials(
  groups: MaterialCategoryGroup[],
  query: string
): MaterialCategoryGroup[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      materials: group.materials.filter((material) => {
        const materialName = material.name?.toLowerCase() ?? '';
        const categoryName = group.categoryName.toLowerCase();
        return materialName.includes(normalizedQuery) || categoryName.includes(normalizedQuery);
      }),
    }))
    .filter((group) => group.materials.length > 0);
}
