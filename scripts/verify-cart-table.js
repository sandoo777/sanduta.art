require('dotenv').config({ path: '.env' });
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => client.query("SELECT migration_name, applied_steps_count, finished_at FROM _prisma_migrations WHERE migration_name LIKE '%cart%' ORDER BY finished_at DESC"))
  .then(r => { console.log('Cart migrations:', JSON.stringify(r.rows, null, 2)); })
  .then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name='cart_items' ORDER BY ordinal_position"))
  .then(r => { console.log('cart_items columns:', r.rows.map(x => x.column_name)); })
  .then(() => client.end())
  .catch(e => { console.error(e.message); process.exit(1); });
