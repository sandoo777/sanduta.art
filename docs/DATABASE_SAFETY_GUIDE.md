# Database Safety Guide

This project now includes automatic local backups before destructive Prisma or schema repair actions. The goal is to prevent silent data loss during local development work.

## Backup location

Backups are stored in the local project folder:

- `backups/`

Each backup is a timestamped PostgreSQL SQL dump, for example:

- `backups/sanduta-sanduta-2026-09-29T07-00-00-000Z.sql`

The latest 5 backups are kept by default (`DB_BACKUP_RETENTION`).

## Safe commands

Use these commands instead of running raw Prisma reset or push commands directly:

```bash
npm run db:backup
npm run db:restore
npm run db:reset
npm run prisma:migrate
npm run prisma:db:push
npm run prisma:repair:machine-maintenance
```

All destructive actions require explicit confirmation and create a backup first.

## How backups are created

The backup script:

1. reads the active `DATABASE_URL`
2. connects to PostgreSQL
3. creates a SQL dump using `pg_dump`
4. stores the dump under `backups/`
5. removes old backup files beyond the retention limit

If `pg_dump` is not installed, the script exits with a clear error instead of risking a destructive action.

## How to restore a backup

List and restore manually:

```bash
npm run db:restore -- --file=sanduta-sanduta-2026-09-29T07-00-00-000Z.sql
```

Or restore the newest backup:

```bash
npm run db:restore
```

The restore command uses `psql` to replay the SQL dump back into the configured database.

## Safe schema repair workflow

When a repair script touches schema or data:

1. a backup is created automatically
2. the script prints the affected database
3. the user must type the confirmation keyword
4. the repair continues only after confirmation

For example:

```bash
npm run prisma:repair:machine-maintenance -- --yes
```

If you want to preview without executing the repair:

```bash
npm run prisma:repair:machine-maintenance -- --dry-run
```

## Risky commands audited

These operations are considered destructive and should not be run directly without backup:

- `npx prisma migrate reset`
- `npx prisma migrate dev`
- `npx prisma db push`
- custom repair scripts that create or alter tables, enums, or constraints

## Restore procedure after accidental reset

If a reset or repair caused data loss:

```bash
npm run db:restore
```

Then verify the data is back:

```bash
node -e "const { Client } = require('pg'); const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/sanduta' }); c.connect(); c.query('SELECT COUNT(*) FROM public.users').then(r => console.log(r.rows[0])).then(() => c.end());"
```

## Notes

- Local backups are intentionally not committed to Git.
- Never run destructive DB commands in production with the local dev guard.
- If a repair is needed, prefer the guarded scripts above, not raw Prisma commands.
