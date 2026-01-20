import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// GET /api/admin/finishing - List all finishing operations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const operations = await prisma.finishingOperation.findMany({
      orderBy: [
        { active: 'desc' },
        { name: 'asc' }
      ]
    });

    // Convert Decimal to number for JSON serialization
    const serializedOperations = operations.map(op => ({
      ...op,
      costFix: op.costFix ? Number(op.costFix) : null,
      costPerUnit: op.costPerUnit ? Number(op.costPerUnit) : null,
      costPerM2: op.costPerM2 ? Number(op.costPerM2) : null,
    }));

    return NextResponse.json(serializedOperations);
  } catch (_error) {
    console.error('Error fetching finishing operations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finishing operations' },
      { status: 500 }
    );
  }
}

// POST /api/admin/finishing - Create new finishing operation
export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      type,
      costFix,
      costPerUnit,
      costPerM2,
      timeSeconds,
      compatibleMaterialIds,
      compatiblePrintMethodIds,
      description,
      active
    } = body;

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const operation = await prisma.finishingOperation.create({
      data: {
        name,
        type,
        costFix: costFix ? Number(costFix) : null,
        costPerUnit: costPerUnit ? Number(costPerUnit) : null,
        costPerM2: costPerM2 ? Number(costPerM2) : null,
        timeSeconds: timeSeconds ? Number(timeSeconds) : null,
        compatibleMaterialIds: compatibleMaterialIds || [],
        compatiblePrintMethodIds: compatiblePrintMethodIds || [],
        description,
        active: active !== undefined ? active : true,
      }
    });

    return NextResponse.json({
      ...operation,
      costFix: operation.costFix ? Number(operation.costFix) : null,
      costPerUnit: operation.costPerUnit ? Number(operation.costPerUnit) : null,
      costPerM2: operation.costPerM2 ? Number(operation.costPerM2) : null,
    }, { status: 201 });
  } catch (_error) {
    console.error('Error creating finishing operation:', error);
    return NextResponse.json(
      { error: 'Failed to create finishing operation' },
      { status: 500 }
    );
  }
}
