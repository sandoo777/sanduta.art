import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createMaterial, updateMaterial } from '@/modules/materials/server';

const hasDatabaseCredentials = Boolean(
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.SHADOW_DATABASE_URL
);

const describeDB = hasDatabaseCredentials ? describe : describe.skip;

let categoryId = '';
const categoryName = `material-type-validation-${Date.now()}`;

describeDB('materials server - material type validation', () => {
  beforeAll(async () => {
    const created = await prisma.materialCategory.create({
      data: {
        name: categoryName,
        requiresPricePerSqm: true,
        requiresPricePerMeter: true,
        requiresPricePerUnit: true,
        active: true,
      },
      select: { id: true },
    });

    categoryId = created.id;
  });

  afterAll(async () => {
    await prisma.material.deleteMany({ where: { name: { startsWith: 'TMP-MATERIAL-TYPE-' } } });
    if (categoryId) {
      await prisma.materialCategory.delete({ where: { id: categoryId } }).catch(() => undefined);
    }
  });

  it('accepts support foil material type and stores dimensions and template flag', async () => {
    const material = await createMaterial({
      name: 'TMP-MATERIAL-TYPE-FOI',
      categoryId,
      materialType: 'SUPORT_FOI',
      width_mm: 210,
      height_mm: 297,
      unit: 'sheet',
      purchasePrice: 12,
      salePrice: 15,
      stock: 10,
      minStock: 0,
      isTemplate: true,
    });

    expect(material.materialType).toBe('SUPORT_FOI');
    expect(material.width_mm).toBe(210);
    expect(material.height_mm).toBe(297);
    expect(material.isTemplate).toBe(true);
  });

  it('accepts support roll material type with m2 unit', async () => {
    const material = await createMaterial({
      name: 'TMP-MATERIAL-TYPE-ROLE',
      categoryId,
      materialType: 'SUPORT_ROLA',
      width_mm: 420,
      unit: 'm2',
      purchasePrice: 20,
      salePrice: 25,
      stock: 20,
      minStock: 0,
    });

    expect(material.materialType).toBe('SUPORT_ROLA');
    expect(material.unit).toBe('m2');
    expect(material.width_mm).toBe(420);
  });

  it('accepts square meter support type', async () => {
    const material = await createMaterial({
      name: 'TMP-MATERIAL-TYPE-M2',
      categoryId,
      materialType: 'SUPORT_M2',
      unit: 'm2',
      purchasePrice: 17,
      salePrice: 21,
      stock: 18,
      minStock: 0,
      consumptionRate: 0.85,
    });

    expect(material.materialType).toBe('SUPORT_M2');
    expect(material.consumptionRate).toBe(0.85);
  });

  it('accepts ink material type with ml unit', async () => {
    const material = await createMaterial({
      name: 'TMP-MATERIAL-TYPE-CERNEALA',
      categoryId,
      materialType: 'CERNEALA',
      unit: 'ml',
      consumptionRate: 5,
      purchasePrice: 14,
      salePrice: 17,
      stock: 250,
      minStock: 25,
    });

    expect(material.materialType).toBe('CERNEALA');
    expect(material.consumptionRate).toBe(5);
    expect(material.unit).toBe('ml');
  });

  it('accepts consumable material type', async () => {
    const material = await createMaterial({
      name: 'TMP-MATERIAL-TYPE-CONSUMABIL',
      categoryId,
      materialType: 'CONSUMABIL',
      unit: 'pcs',
      purchasePrice: 9,
      salePrice: 11,
      stock: 40,
      minStock: 5,
    });

    expect(material.materialType).toBe('CONSUMABIL');
    expect(material.unit).toBe('pcs');
  });

  it('replaces technical properties instead of merging old values on update', async () => {
    const created = await createMaterial({
      name: 'TMP-MATERIAL-TYPE-PROPS',
      categoryId,
      unit: 'pcs',
      purchasePrice: 9,
      salePrice: 11,
      stock: 10,
      minStock: 1,
      properties: {
        color: 'alb',
        whiteness: 92,
      },
    });

    const updated = await updateMaterial(created.id, {
      properties: {
        color: 'galben',
      },
    });

    expect(updated.properties).toEqual({ color: 'galben' });
    expect(updated.properties).not.toHaveProperty('whiteness');
  });

  it('rejects invalid FOI payload missing dimensions', async () => {
    await expect(
      createMaterial({
        name: 'TMP-MATERIAL-TYPE-INVALID-FOI',
        categoryId,
        materialType: 'SUPORT_FOI',
        unit: 'mm',
        purchasePrice: 10,
        salePrice: 12,
        stock: 4,
        minStock: 0,
      })
    ).rejects.toMatchObject({ errors: [{ field: 'width_mm' }] });
  });

  it('rejects invalid CERNEALA payload with missing consumption rate', async () => {
    await expect(
      createMaterial({
        name: 'TMP-MATERIAL-TYPE-INVALID-CERNEALA',
        categoryId,
        materialType: 'CERNEALA',
        unit: 'mL',
        purchasePrice: 10,
        salePrice: 12,
        stock: 100,
        minStock: 0,
      })
    ).rejects.toMatchObject({ errors: [{ field: 'consumptionRate' }] });
  });
});
