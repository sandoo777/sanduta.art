import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createMaterial, MaterialApiValidationError } from '@/modules/materials/server';

const hasDatabaseCredentials = Boolean(
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.SHADOW_DATABASE_URL
);

const describeDB = hasDatabaseCredentials ? describe : describe.skip;

let categoryId = '';
const categoryName = `unit-validation-${Date.now()}`;

describeDB('materials server - category based unit validation', () => {
  beforeAll(async () => {
    const created = await prisma.materialCategory.create({
      data: {
        name: categoryName,
        requiresPricePerSqm: true,
        requiresPricePerMeter: false,
        requiresPricePerUnit: false,
        active: true,
      },
      select: { id: true },
    });

    categoryId = created.id;
  });

  afterAll(async () => {
    await prisma.material.deleteMany({ where: { name: { startsWith: 'TMP-UNIT-VALIDATION-' } } });
    if (categoryId) {
      await prisma.materialCategory.delete({ where: { id: categoryId } }).catch(() => undefined);
    }
  });

  it('rejects incompatible unit for category flags', async () => {
    await expect(
      createMaterial({
        name: 'TMP-UNIT-VALIDATION-INVALID',
        categoryId,
        consumptionType: 'AREA_BASED',
        unit: 'kg',
        purchasePrice: 10,
        salePrice: 12,
        stock: 1,
        minStock: 0,
      })
    ).rejects.toBeInstanceOf(MaterialApiValidationError);
  });

  it('accepts compatible unit for category flags', async () => {
    const material = await createMaterial({
      name: 'TMP-UNIT-VALIDATION-VALID',
      categoryId,
      consumptionType: 'AREA_BASED',
      unit: 'm2',
      purchasePrice: 10,
      salePrice: 12,
      stock: 1,
      minStock: 0,
    });

    expect(material.unit).toBe('m2');
  });
});
