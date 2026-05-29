#!/usr/bin/env bash
# Detiene LocalStack (api-deco)
set -euo pipefail

API_DECO_DIR="${API_DECO_DIR:-$HOME/api-deco}"

if [[ -f "$API_DECO_DIR/docker-compose.yml" ]]; then
  docker compose -f "$API_DECO_DIR/docker-compose.yml" down
  echo "LocalStack detenido."
else
  docker stop localstack_main 2>/dev/null || echo "No hay contenedor localstack_main."
fi
