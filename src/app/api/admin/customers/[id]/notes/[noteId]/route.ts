import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/admin/customers/[id]/notes/[noteId]
 * Șterge o notă de la un customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Acces interzis" },
        { status: 403 }
      );
    }

    const { id, noteId } = await params;

    // Verifică dacă nota există și aparține customerului corect
    const note = await prisma.customerNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Nota nu a fost găsită" },
        { status: 404 }
      );
    }

    if (note.customerId !== id) {
      return NextResponse.json(
        { error: "Nota nu aparține acestui client" },
        { status: 400 }
      );
    }

    await prisma.customerNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Nota a fost ștearsă cu succes" 
    });
  } catch (error) {
    console.error("Error deleting customer note:", error);
    return NextResponse.json(
      { error: "Eroare la ștergerea notei" },
      { status: 500 }
    );
  }
}
