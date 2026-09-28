import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';

export type MaterialPropertyListType = 'finishes' | 'colors' | 'textures';

export type MaterialPropertyListItem = {
  id: string;
  value: string;
  enabled: boolean;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
};

const LIST_KEYS: Record<MaterialPropertyListType, string> = {
  finishes: 'material_property_lists.finishes',
  colors: 'material_property_lists.colors',
  textures: 'material_property_lists.textures',
};

function normalizeValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function createItem(value: string, enabled = true): MaterialPropertyListItem {
  return {
    id: `item-${Math.random().toString(36).slice(2, 11)}`,
    value: normalizeValue(value),
    enabled,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function parseListSetting(raw: string | null | undefined): MaterialPropertyListItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const items = parsed
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const item = entry as Record<string, unknown>;
        const value = typeof item.value === 'string' ? normalizeValue(item.value) : '';
        if (!value) return null;
        return {
          id: typeof item.id === 'string' ? item.id : `item-${Math.random().toString(36).slice(2, 11)}`,
          value,
          enabled: item.enabled === false ? false : true,
          usageCount: typeof item.usageCount === 'number' ? item.usageCount : 0,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
          updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
        } satisfies MaterialPropertyListItem;
      })
      .filter((entry): entry is MaterialPropertyListItem => Boolean(entry));

    return items;
  } catch {
    return [];
  }
}

async function ensureDefaultSettings() {
  const keys = Object.values(LIST_KEYS);
  const existing = await prisma.systemSetting.findMany({
    where: { key: { in: keys } },
    select: { key: true },
  });

  const existingKeys = new Set(existing.map((entry) => entry.key));

  for (const key of keys) {
    if (existingKeys.has(key)) continue;

    await prisma.systemSetting.create({
      data: {
        key,
        value: JSON.stringify([]),
      },
    });
  }
}

async function countListUsage(listType: MaterialPropertyListType, value: string) {
  const materials = await prisma.material.findMany({
    select: {
      id: true,
      finishType: true,
      colorName: true,
      properties: true,
    },
  });

  return materials.reduce((count, material) => {
    if (listType === 'finishes' && material.finishType === value) return count + 1;
    if (listType === 'colors' && material.colorName === value) return count + 1;
    if (listType === 'textures') {
      const properties = material.properties && typeof material.properties === 'object' && !Array.isArray(material.properties)
        ? material.properties as Record<string, unknown>
        : null;
      if (properties && properties.texture === value) return count + 1;
    }
    return count;
  }, 0);
}

async function fetchList(type: MaterialPropertyListType) {
  await ensureDefaultSettings();

  const key = LIST_KEYS[type];
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  const items = parseListSetting(setting?.value ?? null);

  const hydrated = await Promise.all(
    items.map(async (item) => ({
      ...item,
      usageCount: await countListUsage(type, item.value),
    }))
  );

  return hydrated.sort((a, b) => a.value.localeCompare(b.value, undefined, { sensitivity: 'base' }));
}

async function saveList(type: MaterialPropertyListType, items: MaterialPropertyListItem[]) {
  const key = LIST_KEYS[type];
  const sorted = [...items].sort((a, b) => a.value.localeCompare(b.value, undefined, { sensitivity: 'base' }));
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(sorted) },
    create: { key, value: JSON.stringify(sorted) },
  });
}

export async function GET() {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const lists = {
      finishes: await fetchList('finishes'),
      colors: await fetchList('colors'),
      textures: await fetchList('textures'),
    };

    return NextResponse.json({ lists });
  } catch (error) {
    console.error('Error loading material property lists:', error);
    return NextResponse.json({ error: 'Failed to load material property lists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    const type = body?.type as MaterialPropertyListType | undefined;
    const rawValue = typeof body?.value === 'string' ? body.value : '';
    const value = normalizeValue(rawValue);

    if (!type || !LIST_KEYS[type] || !value) {
      return NextResponse.json({ error: 'Invalid list type or value' }, { status: 400 });
    }

    const current = await fetchList(type);
    const exists = current.some((entry) => entry.value.toLowerCase() === value.toLowerCase());
    if (exists) {
      return NextResponse.json({ error: 'This value already exists' }, { status: 409 });
    }

    const next = [...current, { ...createItem(value, body?.enabled !== false), usageCount: 0 }];
    await saveList(type, next);

    return NextResponse.json({ item: next[next.length - 1] });
  } catch (error) {
    console.error('Error creating material property value:', error);
    return NextResponse.json({ error: 'Failed to create material property value' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    const type = body?.type as MaterialPropertyListType | undefined;
    const id = typeof body?.id === 'string' ? body.id : null;

    if (!type || !LIST_KEYS[type] || !id) {
      return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
    }

    const current = await fetchList(type);
    const itemIndex = current.findIndex((entry) => entry.id === id);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'List item not found' }, { status: 404 });
    }

    const nextItem = { ...current[itemIndex] };
    const newValue = typeof body?.value === 'string' ? normalizeValue(body.value) : nextItem.value;
    const newEnabled = body?.enabled !== undefined ? Boolean(body.enabled) : nextItem.enabled;

    if (newValue && newValue !== nextItem.value) {
      const duplicate = current.some((entry) => entry.id !== id && entry.value.toLowerCase() === newValue.toLowerCase());
      if (duplicate) {
        return NextResponse.json({ error: 'A value with this name already exists' }, { status: 409 });
      }

      if (type === 'finishes') {
        await prisma.material.updateMany({
          where: { finishType: nextItem.value },
          data: { finishType: newValue },
        });
      }

      if (type === 'colors') {
        await prisma.material.updateMany({
          where: { colorName: nextItem.value },
          data: { colorName: newValue },
        });
      }

      if (type === 'textures') {
        const materials = await prisma.material.findMany({
          select: { id: true, properties: true },
        });

        for (const material of materials) {
          const properties = material.properties && typeof material.properties === 'object' && !Array.isArray(material.properties)
            ? { ...(material.properties as Record<string, unknown>) }
            : {};

          if (properties.texture === nextItem.value) {
            properties.texture = newValue;
            await prisma.material.update({
              where: { id: material.id },
              data: { properties },
            });
          }
        }
      }
    }

    const updated = [...current];
    updated[itemIndex] = {
      ...nextItem,
      value: newValue || nextItem.value,
      enabled: newEnabled,
      updatedAt: new Date().toISOString(),
    };

    await saveList(type, updated);

    return NextResponse.json({ item: updated[itemIndex] });
  } catch (error) {
    console.error('Error updating material property value:', error);
    return NextResponse.json({ error: 'Failed to update material property value' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await requireRole(['ADMIN', 'MANAGER']);
    if (error) return error;

    const body = await request.json();
    const type = body?.type as MaterialPropertyListType | undefined;
    const id = typeof body?.id === 'string' ? body.id : null;

    if (!type || !LIST_KEYS[type] || !id) {
      return NextResponse.json({ error: 'Invalid delete payload' }, { status: 400 });
    }

    const current = await fetchList(type);
    const item = current.find((entry) => entry.id === id);
    if (!item) {
      return NextResponse.json({ error: 'List item not found' }, { status: 404 });
    }

    if (item.usageCount > 0) {
      return NextResponse.json({ error: 'This value is used by existing materials and cannot be deleted. Disable it instead.', }, { status: 409 });
    }

    const next = current.filter((entry) => entry.id !== id);
    await saveList(type, next);

    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error('Error deleting material property value:', error);
    return NextResponse.json({ error: 'Failed to delete material property value' }, { status: 500 });
  }
}
