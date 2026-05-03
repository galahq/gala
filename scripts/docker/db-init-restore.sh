#!/bin/bash
set -euo pipefail

DUMPS_DIR="/seeddb/sqldumps"
LEGACY_DUMPS_DIR="/seeddb/sqldump"

if [ -d "$DUMPS_DIR" ] && find "$DUMPS_DIR" -maxdepth 1 -type f \( -name '*.dump' -o -name '*.sql' \) | grep -q .; then
  SOURCE_DIR="$DUMPS_DIR"
elif [ -d "$LEGACY_DUMPS_DIR" ] && find "$LEGACY_DUMPS_DIR" -maxdepth 1 -type f \( -name '*.dump' -o -name '*.sql' \) | grep -q .; then
  SOURCE_DIR="$LEGACY_DUMPS_DIR"
else
  echo "No database snaps to restore"
  exit 0
fi

DUMP_FILE="$(find "$SOURCE_DIR" -maxdepth 1 -type f \( -name '*.dump' -o -name '*.sql' \) | sort | head -n 1)"

if [ -z "$DUMP_FILE" ]; then
  echo "No database snaps to restore"
  exit 0
fi

echo "Restoring database snap from $(basename "$DUMP_FILE")"

if [[ "$DUMP_FILE" == *.sql ]]; then
  psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$DUMP_FILE"
else
  pg_restore --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$DUMP_FILE"
fi
