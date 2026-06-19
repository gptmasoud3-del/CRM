#!/usr/bin/env sh
set -eu
if [ $# -ne 1 ]; then
  echo "Usage: ./infra/scripts/restore-db.sh backup-file.sql"
  exit 1
fi
docker compose exec -T postgres psql -U "${POSTGRES_USER:-crm_user}" "${POSTGRES_DB:-crm}" < "$1"
echo "Restore completed from $1"
