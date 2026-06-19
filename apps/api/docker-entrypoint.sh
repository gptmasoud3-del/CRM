#!/bin/sh
set -e

npm run prisma:migrate

if [ "${AUTO_SEED:-false}" = "true" ]; then
  (
    echo "Starting optional seed..."
    if npm run seed; then
      echo "Seed completed successfully."
    else
      echo "Seed failed; API will keep running. Check seed logs and run 'docker compose exec api npm run seed' after fixing data issues." >&2
    fi
  ) &
fi

exec "$@"
