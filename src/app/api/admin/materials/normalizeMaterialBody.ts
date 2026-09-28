import { prisma } from '@/lib/prisma';
import { sanitizeMaterialPayloadByUnit } from '@/config/materialPropsByUnit';

function toOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function normalizeMaterialBody(rawBody: unknown): Promise<Record<string, unknown>> {
  let body = rawBody && typeof rawBody === 'object'
    ? { ...(rawBody as Record<string, unknown>) }
    : {};

  if (body.categoryId === undefined && body.category_id !== undefined) {
    body.categoryId = body.category_id;
  }
  if (body.colorName === undefined && body.color_name !== undefined) {
    body.colorName = body.color_name;
  }
  if (body.colorCode === undefined && body.color_code !== undefined) {
    body.colorCode = body.color_code;
  }
  if (body.thumbnailUrl === undefined && body.thumbnail_url !== undefined) {
    body.thumbnailUrl = body.thumbnail_url;
  }
  if (body.thumbnailUrl === undefined && body.thumbnailImage !== undefined) {
    body.thumbnailUrl = body.thumbnailImage;
  }
  if (body.macroTextureUrl === undefined && body.macro_texture_url !== undefined) {
    body.macroTextureUrl = body.macro_texture_url;
  }
  if (body.macroTextureUrl === undefined && body.macroTextureImage !== undefined) {
    body.macroTextureUrl = body.macroTextureImage;
  }
  if (body.texture === undefined && body.properties && typeof body.properties === 'object' && !Array.isArray(body.properties) && 'texture' in body.properties) {
    body.texture = (body.properties as Record<string, unknown>).texture;
  }
  if (body.minimumMarginPercent === undefined && body.minimum_margin_percent !== undefined) {
    body.minimumMarginPercent = body.minimum_margin_percent;
  }

  const materialType = toTrimmedString(body.materialType).toUpperCase();
  const unit = toTrimmedString(body.unit).toLowerCase();
  const formatId = toTrimmedString(body.formatId);

  const isCoalaMaterial = materialType === 'COALA' || unit === 'sheet';

  if (unit === 'sheet') {
    delete body.width_mm;
    delete body.height_mm;
  }

  // Temporary compatibility alias while clients migrate from COALA -> SUPORT_FOI.
  if (materialType === 'COALA') {
    body.materialType = 'SUPORT_FOI';
  }

  // Backward-compatible field aliases.
  const legacyGramaj = body.gramaj_g ?? body.weight;
  const density = toOptionalNumber(legacyGramaj);
  if ((body.density === undefined || body.density === null || body.density === '') && density !== undefined) {
    body.density = density;
  }

  const legacySheetsPerBox = body.sheets_per_box ?? body.foi_per_cutie;
  const packagingQty = toOptionalNumber(legacySheetsPerBox);
  if ((body.packagingQty === undefined || body.packagingQty === null || body.packagingQty === '') && packagingQty !== undefined) {
    body.packagingQty = packagingQty;
  }

  // For COALA/sheet, keep dimensions consistent with selected format.
  if (isCoalaMaterial && formatId) {
    const format = await prisma.format.findUnique({
      where: { id: formatId },
      select: { width_mm: true, height_mm: true, name: true },
    });

    if (format) {
      body.width_mm = format.width_mm;
      body.height_mm = format.height_mm ?? null;
      if (!toTrimmedString(body.formatName)) {
        body.formatName = format.name;
      }
    }
  }

  const { sanitized, ignoredFields } = sanitizeMaterialPayloadByUnit(body, body.unit);
  body = sanitized;

  if (Array.isArray(body.suppliers)) {
    body.suppliers = body.suppliers
      .map((entry) => {
        if (typeof entry === 'string') {
          const supplierId = entry.trim();
          return supplierId ? { supplierId } : null;
        }

        if (!entry || typeof entry !== 'object') return null;
        const next = { ...(entry as Record<string, unknown>) };
        delete next.leadTime;
        delete next.leadTimeDays;
        delete next.unitCost;
        delete next.notes;

        const supplierId = typeof next.supplierId === 'string' ? next.supplierId.trim() : '';
        return supplierId ? { supplierId } : null;
      })
      .filter((entry): entry is { supplierId: string } => Boolean(entry));
  }

  if (body.unit === 'sheet') {
    delete body.gramaj_g;
    delete body.sheets_per_box;
  }

  if (body.texture !== undefined && body.texture !== null && body.texture !== '') {
    const nextProperties = typeof body.properties === 'object' && body.properties && !Array.isArray(body.properties)
      ? { ...(body.properties as Record<string, unknown>) }
      : {};
    nextProperties.texture = body.texture;
    body.properties = nextProperties;
  }

  if (process.env.NODE_ENV !== 'production' && ignoredFields.length > 0) {
    console.debug('[SANITIZE] material payload ignored fields', {
      unit: body.unit,
      ignoredFields,
    });
  }

  return body;
}
