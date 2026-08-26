const { Client } = require('pg');
require('dotenv').config({ path: '.env' });
const url = process.env.DATABASE_URL;
const client = new Client({ connectionString: url });
client.connect()
  .then(() => client.query("SELECT pg_terminate_backend(pid) FROM pg_locks WHERE locktype='advisory' AND objid=72707369 AND pid != pg_backend_pid()"))
  .then(r => { console.log('Terminated:', JSON.stringify(r.rows)); })
  .then(() => client.end())
  .catch(e => { console.error(e.message); process.exit(1); });
