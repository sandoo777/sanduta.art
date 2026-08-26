const { Client } = require('pg');
require('dotenv').config({ path: '.env' });
const url = process.env.DATABASE_URL;
const client = new Client({ connectionString: url });
client.connect()
  .then(() => client.query("SELECT pid, application_name, state FROM pg_stat_activity WHERE state != 'idle' AND pid != pg_backend_pid()"))
  .then(r => { console.log('Active sessions:', JSON.stringify(r.rows, null, 2)); })
  .then(() => client.query("SELECT pid, locktype, classid, objid FROM pg_locks WHERE locktype='advisory'"))
  .then(r => { console.log('Advisory locks:', JSON.stringify(r.rows, null, 2)); })
  .then(() => client.end())
  .catch(e => { console.error(e.message); process.exit(1); });
