#!/usr/bin/env sh
set -eu
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api npm run prisma:migrate
docker compose -f docker-compose.prod.yml exec api npm run seed
docker compose -f docker-compose.prod.yml ps
