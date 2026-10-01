#!/usr/bin/env tsx

import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { Client } from 'pg';

const args = process.argv.slice(2);
const action = args[0] ?? 'help';
const passthroughArgs = args.slice(1);
const dryRun = passthroughArgs.includes('--dry-run');
const autoConfirm = passthroughArgs.includes('--yes') || passthroughArgs.includes('--confirm') || process.env.CI === 'true';
const backupRoot = path.resolve(process.cwd(), 'backups');
const retentionLimit = Number(process.env.DB_BACKUP_RETENTION ?? '5');
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sanduta';

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '') || 'sanduta';
  const user = decodeURIComponent(parsed.username || 'postgres');
  const password = decodeURIComponent(parsed.password || 'password');
  return {
    host: parsed.hostname || 'localhost',
    port: parsed.port || '5432',
    database,
    user,
    password,
    connectionString: url,
  };
}

function printHeader(title: string) {
  console.log('\n' + '='.repeat(72));
  console.log(title);
  console.log('='.repeat(72));
}

async function ensureBackupDirectory() {
  await fs.mkdir(backupRoot, { recursive: true });
}

async function listBackups(): Promise<string[]> {
  await ensureBackupDirectory();
  const files = await fs.readdir(backupRoot);
  return files
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => b.localeCompare(a));
}

async function pruneOldBackups() {
  const files = await listBackups();
  if (files.length <= retentionLimit) return;

  const oldFiles = files.slice(retentionLimit);
  for (const file of oldFiles) {
    await fs.unlink(path.join(backupRoot, file));
  }
}

function escapeSqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'bigint') return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (value instanceof Date) return `'${value.toISOString()}'`;
  return `'${String(value).replace(/'/g, "''").replace(/\r/g, '\\r').replace(/\n/g, '\\n')}'`;
}

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let buffer = '';
  let inSingleQuote = false;
  let i = 0;

  while (i < sql.length) {
    const char = sql[i];
    const next = sql[i + 1];

    if (char === "'") {
      if (inSingleQuote && next === "'") {
        buffer += "''";
        i += 2;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      buffer += char;
      i += 1;
      continue;
    }

    if (char === ';' && !inSingleQuote) {
      const statement = buffer.trim();
      if (statement) statements.push(statement);
      buffer = '';
      i += 1;
      continue;
    }

    buffer += char;
    i += 1;
  }

  const trailing = buffer.trim();
  if (trailing) statements.push(trailing);
  return statements;
}

async function createBackupFallback(filePath: string) {
  const { host, port, database, user, password } = parseDatabaseUrl(databaseUrl);
  const client = new Client({ host, port: Number(port), user, password, database, ssl: false });
  await client.connect();

  const tableRows = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const lines: string[] = ['BEGIN;'];

  for (const row of tableRows.rows) {
    const tableName = row.table_name;
    const columnsResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    const columns = columnsResult.rows.map((columnRow) => columnRow.column_name);

    const dataResult = await client.query(`SELECT * FROM public."${tableName}";`);
    if (dataResult.rows.length === 0) {
      lines.push(`-- ${tableName}: 0 rows`);
      continue;
    }

    for (const record of dataResult.rows) {
      const values = columns.map((column) => escapeSqlValue(record[column]));
      const insertSql = `INSERT INTO public."${tableName}" (${columns.map((column) => `"${column}"`).join(', ')}) VALUES (${values.join(', ')});`;
      lines.push(insertSql);
    }
  }

  lines.push('COMMIT;');
  await fs.writeFile(filePath, lines.join('\n') + '\n', 'utf8');
  await client.end();
}

