/**
 * Material consumption calculation for production jobs.
 * Used when a production job transitions to COMPLETED status.
 */

import { MaterialUnit } from "@prisma/client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface MaterialForConsumption {
  id: string;
  name: string;
  active: boolean;
  consumptionType: "AREA_BASED" | "DIRECT";
  unit: string; // MaterialUnit value (liter, ml, gram, kg, unit, m2, meter, pcs)
  wastePercent: number;
  pricePerSqm: number | null;
  pricePerMeter: number | null;
  pricePerUnit: number | null;
  stock: number;
}

export interface JobForConsumption {
  id: string;
  quantity: number | null;
}

export interface MaterialConsumptionResult {
  usageUnit: MaterialUnit;
  quantity: number;
  wastePercent: number;
  totalUsed: number;
  unitPrice: number;
  totalCost: number;
}

// ── Error ────────────────────────────────────────────────────────────────────

export class MaterialConsumptionError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "MaterialConsumptionError";
    this.status = status;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determines the billing/measurement unit for a material based on its consumption type.
 * For DIRECT: uses the material's unit field directly.
 * For AREA_BASED: resolves based on available price fields.
 */
function resolveUsageUnit(material: MaterialForConsumption): MaterialUnit {
  if (material.consumptionType === "DIRECT") {
    const unitValue = material.unit as MaterialUnit;
    if (Object.values(MaterialUnit).includes(unitValue)) {
      return unitValue;
    }
    return MaterialUnit.unit;
  }

  // AREA_BASED: resolve by price fields
  if (material.pricePerSqm != null) return MaterialUnit.m2;
  if (material.pricePerMeter != null) return MaterialUnit.meter;
  return MaterialUnit.unit;
}

/**
 * Resolves the unit price for a material given its resolved usage unit.
 */
function resolveUnitPrice(material: MaterialForConsumption, usageUnit: MaterialUnit): number {
  if (material.consumptionType === "DIRECT") {
    if (material.pricePerUnit == null) {
      throw new MaterialConsumptionError(
        `Materialul "${material.name}" nu are prețul per unitate setat`,
        400
      );
    }
    return material.pricePerUnit;
  }

  if (usageUnit === MaterialUnit.m2) {
    if (material.pricePerSqm == null) {
      throw new MaterialConsumptionError(
        `Materialul "${material.name}" nu are prețul per m² setat`,
        400
      );
    }
    return material.pricePerSqm;
  }

  if (usageUnit === MaterialUnit.meter) {
    if (material.pricePerMeter == null) {
      throw new MaterialConsumptionError(
        `Materialul "${material.name}" nu are prețul per metru liniar setat`,
        400
      );
    }
    return material.pricePerMeter;
  }

  // unit / pcs and other unit types
  if (material.pricePerUnit == null) {
    throw new MaterialConsumptionError(
      `Materialul "${material.name}" nu are prețul per unitate setat`,
      400
    );
  }
  return material.pricePerUnit;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculates the material consumption for a production job.
 * Does NOT write anything to the database — call site is responsible for
 * creating the MaterialUsage record inside a transaction.
 *
 * @throws MaterialConsumptionError with an appropriate HTTP status code
 */
export function calculateMaterialUsage(
  job: JobForConsumption,
  material: MaterialForConsumption
): MaterialConsumptionResult {
  if (!material.active) {
    throw new MaterialConsumptionError(
      `Materialul "${material.name}" este inactiv`,
      409
    );
  }

  const baseQuantity = job.quantity != null ? Number(job.quantity) : null;
  if (!baseQuantity || baseQuantity <= 0) {
    throw new MaterialConsumptionError(
      "Jobul trebuie să aibă o cantitate specificată (suprafață / metri / bucăți) pentru calculul consumului",
      400
    );
  }

  const usageUnit = resolveUsageUnit(material);
  const unitPrice = resolveUnitPrice(material, usageUnit);

  const wastePercent = material.wastePercent ?? 0;
  const totalUsed = baseQuantity * (1 + wastePercent / 100);
  const totalCost = totalUsed * unitPrice;

  return {
    usageUnit,
    quantity: baseQuantity,
    wastePercent,
    totalUsed,
    unitPrice,
    totalCost,
  };
}
