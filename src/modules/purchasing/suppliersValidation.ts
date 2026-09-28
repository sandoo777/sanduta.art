import { z } from 'zod';

const phoneRegex = /^\+373\d{8}$/;
const COD_FISCAL_REGEX = /^\d{8,13}$/;

export type SupplierPhoneEntry = {
  number: string;
  name: string | null;
};

export type SupplierPhoneInput = string | { number?: string; name?: string | null } | null | undefined;

function optionalTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizePhoneMD(raw: string): string {
  let normalized = raw.replace(/[\s\-()]/g, '');

  if (normalized.startsWith('00')) {
    normalized = `+${normalized.slice(2)}`;
  }

  if (normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }

  if (normalized.startsWith('373') && !normalized.startsWith('+')) {
    normalized = `+${normalized}`;
  }

  if (!normalized.startsWith('+')) {
    normalized = `+373${normalized}`;
  }

  if (!phoneRegex.test(normalized)) {
    throw new Error('Introduceți număr cu prefix MD +373 sau fără prefix — vom normaliza');
  }

  return normalized;
}

export function normalizeSupplierPhoneEntry(value: SupplierPhoneInput): SupplierPhoneEntry {
  if (typeof value === 'string') {
    return { number: normalizePhoneMD(value), name: null };
  }

  const rawNumber = typeof value?.number === 'string' ? value.number : '';
  const rawName = typeof value?.name === 'string' ? value.name.trim() : '';

  return {
    number: normalizePhoneMD(rawNumber),
    name: rawName.length > 0 ? rawName : null,
  };
}

export function normalizeSupplierPhones(raw: unknown): SupplierPhoneEntry[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => normalizeSupplierPhoneEntry(entry as SupplierPhoneInput))
    .filter((entry) => entry.number.trim().length > 0);
}

export function normalizeWebsite(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('Website invalid. Folosiți un URL valid (http:// sau https://).');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Website invalid. Folosiți un URL valid (http:// sau https://).');
  }

  return parsed.toString();
}

export function normalizeCodFiscal(raw: string): string {
  const compact = raw.trim().replace(/[\s-]/g, '');
  if (!compact) return '';
  if (!COD_FISCAL_REGEX.test(compact)) {
    throw new Error('Cod fiscal invalid');
  }
  return compact;
}

const supplierPhoneSchema = z.union([
  z.string().trim().min(1, 'Numărul de telefon este obligatoriu'),
  z.object({
    number: z.string().trim().min(1, 'Numărul de telefon este obligatoriu'),
    name: z.string().trim().max(200, 'Numele persoanei de contact este prea lung').optional().nullable(),
  }),
]);

const supplierInputSchema = z.object({
  name: z.string().trim().min(1, 'Numele furnizorului este obligatoriu').max(200, 'Numele furnizorului trebuie să aibă maxim 200 caractere'),
  phones: z.array(supplierPhoneSchema).min(1, 'Cel puțin un număr de telefon este obligatoriu').max(5, 'Maxim 5 numere de telefon').optional(),
  address: z.string().trim().max(500, 'Adresa trebuie să aibă maxim 500 caractere').optional().nullable(),
  website: z.string().trim().max(500, 'Website prea lung').optional().nullable(),
  codFiscal: z.string().trim().max(32, 'Cod fiscal prea lung').optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export type NormalizedSupplierInput = {
  name: string;
  phones: SupplierPhoneEntry[];
  address: string | null;
  website: string | null;
  codFiscal: string | null;
  notes: string | null;
};

export type NormalizedSupplierPatchInput = Partial<NormalizedSupplierInput>;

export function normalizeSupplierInput(raw: unknown, options: { partial?: boolean } = {}): NormalizedSupplierInput {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const payload = { ...source };

  const parsed = options.partial
    ? supplierInputSchema.partial({ name: true, phones: true }).safeParse(payload)
    : supplierInputSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Date furnizor invalide');
  }

  const value = parsed.data;

  const normalizedPhones = normalizeSupplierPhones(value.phones);

  if (!options.partial && normalizedPhones.length < 1) {
    throw new Error('Cel puțin un număr de telefon este obligatoriu');
  }

  const websiteValue = optionalTrimmedString(value.website);
  const codFiscalValue = optionalTrimmedString(value.codFiscal);

  return {
    name: optionalTrimmedString(value.name) ?? '',
    phones: normalizedPhones,
    address: optionalTrimmedString(value.address),
    website: websiteValue ? normalizeWebsite(websiteValue) : null,
    codFiscal: codFiscalValue ? normalizeCodFiscal(codFiscalValue) : null,
    notes: optionalTrimmedString(value.notes),
  };
}

export function normalizeSupplierPatchInput(raw: unknown): NormalizedSupplierPatchInput {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const payload = { ...source };

  const parsed = supplierInputSchema.partial().safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Date furnizor invalide');
  }

  const value = parsed.data;
  const next: NormalizedSupplierPatchInput = {};

  if ('name' in value) next.name = optionalTrimmedString(value.name) ?? '';
  if ('phones' in value && value.phones !== undefined) {
    const normalized = normalizeSupplierPhones(value.phones);
    if (normalized.length < 1) {
      throw new Error('Cel puțin un număr de telefon este obligatoriu');
    }
    if (normalized.length > 5) {
      throw new Error('Maxim 5 numere de telefon');
    }
    next.phones = normalized;
  }
  if ('address' in value) next.address = optionalTrimmedString(value.address);
  if ('website' in value) {
    const websiteValue = optionalTrimmedString(value.website);
    next.website = websiteValue ? normalizeWebsite(websiteValue) : null;
  }
  if ('codFiscal' in value) {
    const codFiscalValue = optionalTrimmedString(value.codFiscal);
    next.codFiscal = codFiscalValue ? normalizeCodFiscal(codFiscalValue) : null;
  }
  if ('notes' in value) next.notes = optionalTrimmedString(value.notes);

  return next;
}
