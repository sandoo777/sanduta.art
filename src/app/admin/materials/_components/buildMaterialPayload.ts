import type { MaterialFormData } from '@/lib/validations/admin';
import type { MaterialPriceBreak } from '@/modules/materials/types';

function toFiniteNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildMaterialPriceBreaksPayload(values: MaterialFormData): MaterialPriceBreak[] {
  const salePrice = toFiniteNumber(values.salePrice);
  const purchasePrice = toFiniteNumber(values.purchasePrice);
  const basePrice = salePrice !== null
    ? salePrice
    : purchasePrice !== null
      ? purchasePrice
      : null;

  return (values.priceBreaks ?? [])
    .map((row) => {
      const qtyMin = toFiniteNumber(row.qtyMin);
      // Empty qtyMax means the tier is open-ended (unlimited, e.g. "5000+").
      const qtyMax = toFiniteNumber(row.qtyMax);
      const discount = toFiniteNumber(row.discount);
      const effectiveDiscount = discount ?? 0;
      const computedPrice = basePrice !== null
        ? Number((basePrice - (basePrice * effectiveDiscount) / 100).toFixed(2))
        : toFiniteNumber(row.price);

      return {
        qtyMin: qtyMin ?? Number.NaN,
        qtyMax,
        price: computedPrice,
        discount,
      };
    })
    .filter((row) => Number.isFinite(row.qtyMin)
      && Number.isFinite(row.price)
      && row.qtyMin >= 0
      && (row.qtyMax === null || row.qtyMax >= row.qtyMin)
      && (row.price ?? 0) >= 0);
}
