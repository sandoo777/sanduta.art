import { prisma } from '@/lib/prisma';

export type FormatCategoryItem = {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export interface FormatInput {
  category?: unknown;
  name?: unknown;
  width_mm?: unknown;
  height_mm?: unknown;
}

export interface FormatCategoryInput {
  code?: unknown;
  name?: unknown;
  enabled?: unknown;
}

export class FormatValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'FormatValidationError';
    this.status = status;
  }
}

const FORMAT_CATEGORIES_KEY = 'format_categories';

function normalizeString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new FormatValidationError(`${field} is required`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new FormatValidationError(`${field} is required`);
  }

  return trimmed;
}

function normalizePositiveInt(value: unknown, field: string): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new FormatValidationError(`${field} must be a positive number`);
  }
  return Math.trunc(num);
}

function normalizeCategoryCode(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    throw new FormatValidationError('category is required');
  }
  return raw.toUpperCase();
}

function normalizeCategoryName(value: unknown): string {
  const raw = normalizeString(value, 'name');
  return raw.replace(/\s+/g, ' ');
}

function createCategoryItem(code: string, name: string, enabled = true): FormatCategoryItem {
  const now = new Date().toISOString();
  return {
    id: `fmt-cat-${Math.random().toString(36).slice(2, 11)}`,
    code,
    name,
    enabled,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function parseCategories(raw: string | null | undefined): FormatCategoryItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const item = entry as Record<string, unknown>;
        const code = normalizeCategoryCode(item.code ?? item.name ?? '');
        if (!code) return null;
        const name = typeof item.name === 'string' && item.name.trim()
          ? item.name.trim()
          : code;
        return {
          id: typeof item.id === 'string' ? item.id : `fmt-cat-${Math.random().toString(36).slice(2, 11)}`,
          code,
          name,
          enabled: item.enabled === false ? false : true,
          usageCount: typeof item.usageCount === 'number' ? item.usageCount : 0,
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
          updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
        } satisfies FormatCategoryItem;
      })
      .filter((entry): entry is FormatCategoryItem => Boolean(entry));
  } catch {
    return [];
  }
}

async function ensureDefaultFormatCategories() {
  const usedFormatCategories = await prisma.format.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  const requiredCodes = new Set<string>([
    'FOI',
    'ROLE',
    ...usedFormatCategories
      .map((item) => item.category?.trim().toUpperCase())
      .filter((value): value is string => Boolean(value)),
  ]);

  const existing = await prisma.systemSetting.findUnique({ where: { key: FORMAT_CATEGORIES_KEY } });
  if (!existing) {
    const defaults = Array.from(requiredCodes).map((code) => createCategoryItem(
      code,
      code === 'FOI' ? 'Foi' : code === 'ROLE' ? 'Role' : code,
      true,
    ));

    await prisma.systemSetting.create({
      data: {
        key: FORMAT_CATEGORIES_KEY,
        value: JSON.stringify(defaults),
      },
    });
    return;
  }

  const parsed = parseCategories(existing.value);
  const parsedByCode = new Map(parsed.map((item) => [item.code, item]));
  const missingCodes = Array.from(requiredCodes).filter((code) => !parsedByCode.has(code));
  const disabledUsedCodes = usedFormatCategories
    .map((item) => item.category?.trim().toUpperCase())
    .filter((value): value is string => Boolean(value))
    .filter((code) => parsedByCode.get(code)?.enabled === false);

  if (parsed.length > 0 && missingCodes.length === 0 && disabledUsedCodes.length === 0) {
    return;
  }

  const merged = [...parsed];

  for (const code of missingCodes) {
    merged.push(createCategoryItem(
      code,
      code === 'FOI' ? 'Foi' : code === 'ROLE' ? 'Role' : code,
      true,
    ));
  }

  const normalized = merged.map((item) => {
    if (requiredCodes.has(item.code) && disabledUsedCodes.includes(item.code)) {
      return {
        ...item,
        enabled: true,
        updatedAt: new Date().toISOString(),
      };
    }

    return item;
  });

  await prisma.systemSetting.update({
    where: { key: FORMAT_CATEGORIES_KEY },
    data: { value: JSON.stringify(normalized) },
  });
}

async function countCategoryUsage(code: string): Promise<number> {
  return prisma.format.count({ where: { category: code } });
}

async function fetchFormatCategories() {
  await ensureDefaultFormatCategories();

  const setting = await prisma.systemSetting.findUnique({ where: { key: FORMAT_CATEGORIES_KEY } });
  const parsed = parseCategories(setting?.value ?? null);

  const hydrated = await Promise.all(
    parsed.map(async (entry) => ({
      ...entry,
      usageCount: await countCategoryUsage(entry.code),
    }))
  );

  return hydrated.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

async function saveFormatCategories(items: FormatCategoryItem[]) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  await prisma.systemSetting.upsert({
    where: { key: FORMAT_CATEGORIES_KEY },
    update: { value: JSON.stringify(sorted) },
    create: { key: FORMAT_CATEGORIES_KEY, value: JSON.stringify(sorted) },
  });
}

function generateFormatName(widthMm: number, heightMm: number | null): string {
  if (heightMm != null && heightMm > 0) {
    return `${widthMm}x${heightMm} mm`;
  }

  return `${widthMm} mm`;
}

