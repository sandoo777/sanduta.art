import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validare pentru crearea unei note
const createNoteSchema = z.object({
  content: z.string().min(1, "Conținutul este obligatoriu"),
});

/**
 * POST /api/admin/customers/[id]/notes
 * Adaugă o notă la un customer
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
    const validationResult = createNoteSchema.safeParse(body);
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

    const note = await prisma.customerNote.create({
      data: {
        customerId: id,
        content: validationResult.data.content,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (_error) {
    console.error("Error creating customer note:", error);
    return NextResponse.json(
      { error: "Eroare la adăugarea notei" },
      { status: 500 }
    );
  }
}
