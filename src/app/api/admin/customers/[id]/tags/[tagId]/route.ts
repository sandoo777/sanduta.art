import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/admin/customers/[id]/tags/[tagId]
 * Șterge un tag de la un customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Acces interzis" },
        { status: 403 }
      );
    }

    const { id, tagId } = await params;

    // Verifică dacă tag-ul există și aparține customerului corect
    const tag = await prisma.customerTag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag-ul nu a fost găsit" },
        { status: 404 }
      );
    }

    if (tag.customerId !== id) {
      return NextResponse.json(
        { error: "Tag-ul nu aparține acestui client" },
        { status: 400 }
      );
    }

    await prisma.customerTag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Tag-ul a fost șters cu succes" 
    });
  } catch (error) {
    console.error("Error deleting customer tag:", error);
    return NextResponse.json(
      { error: "Eroare la ștergerea tag-ului" },
      { status: 500 }
    );
  }
}
