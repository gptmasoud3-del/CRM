#!/usr/bin/env sh
set -eu
STAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p backups
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-crm_user}" "${POSTGRES_DB:-crm}" > "backups/crm-$STAMP.sql"
echo "Backup written to backups/crm-$STAMP.sql"
