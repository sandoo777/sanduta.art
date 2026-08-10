import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

type ProductVariantInput = {
  name: string;
  price: number;
  stock: number;
};

function parseNonNegative(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

/**
 * GET /api/admin/products
 * List all products with relations
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        defaultPrintMethod: {
          select: {
            id: true,
            name: true,
            isOutsourced: true,
            costFurnizorPerM2: true,
            costFurnizorPerUnit: true,
            markup: true,
          },
        },
        images: true,
        variants: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: [
        { active: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create a new product
 * 
 * Body:
 * {
 *   name: string,
 *   slug: string,
 *   description?: string,
 *   price: number,
 *   categoryId: string,
 *   images?: string[],
 *   variants?: [{ name: string, price: number, stock: number }]
 * }
 */
export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await _req.json();
    const {
      name,
      slug,
      description,
      price,
      categoryId,
      images,
      variants,
      saleUnit,
      pricePerM2,
      pricePerUnit,
      printMethodId,
      materialId,
    } = body;

    // Validations
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: "Price must be non-negative" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (saleUnit && saleUnit !== 'M2' && saleUnit !== 'UNIT') {
      return NextResponse.json(
        { error: 'saleUnit trebuie să fie M2 sau UNIT' },
        { status: 400 }
      );
    }

    if (pricePerM2 !== undefined && Number(pricePerM2) < 0) {
      return NextResponse.json(
        { error: 'pricePerM2 trebuie să fie >= 0' },
        { status: 400 }
      );
    }

    if (pricePerUnit !== undefined && Number(pricePerUnit) < 0) {
      return NextResponse.json(
        { error: 'pricePerUnit trebuie să fie >= 0' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    let selectedPrintMethod: {
      isOutsourced: boolean;
      costFurnizorPerM2: number | null;
      costFurnizorPerUnit: number | null;
      markup: number | null;
    } | null = null;

    if (printMethodId) {
      const method = await prisma.printMethod.findUnique({
        where: { id: printMethodId },
        select: {
          id: true,
          active: true,
          isOutsourced: true,
          costFurnizorPerM2: true,
          costFurnizorPerUnit: true,
          markup: true,
        },
      });

      if (!method || !method.active) {
        return NextResponse.json(
          { error: 'Metoda de print selectată nu există sau este inactivă' },
          { status: 400 }
        );
      }

      selectedPrintMethod = {
        isOutsourced: method.isOutsourced,
        costFurnizorPerM2: method.costFurnizorPerM2 ? Number(method.costFurnizorPerM2) : null,
        costFurnizorPerUnit: method.costFurnizorPerUnit ? Number(method.costFurnizorPerUnit) : null,
        markup: method.markup ? Number(method.markup) : null,
      };
    }

    const effectiveSaleUnit = saleUnit ?? 'UNIT';
    const isOutsourced = selectedPrintMethod?.isOutsourced ?? false;
    const parsedPricePerM2 = parseNonNegative(pricePerM2);
    const parsedPricePerUnit = parseNonNegative(pricePerUnit);

    if (!isOutsourced && effectiveSaleUnit === 'M2' && parsedPricePerM2 === null) {
      return NextResponse.json(
        { error: 'Pentru produse la m², pricePerM2 este obligatoriu' },
        { status: 400 }
      );
    }

    if (!isOutsourced && effectiveSaleUnit === 'UNIT' && parsedPricePerUnit === null) {
      return NextResponse.json(
        { error: 'Pentru produse la bucată, pricePerUnit este obligatoriu' },
        { status: 400 }
      );
    }

    if (!isOutsourced && !materialId) {
      return NextResponse.json(
        { error: 'Pentru metode interne, materialul implicit este obligatoriu' },
        { status: 400 }
      );
    }

    let finalPrice = Number(price ?? 0);
    if (isOutsourced) {
      const supplierCostBase = effectiveSaleUnit === 'M2'
        ? Number(selectedPrintMethod?.costFurnizorPerM2 ?? NaN)
        : Number(selectedPrintMethod?.costFurnizorPerUnit ?? NaN);
      const markupPercent = Number(selectedPrintMethod?.markup ?? NaN);

      if (!Number.isFinite(supplierCostBase) || supplierCostBase < 0) {
        return NextResponse.json(
          { error: 'supplierCost este obligatoriu și trebuie să fie >= 0 pentru outsource' },
          { status: 400 }
        );
      }

      if (!Number.isFinite(markupPercent) || markupPercent < 0) {
        return NextResponse.json(
          { error: 'markup este obligatoriu și trebuie să fie >= 0 pentru outsource' },
          { status: 400 }
        );
      }

      finalPrice = supplierCostBase + (supplierCostBase * markupPercent) / 100;
    } else {
      finalPrice = effectiveSaleUnit === 'M2' ? Number(parsedPricePerM2) : Number(parsedPricePerUnit);
    }

    // Create product with relations
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: finalPrice,
        saleUnit: effectiveSaleUnit,
        pricePerM2: isOutsourced ? null : (parsedPricePerM2 ?? null),
        pricePerUnit: isOutsourced ? null : (parsedPricePerUnit ?? null),
        printMethodId: printMethodId ?? null,
        materialId: isOutsourced ? null : (materialId ?? null),
        isOutsourced,
        categoryId,
      },
      include: {
        category: true,
        defaultPrintMethod: true,
        images: true,
        variants: true,
      },
    });

    // Add images if provided
    if (images && images.length > 0) {
      await Promise.all(
        images.map((url: string) =>
          prisma.productImage.create({
            data: { productId: product.id, url },
          })
        )
      );
    }

    // Add variants if provided
    if (variants && variants.length > 0) {
      await Promise.all(
        variants.map((v: ProductVariantInput) =>
          prisma.productVariant.create({
            data: {
              productId: product.id,
              name: v.name,
              price: v.price,
              stock: v.stock,
            },
          })
        )
      );
    }

    // Fetch complete product with all relations
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        defaultPrintMethod: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(completeProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
