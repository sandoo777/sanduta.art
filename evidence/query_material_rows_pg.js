const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return null;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    if (key !== 'DATABASE_URL') continue;
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    return value;
  }

  return null;
}

async function main() {
  const connectionString = loadDatabaseUrl();
  if (!connectionString) {
    throw new Error('DATABASE_URL not found in environment or .env');
  }

  const client = new Client({ connectionString });
  await client.connect();

  const result = await client.query(`
    SELECT id, name, sku, density, thickness, "primarySupplierId", "wastePercent", "formatId", unit
    FROM materials
    ORDER BY "updatedAt" DESC
    LIMIT 10
  `);

  console.log(JSON.stringify(result.rows, null, 2));
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