async function restoreBackupFallback(filePath: string) {
  const { host, port, database, user, password } = parseDatabaseUrl(databaseUrl);
  const client = new Client({ host, port: Number(port), user, password, database, ssl: false });
  await client.connect();

  const tablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name DESC;
  `);

  for (const row of tablesResult.rows) {
    const tableName = row.table_name;
    await client.query(`TRUNCATE TABLE public."${tableName}" CASCADE;`);
  }

  const sql = await fs.readFile(filePath, 'utf8');
  const statements = splitSqlStatements(sql).filter((statement) => statement && !statement.startsWith('--'));

  for (const statement of statements) {
    await client.query(statement);
  }

  await client.end();
}

async function createBackup() {
  await ensureBackupDirectory();
  const { host, port, database } = parseDatabaseUrl(databaseUrl);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(backupRoot, `sanduta-${database}-${stamp}.sql`);

  console.log(`Creating SQL backup for database "${database}" at ${filePath}`);

  const pgDump = spawnSync(process.platform === 'win32' ? 'pg_dump.exe' : 'pg_dump', ['--version'], {
    env: process.env,
    stdio: 'ignore',
  });

  if (pgDump.status === 0) {
    const { user, password } = parseDatabaseUrl(databaseUrl);
    const command = spawnSync(
      process.platform === 'win32' ? 'pg_dump.exe' : 'pg_dump',
      ['--clean', '--if-exists', '--quote-all-identifiers', '--file', filePath, '--host', host, '--port', port, '--username', user, database],
      {
        env: { ...process.env, PGPASSWORD: password },
        stdio: 'inherit',
      }
    );

    if (command.status !== 0) {
      throw new Error(`Database backup failed with exit code ${command.status ?? 1}`);
    }
  } else {
    await createBackupFallback(filePath);
  }

  await pruneOldBackups();
  console.log(`Backup created successfully: ${filePath}`);
  return filePath;
}

async function restoreBackup(targetFile?: string) {
  const backups = await listBackups();
  const chosen = targetFile ? path.resolve(backupRoot, targetFile) : path.join(backupRoot, backups[0]);

  if (!chosen || !(await fs.stat(chosen).then(() => true).catch(() => false))) {
    throw new Error('No valid backup file found in backups/. Run "npm run db:backup" first.');
  }

  const { host, port, database, user, password } = parseDatabaseUrl(databaseUrl);
  const psql = spawnSync(process.platform === 'win32' ? 'psql.exe' : 'psql', ['--version'], {
    env: process.env,
    stdio: 'ignore',
  });

  if (psql.status === 0) {
    console.log(`Restoring database "${database}" from ${chosen}`);
    const result = spawnSync(
      process.platform === 'win32' ? 'psql.exe' : 'psql',
      ['-h', host, '-p', port, '-U', user, '-d', database, '-f', chosen],
      {
        env: { ...process.env, PGPASSWORD: password },
        stdio: 'inherit',
      }
    );

    if (result.status !== 0) {
      throw new Error(`Database restore failed with exit code ${result.status ?? 1}`);
    }
  } else {
    console.log(`Restoring database "${database}" using SQL fallback from ${chosen}`);
    await restoreBackupFallback(chosen);
  }

  console.log('Restore completed.');
}

async function confirmAction(commandName: string, databaseName: string) {
  if (autoConfirm || dryRun) return;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const keyword = commandName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  console.log(`⚠️  Destructive action detected: ${commandName}`);
  console.log(`Database: ${databaseName}`);
  console.log('This can drop, recreate, or alter schema/data.');
  const answer = await rl.question(`Type "${keyword}" to continue: `);
  rl.close();
  if (answer.trim() !== keyword) {
    console.log('Aborted. No destructive operation was executed.');
    process.exit(0);
  }
}

async function runNpxPrisma(argsList: string[]) {
  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(npxCommand, ['prisma', ...argsList], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function handleBackup() {
  printHeader('Database backup');
  await createBackup();
}

async function handleRestore() {
  printHeader('Database restore');
  const targetFile = passthroughArgs.find((arg) => arg.startsWith('--file='))?.split('=')[1];
  await confirmAction('restore', parseDatabaseUrl(databaseUrl).database);
  await restoreBackup(targetFile);
}

async function handleReset() {
  printHeader('Prisma reset guard');
  const { database } = parseDatabaseUrl(databaseUrl);
  await confirmAction('prisma migrate reset', database);
  await createBackup();
  if (dryRun) {
    console.log('Dry run: would run: npx prisma migrate reset --force');
    return;
  }
  await runNpxPrisma(['migrate', 'reset', '--force']);
}

async function handleMigrate() {
  printHeader('Prisma migration guard');
  const { database } = parseDatabaseUrl(databaseUrl);
  await confirmAction('prisma migrate dev', database);
  await createBackup();
  if (dryRun) {
    console.log('Dry run: would run: npx prisma migrate dev');
    return;
  }
  await runNpxPrisma(['migrate', 'dev', ...passthroughArgs.filter((arg) => !arg.startsWith('--yes') && !arg.startsWith('--confirm') && !arg.startsWith('--dry-run'))]);
}

async function handlePush() {
  printHeader('Prisma db push guard');
  const { database } = parseDatabaseUrl(databaseUrl);
  await confirmAction('prisma db push', database);
  await createBackup();
  if (dryRun) {
    console.log('Dry run: would run: npx prisma db push');
    return;
  }
  await runNpxPrisma(['db', 'push', ...passthroughArgs.filter((arg) => !arg.startsWith('--yes') && !arg.startsWith('--confirm') && !arg.startsWith('--dry-run'))]);
}

async function handleRepair() {
  printHeader('Repair script guard');
  const { database } = parseDatabaseUrl(databaseUrl);
  await confirmAction('schema repair', database);
  await createBackup();
  const repairTokens = passthroughArgs.filter((arg) => !arg.startsWith('--'));
  const scriptPath = repairTokens[0] === 'node' ? (repairTokens[1] || 'repair-machine-maintenance.js') : (repairTokens[0] || 'repair-machine-maintenance.js');
  const extraScriptArgs = repairTokens[0] === 'node' ? repairTokens.slice(2) : repairTokens.slice(1);

  if (dryRun) {
    console.log(`Dry run: would run: node ${scriptPath} ${extraScriptArgs.join(' ')}`.trim());
    return;
  }

  const result = spawnSync(process.platform === 'win32' ? 'node.exe' : 'node', [scriptPath, ...extraScriptArgs], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function printHelp() {
  printHeader('Database safety guard');
  console.log('Usage:');
  console.log('  npm run db:backup');
  console.log('  npm run db:restore');
  console.log('  npm run db:reset');
  console.log('  npm run prisma:migrate');
  console.log('  npm run prisma:db:push');
  console.log('');
  console.log('Flags:');
  console.log('  --yes         Skip confirmation prompts');
  console.log('  --dry-run     Show what would happen without running the command');
  console.log('  --file=...    Restore a specific backup file');
}

(async () => {
  try {
    switch (action) {
      case 'backup':
        await handleBackup();
        break;
      case 'restore':
        await handleRestore();
        break;
      case 'reset':
        await handleReset();
        break;
      case 'migrate':
        await handleMigrate();
        break;
      case 'push':
        await handlePush();
        break;
      case 'repair':
        await handleRepair();
        break;
      case 'help':
      case '--help':
      case '-h':
      default:
        await printHelp();
        break;
    }
  } catch (error) {
    console.error('Database safety guard failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
