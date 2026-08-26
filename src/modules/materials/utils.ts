export function calcConsumed(requiredQty: number, wastePercent: number): number {
  if (wastePercent >= 100) throw new Error('invalid waste percent');
  return requiredQty / (1 - wastePercent / 100);
}
export function calcLinePrice(unitPrice: number, requiredQty: number, wastePercent: number): number {
  const consumed = calcConsumed(requiredQty, wastePercent);
  return unitPrice * consumed;
}
