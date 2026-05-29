#!/usr/bin/env bash
# Uso: ./consultar-venta.sh [idVenta]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/aws-local.sh
source "${SCRIPT_DIR}/lib/aws-local.sh"
# shellcheck source=lib/seed-productos.sh
source "${SCRIPT_DIR}/lib/seed-productos.sh"

init_aws_cli

ID="${1:-}"

if [[ -n "$ID" ]]; then
  echo "== Venta $ID =="
  aws_cli dynamodb get-item \
    --table-name Ventas \
    --key "{\"idVenta\":{\"S\":\"$ID\"}}" \
    --output json | json_pretty
else
  echo "== Últimas ventas (scan) =="
  aws_cli dynamodb scan \
    --table-name Ventas \
    --output json | json_pretty
fi
