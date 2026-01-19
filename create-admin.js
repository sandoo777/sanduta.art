import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'sanduta',
  });

  try {
    console.log('🔧 Creating admin user...');
    
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
    
    console.log('✅ Admin user created:');
    console.log(result.rows[0]);
    console.log('\n📧 Email: admin@sanduta.art');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
