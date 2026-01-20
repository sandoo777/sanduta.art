import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";
import { UserRole } from "@prisma/client";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validateInput, sanitizeString } from "@/lib/validation";
import { logAuditAction, AUDIT_ACTIONS } from "@/lib/audit-log";
import { z } from "zod";

// Schema de validare pentru crearea unui customer
const createCustomerSchema = z.object({
  name: z.string().min(1, "Numele este obligatoriu"),
  email: z.string().email("Email invalid"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(["ONLINE", "OFFLINE"]).optional(),
});

/**
 * GET /api/admin/customers
 * Obține lista de clienți cu filtre și paginare
 */
export const GET = withRole(
  [UserRole.ADMIN, UserRole.MANAGER],
  async (request: NextRequest, { user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_GENERAL);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const search = sanitizeString(searchParams.get("search") || "");
      const source = searchParams.get("source");

    const skip = (page - 1) * limit;

    // Construiește filtrul de căutare
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    if (source && ["ONLINE", "OFFLINE"].includes(source)) {
      where.source = source;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

      return NextResponse.json({
        customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      return NextResponse.json(
        { error: "Eroare la obținerea clienților" },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/admin/customers
 * Creează un customer nou
 */
export const POST = withRole(
  [UserRole.ADMIN, UserRole.MANAGER],
  async (request: NextRequest, { user }) => {
    try {
      // Rate limiting
      const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_STRICT);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: rateLimitResult.error },
          { status: 429 }
        );
      }

      const body = await request.json();
      
      // Validare
      const validation = await validateInput(createCustomerSchema, body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Date invalide", details: validation.errors },
          { status: 400 }
        );
      }

      const data = validation.data;

    // Verifică dacă email-ul există deja
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Un client cu acest email există deja" },
        { status: 409 }
      );
    }

      const customer = await prisma.customer.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country || "Moldova",
          company: data.company,
          source: data.source || "ONLINE",
        },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      // Audit log
      await logAuditAction({
        userId: user.id,
        action: AUDIT_ACTIONS.CUSTOMER_CREATE,
        resourceType: 'customer',
        resourceId: customer.id,
        details: {
          email: customer.email,
          name: customer.name,
          source: customer.source,
        },
      });

      return NextResponse.json(customer, { status: 201 });
    } catch (error) {
      console.error("Error creating customer:", error);
      return NextResponse.json(
        { error: "Eroare la crearea clientului" },
        { status: 500 }
      );
    }
  }
);
