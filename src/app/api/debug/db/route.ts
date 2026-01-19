import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(req: NextRequest) {
  try {
    // Test connection without Prisma adapter
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'sanduta',
    });

    // Test query
    const result = await pool.query('SELECT COUNT(*) as count FROM "User"');
    const userCount = result.rows[0].count;
    
    // Get admin user if exists
    const adminResult = await pool.query(
      'SELECT id, email, name, role FROM "User" WHERE email = $1',
      ['admin@sanduta.art']
    );
    
    await pool.end();
    
    return NextResponse.json({
      success: true,
      userCount,
      admin: adminResult.rows[0] || null,
      message: 'Database connection successful',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
