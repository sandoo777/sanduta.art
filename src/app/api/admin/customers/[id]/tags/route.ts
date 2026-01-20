import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validare pentru crearea unui tag
const createTagSchema = z.object({
  label: z.string().min(1, "Label-ul este obligatoriu"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Culoare invalidă").optional(),
});

/**
 * POST /api/admin/customers/[id]/tags
 * Adaugă un tag la un customer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Acces interzis" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validare
    const validationResult = createTagSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Date invalide", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Verifică dacă customerul există
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Clientul nu a fost găsit" },
        { status: 404 }
      );
    }

    const tag = await prisma.customerTag.create({
      data: {
        customerId: id,
        label: validationResult.data.label,
        color: validationResult.data.color || "#3B82F6",
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (_error) {
    console.error("Error creating customer tag:", error);
    return NextResponse.json(
      { error: "Eroare la adăugarea tag-ului" },
      { status: 500 }
    );
  }
}
