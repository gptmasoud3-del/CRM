#!/usr/bin/env sh
set -eu
docker compose exec api npm run seed
