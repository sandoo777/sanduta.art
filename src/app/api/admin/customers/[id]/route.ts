import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/nextauth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validare pentru update
const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(["ONLINE", "OFFLINE"]).optional(),
});

/**
 * GET /api/admin/customers/[id]
 * Obține detaliile unui customer cu statistici
 */
export async function GET(
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

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            totalPrice: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        notes: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        tags: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Clientul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Calculează statisticile
    const totalOrders = customer.orders.length;
    const totalSpent = customer.orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0
    );
    const lastOrderDate = customer.orders.length > 0 
      ? customer.orders[0].createdAt 
      : null;

    const customerWithStats = {
      ...customer,
      statistics: {
        totalOrders,
        totalSpent,
        lastOrderDate,
      },
    };

    return NextResponse.json(customerWithStats);
  } catch (_error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Eroare la obținerea clientului" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/customers/[id]
 * Actualizează un customer
 */
export async function PATCH(
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
    const validationResult = updateCustomerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Date invalide", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verifică dacă customerul există
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Clientul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Dacă se actualizează email-ul, verifică duplicatele
    if (data.email && data.email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Un client cu acest email există deja" },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (_error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Eroare la actualizarea clientului" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]
 * Șterge un customer (doar dacă nu are comenzi)
 */
export async function DELETE(
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

    // Verifică dacă customerul există
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Clientul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Verifică dacă are comenzi
    if (customer._count.orders > 0) {
      return NextResponse.json(
        { 
          error: "Nu se poate șterge un client care are comenzi existente",
          ordersCount: customer._count.orders 
        },
        { status: 409 }
      );
    }

    // Șterge customerul (notele și tag-urile vor fi șterse automat datorită onDelete: Cascade)
    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Clientul a fost șters cu succes" 
    });
  } catch (_error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Eroare la ștergerea clientului" },
      { status: 500 }
    );
  }
}
