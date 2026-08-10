/**
 * Unit tests for calculateMaterialUsage helper.
 * These tests do NOT require a database connection.
 */
import { describe, it, expect } from "vitest";
import { MaterialUnit } from "@prisma/client";
import {
  calculateMaterialUsage,
  MaterialConsumptionError,
  type MaterialForConsumption,
  type JobForConsumption,
} from "@/modules/materials/materialConsumption";

function makeMaterial(overrides: Partial<MaterialForConsumption> = {}): MaterialForConsumption {
  return {
    id: "mat-test",
    name: "Test Material",
    active: true,
    consumptionType: "AREA_BASED",
    unit: "m2",
    wastePercent: 0,
    pricePerSqm: 10,
    pricePerMeter: null,
    pricePerUnit: null,
    stock: 100,
    ...overrides,
  };
}

function makeJob(overrides: Partial<JobForConsumption> = {}): JobForConsumption {
  return {
    id: "job-test",
    quantity: 2,
    ...overrides,
  };
}

describe("calculateMaterialUsage — unit resolution", () => {
  it("AREA_BASED with pricePerSqm uses m2", () => {
    const result = calculateMaterialUsage(makeJob({ quantity: 3 }), makeMaterial({ pricePerSqm: 12 }));
    expect(result.usageUnit).toBe(MaterialUnit.m2);
    expect(result.unitPrice).toBe(12);
  });

  it("AREA_BASED with pricePerMeter uses meter", () => {
    const result = calculateMaterialUsage(
      makeJob({ quantity: 5 }),
      makeMaterial({ pricePerSqm: null, pricePerMeter: 7 })
    );
    expect(result.usageUnit).toBe(MaterialUnit.meter);
    expect(result.unitPrice).toBe(7);
  });

  it("AREA_BASED without sqm/meter falls back to unit", () => {
    const result = calculateMaterialUsage(
      makeJob({ quantity: 10 }),
      makeMaterial({ pricePerSqm: null, pricePerMeter: null, pricePerUnit: 2 })
    );
    expect(result.usageUnit).toBe(MaterialUnit.unit);
    expect(result.unitPrice).toBe(2);
  });

  it("DIRECT uses material.unit when valid", () => {
    const result = calculateMaterialUsage(
      makeJob({ quantity: 4 }),
      makeMaterial({ consumptionType: "DIRECT", unit: "ml", pricePerUnit: 0.5, pricePerSqm: null })
    );
    expect(result.usageUnit).toBe(MaterialUnit.ml);
    expect(result.unitPrice).toBe(0.5);
  });
});

describe("calculateMaterialUsage — waste and cost", () => {
  it("applies waste percent to totalUsed", () => {
    const result = calculateMaterialUsage(makeJob({ quantity: 10 }), makeMaterial({ wastePercent: 10 }));
    expect(result.totalUsed).toBeCloseTo(11, 5);
  });

  it("computes totalCost = totalUsed * unitPrice", () => {
    const result = calculateMaterialUsage(makeJob({ quantity: 5 }), makeMaterial({ pricePerSqm: 20, wastePercent: 0 }));
    expect(result.totalCost).toBeCloseTo(100, 5);
  });
});

describe("calculateMaterialUsage — color mode factor for ink", () => {
  it("CMYK_WHITE applies 1.3 factor on ink-like DIRECT material", () => {
    const result = calculateMaterialUsage(
      makeJob({ quantity: 10, colorMode: "CMYK_WHITE" }),
      makeMaterial({
        name: "Cerneala UV White",
        consumptionType: "DIRECT",
        unit: "ml",
        pricePerSqm: null,
        pricePerUnit: 1,
      })
    );

    expect(result.colorModeFactor).toBeCloseTo(1.3, 5);
    expect(result.totalUsed).toBeCloseTo(13, 5);
  });

  it("MONO applies 0.5 factor on ink-like DIRECT material", () => {
    const result = calculateMaterialUsage(
      makeJob({ quantity: 10, colorMode: "MONO" }),
      makeMaterial({
        name: "Ink Black",
        consumptionType: "DIRECT",
        unit: "ml",
        pricePerSqm: null,
        pricePerUnit: 2,
      })
    );

    expect(result.colorModeFactor).toBeCloseTo(0.5, 5);
    expect(result.totalUsed).toBeCloseTo(5, 5);
    expect(result.totalCost).toBeCloseTo(10, 5);
  });

  it("SPOT with 3 channels applies factor 3.0", () => {
    const result = calculateMaterialUsage(
      makeJob({ quantity: 4, colorMode: "SPOT", colorChannels: 3 }),
      makeMaterial({
        name: "Spot Ink",
        consumptionType: "DIRECT",
        unit: "ml",
        pricePerSqm: null,
        pricePerUnit: 1,
      })
    );

    expect(result.colorModeFactor).toBeCloseTo(3, 5);
    expect(result.totalUsed).toBeCloseTo(12, 5);
  });

  it("non-ink material keeps factor 1 even if colorMode is set", () => {
    const result = calculateMaterialUsage(
      makeJob({ quantity: 10, colorMode: "CMYK_WHITE_VARNISH" }),
      makeMaterial({
        name: "PVC Banner",
        consumptionType: "AREA_BASED",
        unit: "m2",
        pricePerSqm: 5,
      })
    );

    expect(result.colorModeFactor).toBe(1);
    expect(result.totalUsed).toBeCloseTo(10, 5);
  });
});

describe("calculateMaterialUsage — errors", () => {
  it("throws 409 for inactive material", () => {
    expect(() => calculateMaterialUsage(makeJob(), makeMaterial({ active: false }))).toThrow(MaterialConsumptionError);
  });

  it("throws 400 for invalid quantity", () => {
    expect(() => calculateMaterialUsage(makeJob({ quantity: null }), makeMaterial())).toThrow(MaterialConsumptionError);
    expect(() => calculateMaterialUsage(makeJob({ quantity: 0 }), makeMaterial())).toThrow(MaterialConsumptionError);
    expect(() => calculateMaterialUsage(makeJob({ quantity: -1 }), makeMaterial())).toThrow(MaterialConsumptionError);
  });

  it("throws 400 when AREA_BASED has no valid price fields", () => {
    expect(() =>
      calculateMaterialUsage(
        makeJob({ quantity: 2 }),
        makeMaterial({ pricePerSqm: null, pricePerMeter: null, pricePerUnit: null })
      )
    ).toThrow(MaterialConsumptionError);
  });

  it("throws 400 when DIRECT has no pricePerUnit", () => {
    expect(() =>
      calculateMaterialUsage(
        makeJob({ quantity: 2 }),
        makeMaterial({ consumptionType: "DIRECT", unit: "ml", pricePerSqm: null, pricePerUnit: null })
      )
    ).toThrow(MaterialConsumptionError);
  });
});
