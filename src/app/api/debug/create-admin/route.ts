import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'sanduta',
    });

    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const result = await pool.query(`
      INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        "updatedAt" = NOW()
      RETURNING id, email, name, role;
    `, ['admin@sanduta.art', 'Admin User', passwordHash, 'ADMIN']);
    
    await pool.end();
    
    return NextResponse.json({
      success: true,
      user: result.rows[0],
      credentials: {
        email: 'admin@sanduta.art',
        password: 'admin123',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
