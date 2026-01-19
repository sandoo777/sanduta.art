import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Direct database query without Prisma
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'sanduta',
    });

    // Find user
    const result = await pool.query(
      'SELECT id, email, name, role, password FROM "User" WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      await pool.end();
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    
    await pool.end();
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      passwordValid: isValid,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