export function normalizeFormatRecord(record: {
  id: string;
  category: string;
  width_mm: number;
  height_mm: number | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: record.id,
    category: record.category,
    width_mm: Number(record.width_mm),
    height_mm: record.height_mm == null ? null : Number(record.height_mm),
    name: record.name,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listFormatCategories(includeDisabled = true) {
  const items = await fetchFormatCategories();
  if (includeDisabled) {
    return items;
  }

  return items.filter((item) => item.enabled);
}

async function ensureUsableCategory(code: string) {
  const categories = await fetchFormatCategories();
  const found = categories.find((item) => item.code === code);

  if (!found) {
    throw new FormatValidationError('category is invalid');
  }

  if (!found.enabled) {
    throw new FormatValidationError('Selected category is disabled');
  }

  return found;
}

export async function listFormats(category?: string, search?: string) {
  const normalizedCategory = category?.trim().toUpperCase();
  const normalizedSearch = search?.trim().toLowerCase();

  const formats = await prisma.format.findMany({
    where: normalizedCategory ? { category: normalizedCategory } : undefined,
    orderBy: { name: 'asc' },
  });

  const records = formats.map(normalizeFormatRecord);
  if (!normalizedSearch) {
    return records;
  }

  return records.filter((format) => {
    const haystack = [format.name, format.category, String(format.width_mm), String(format.height_mm ?? '')].join(' ').toLowerCase();
    return haystack.includes(normalizedSearch);
  });
}

export async function getFormatById(id: string) {
  const format = await prisma.format.findUnique({ where: { id } });
  return format ? normalizeFormatRecord(format) : null;
}

export async function createFormat(input: FormatInput) {
  const category = normalizeCategoryCode(input.category);
  await ensureUsableCategory(category);

  const widthMm = normalizePositiveInt(input.width_mm, 'width_mm');

  const heightMm = input.height_mm == null || input.height_mm === ''
    ? null
    : normalizePositiveInt(input.height_mm, 'height_mm');

  const providedName = typeof input.name === 'string' ? input.name.trim() : '';
  const name = providedName || generateFormatName(widthMm, heightMm);

  const record = await prisma.format.create({
    data: {
      category,
      width_mm: widthMm,
      height_mm: heightMm,
      name,
    },
  });

  return normalizeFormatRecord(record);
}

export async function updateFormat(id: string, input: FormatInput) {
  const existing = await prisma.format.findUnique({ where: { id } });
  if (!existing) {
    throw new FormatValidationError('Format not found', 404);
  }

  const category = input.category === undefined
    ? existing.category
    : normalizeCategoryCode(input.category ?? existing.category);
  await ensureUsableCategory(category);

  const widthMm = input.width_mm === undefined ? existing.width_mm : normalizePositiveInt(input.width_mm, 'width_mm');

  let heightMm: number | null;
  if (input.height_mm === undefined) {
    heightMm = existing.height_mm ?? null;
  } else if (input.height_mm === null || input.height_mm === '') {
    heightMm = null;
  } else {
    heightMm = normalizePositiveInt(input.height_mm, 'height_mm');
  }

  const providedName = typeof input.name === 'string' ? input.name.trim() : '';
  const name = providedName || generateFormatName(widthMm, heightMm);

  const record = await prisma.format.update({
    where: { id },
    data: {
      category,
      width_mm: widthMm,
      height_mm: heightMm,
      name,
    },
  });

  return normalizeFormatRecord(record);
}

export async function deleteFormat(id: string) {
  const existing = await prisma.format.findUnique({ where: { id } });
  if (!existing) {
    throw new FormatValidationError('Format not found', 404);
  }

  await prisma.material.updateMany({
    where: { formatId: id },
    data: {
      formatId: null,
      formatName: null,
      width_mm: null,
      height_mm: null,
    },
  });

  await prisma.format.delete({ where: { id } });

  return { success: true, message: 'Format deleted successfully' };
}

export async function createFormatCategory(input: FormatCategoryInput) {
  const code = normalizeCategoryCode(input.code ?? input.name);
  const name = normalizeCategoryName(input.name ?? input.code);
  const enabled = input.enabled === false ? false : true;

  const current = await fetchFormatCategories();
  const duplicate = current.some((entry) => entry.code === code || entry.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    throw new FormatValidationError('Format category already exists', 409);
  }

  const nextItem = createCategoryItem(code, name, enabled);
  await saveFormatCategories([...current, nextItem]);

  return nextItem;
}

export async function updateFormatCategory(id: string, patch: FormatCategoryInput) {
  const current = await fetchFormatCategories();
  const index = current.findIndex((entry) => entry.id === id);

  if (index === -1) {
    throw new FormatValidationError('Format category not found', 404);
  }

  const target = current[index];
  const nextCode = patch.code === undefined ? target.code : normalizeCategoryCode(patch.code);
  const nextName = patch.name === undefined ? target.name : normalizeCategoryName(patch.name);
  const nextEnabled = patch.enabled === undefined ? target.enabled : Boolean(patch.enabled);

  const duplicate = current.some((entry) => entry.id !== id && (entry.code === nextCode || entry.name.toLowerCase() === nextName.toLowerCase()));
  if (duplicate) {
    throw new FormatValidationError('Another category with this code or name already exists', 409);
  }

  if (nextCode !== target.code) {
    await prisma.format.updateMany({
      where: { category: target.code },
      data: { category: nextCode },
    });
  }

  const updated = [...current];
  updated[index] = {
    ...target,
    code: nextCode,
    name: nextName,
    enabled: nextEnabled,
    updatedAt: new Date().toISOString(),
  };

  await saveFormatCategories(updated);
  return updated[index];
}

export async function deleteFormatCategory(id: string) {
  const current = await fetchFormatCategories();
  const item = current.find((entry) => entry.id === id);
  if (!item) {
    throw new FormatValidationError('Format category not found', 404);
  }

  if (item.usageCount > 0) {
    throw new FormatValidationError('Category is used by existing formats and cannot be deleted. Disable it instead.', 409);
  }

  const next = current.filter((entry) => entry.id !== id);
  await saveFormatCategories(next);
  return { success: true, id };
}
