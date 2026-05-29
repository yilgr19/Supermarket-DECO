#!/usr/bin/env bash
# Uso: ./consultar-venta.sh [idVenta]
# Ejemplo: ./consultar-venta.sh VNT-1779928886759
set -euo pipefail

EP="${AWS_ENDPOINT_URL:-http://localhost:4566}"
ID="${1:-}"

if [[ -n "$ID" ]]; then
  echo "== Venta $ID =="
  aws --endpoint-url="$EP" dynamodb get-item \
    --table-name Ventas \
    --key "{\"idVenta\":{\"S\":\"$ID\"}}" \
    --output json | python3 -m json.tool
else
  echo "== Últimas ventas (scan) =="
  aws --endpoint-url="$EP" dynamodb scan \
    --table-name Ventas \
    --output json | python3 -m json.tool
fi
