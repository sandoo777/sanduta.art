/** Tipuri de proprietăți disponibile */
export type PropertyType = 'number' | 'text' | 'select' | 'boolean';

export interface PropertyTemplate {
  key: string;
  label: string;
  type: PropertyType;
  unit?: string;
  options?: string[];
  placeholder?: string;
  hint?: string;
}

export type MaterialUnit = 'm2' | 'meter' | 'sheet' | 'kg' | 'gram' | 'liter' | 'ml' | 'pcs';

/** Templates de proprietăți per unitate de măsură */
export const PROPERTY_TEMPLATES: Record<MaterialUnit, PropertyTemplate[]> = {
  // ── Suport imprimare pe arie ─────────────────────────────────────────
  m2: [
    { key: 'width',         label: 'Lățime',                type: 'number', unit: 'cm',    placeholder: '137',  hint: 'Lățimea rolei/panoului' },
    { key: 'rollLength',    label: 'Lungime rolă',          type: 'number', unit: 'm',     placeholder: '50',   hint: 'Metri per rolă' },
    { key: 'opacity',       label: 'Opacitate',             type: 'select', options: ['opac', 'semi-transparent', 'transparent'] },
    { key: 'adhesive',      label: 'Adeziv',                type: 'select', options: ['fără adeziv', 'permanent', 'repositionabil', 'amovibil'] },
    { key: 'uvResistance',  label: 'Rezistență UV',         type: 'number', unit: 'ani',   placeholder: '3' },
    { key: 'tempMin',       label: 'Temperatură minimă',    type: 'number', unit: '°C',    placeholder: '-20' },
    { key: 'tempMax',       label: 'Temperatură maximă',    type: 'number', unit: '°C',    placeholder: '80' },
    { key: 'color',         label: 'Culoare suport',        type: 'select', options: ['alb', 'transparent', 'negru', 'argintiu', 'auriu', 'alt'] },
    { key: 'substrate',     label: 'Substrat',              type: 'select', options: ['PVC', 'PET', 'PP', 'PE', 'hârtie', 'textil', 'poliester', 'alt'] },
  ],

  // ── Materiale pe metru liniar (rol) ─────────────────────────────────
  meter: [
    { key: 'width',         label: 'Lățime',                type: 'number', unit: 'cm',    placeholder: '137',  hint: 'Lățimea rolei' },
    { key: 'rollLength',    label: 'Lungime rolă',          type: 'number', unit: 'm',     placeholder: '50' },
    { key: 'opacity',       label: 'Opacitate',             type: 'select', options: ['opac', 'semi-transparent', 'transparent'] },
    { key: 'adhesive',      label: 'Adeziv',                type: 'select', options: ['fără adeziv', 'permanent', 'repositionabil', 'amovibil'] },
    { key: 'uvResistance',  label: 'Rezistență UV',         type: 'number', unit: 'ani',   placeholder: '3' },
    { key: 'color',         label: 'Culoare suport',        type: 'select', options: ['alb', 'transparent', 'negru', 'argintiu', 'auriu', 'alt'] },
    { key: 'substrate',     label: 'Substrat',              type: 'select', options: ['PVC', 'PET', 'PP', 'PE', 'hârtie', 'textil', 'poliester', 'alt'] },
    { key: 'tempMin',       label: 'Temperatură minimă',    type: 'number', unit: '°C' },
    { key: 'tempMax',       label: 'Temperatură maximă',    type: 'number', unit: '°C' },
  ],

  // ── Hârtie / carton pe coală ─────────────────────────────────────────
  sheet: [
    { key: 'sheetWidth',    label: 'Lățime coală',          type: 'number', unit: 'mm',    placeholder: '297', hint: 'ex: A4=210, A3=297' },
    { key: 'sheetHeight',   label: 'Înălțime coală',        type: 'number', unit: 'mm',    placeholder: '420' },
    { key: 'grammage',      label: 'Gramaj',                type: 'number', unit: 'g/m²',  placeholder: '250', hint: 'Greutate per metru pătrat' },
    { key: 'sheetsPerPack', label: 'Foi per top/cutie',     type: 'number',                placeholder: '500' },
    { key: 'brightness',    label: 'Albeață',               type: 'number', unit: '%',     placeholder: '104' },
    { key: 'color',         label: 'Culoare',               type: 'select', options: ['alb', 'crem/ivory', 'galben', 'verde', 'albastru', 'roșu', 'negru', 'kraft/natural', 'alt'] },
    { key: 'coating',       label: 'Acoperire',             type: 'select', options: ['neacoperit', 'gloss', 'mat', 'satin', 'silk', 'UV'] },
    { key: 'recycled',      label: 'Conținut reciclat',     type: 'number', unit: '%',     placeholder: '0' },
  ],

  // ── Cerneală / pulbere (per kg) ─────────────────────────────────────
  kg: [
    { key: 'inkType',       label: 'Tip cerneală/material', type: 'select', options: ['eco-solvent', 'solvent', 'UV', 'UV-LED', 'DTF', 'DTG', 'sublimation', 'latex', 'aqua', 'pigment', 'dye', 'toner', 'pudră DTF', 'alt'] },
    { key: 'color',         label: 'Culoare',               type: 'select', options: ['Cyan', 'Magenta', 'Yellow', 'Black', 'White', 'Light Cyan', 'Light Magenta', 'Orange', 'Green', 'Violet', 'Clear/Varnish', 'Alt'] },
    { key: 'density',       label: 'Densitate',             type: 'number', unit: 'g/mL',  placeholder: '1.05' },
    { key: 'viscosity',     label: 'Vâscozitate',           type: 'number', unit: 'cPs' },
    { key: 'tempMin',       label: 'Temperatură minimă utilizare', type: 'number', unit: '°C', placeholder: '15' },
    { key: 'tempMax',       label: 'Temperatură maximă utilizare', type: 'number', unit: '°C', placeholder: '35' },
  ],

  // ── Cerneală / chimie (per gram) ────────────────────────────────────
  gram: [
    { key: 'inkType',       label: 'Tip cerneală/material', type: 'select', options: ['eco-solvent', 'UV', 'DTF', 'sublimation', 'latex', 'aqua', 'pigment', 'toner', 'pudră DTF', 'alt'] },
    { key: 'color',         label: 'Culoare',               type: 'select', options: ['Cyan', 'Magenta', 'Yellow', 'Black', 'White', 'Light Cyan', 'Light Magenta', 'Clear/Varnish', 'Alt'] },
    { key: 'density',       label: 'Densitate',             type: 'number', unit: 'g/mL' },
  ],

  // ── Chimie lichidă (per litru) ─────────────────────────────────────
  liter: [
    { key: 'chemType',      label: 'Tip chimie',            type: 'select', options: ['pretreat/primer', 'cleaner/solvent', 'coating/lac', 'developer', 'fixer', 'activator', 'solvent wash', 'alt'] },
    { key: 'concentration', label: 'Concentrație',          type: 'number', unit: '%',    placeholder: '100' },
    { key: 'density',       label: 'Densitate',             type: 'number', unit: 'g/mL', placeholder: '0.85' },
    { key: 'dilutionRatio', label: 'Diluție (X:1 apă)',     type: 'number',               placeholder: '0' },
    { key: 'tempMin',       label: 'Temperatură min depozitare', type: 'number', unit: '°C', placeholder: '5' },
    { key: 'tempMax',       label: 'Temperatură max depozitare', type: 'number', unit: '°C', placeholder: '30' },
  ],

  // ── Chimie lichidă (per mL) ──────────────────────────────────────────
  ml: [
    { key: 'chemType',      label: 'Tip chimie',            type: 'select', options: ['pretreat/primer', 'cleaner/solvent', 'coating/lac', 'activator', 'alt'] },
    { key: 'concentration', label: 'Concentrație',          type: 'number', unit: '%' },
    { key: 'density',       label: 'Densitate',             type: 'number', unit: 'g/mL' },
  ],

  // ── Consumabile / plăci / piese (per bucată) ────────────────────────
  pcs: [
    { key: 'width',         label: 'Lățime',                type: 'number', unit: 'mm',    placeholder: '1220' },
    { key: 'height',        label: 'Înălțime / Lungime',    type: 'number', unit: 'mm',    placeholder: '2440' },
    { key: 'material',      label: 'Compoziție',            type: 'select', options: ['PVC expandat', 'PVC compact', 'aluminiu', 'dibond', 'forex', 'plexiglas', 'carton', 'lemn MDF', 'sticlă', 'alt'] },
    { key: 'color',         label: 'Culoare',               type: 'text',                  placeholder: 'alb' },
    { key: 'loadCapacity',  label: 'Capacitate (pt. echipamente)', type: 'number', unit: 'ml' },
    { key: 'compatible',    label: 'Compatibil cu',         type: 'text',                  placeholder: 'ex: Roland DG, Mimaki' },
  ],
};

/** Returnează template-ul pentru o unitate dată */
export function getTemplateForUnit(unit: MaterialUnit): PropertyTemplate[] {
  return PROPERTY_TEMPLATES[unit] ?? [];
}

/** Proprietăți "de bază" recomandate per unitate — se adaugă automat la primul select */
export const DEFAULT_ACTIVE_KEYS: Partial<Record<MaterialUnit, string[]>> = {
  m2:     ['width', 'opacity', 'adhesive'],
  meter:  ['width', 'rollLength', 'adhesive'],
  sheet:  ['sheetWidth', 'sheetHeight', 'grammage', 'sheetsPerPack'],
  kg:     ['inkType', 'color'],
  gram:   ['inkType', 'color'],
  liter:  ['chemType', 'concentration'],
  ml:     ['chemType'],
  pcs:    ['width', 'height', 'material'],
};
