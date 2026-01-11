# Seeding Database from pg_dump

## Step 1: Capture Heroku Backup
```bash
heroku pg:backups:capture --app [*gala*] --output [pg-dump]
```

## Step 2: Restore to Local Database
```bash
PGPASSWORD=alpine pg_restore --verbose --clean --no-acl --no-owner --if-exists --no-privileges --no-tablespaces \
  -h localhost -U gala -d gala [pg-dump]
```

## Local production restore (automatic via seeds)

Place your plain SQL dump at `tmp/gala-prod.sql` (schema + data). Then start Docker:

```bash
docker compose up --build
```

On first run with an empty DB, `db/seeds.rb` will:
- prefer a data-only dump at `tmp/gala-prod-data.sql` (no DDL)
- otherwise, fall back to `tmp/gala-prod.sql` (full dump)
- for full dump, it may ignore non-critical DDL errors and rely on migrations
- reset all sequences and set the DB environment metadata
- `entrypoint.sh` then runs `rails db:migrate` and refreshes indexes

### Manual fallback

If you prefer to run it yourself against the Docker DB:

```bash
PGPASSWORD=alpine psql -h localhost -U gala -p 5432 -d gala -v ON_ERROR_STOP=1 -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS hstore;" && \
PGPASSWORD=alpine psql -h localhost -U gala -p 5432 -d gala -v ON_ERROR_STOP=1 -f tmp/gala-prod.sql
```

## Create a data-only dump (recommended)

```bash
# from production (adjust connection as needed)
pg_dump --data-only --no-owner --no-privileges --inserts \
  --column-inserts -d "$DATABASE_URL" > tmp/gala-prod-data.sql
```

Then place `tmp/gala-prod-data.sql` in the project root and bring the stack up:

```bash
docker compose down -v && docker compose up --build
```