#!/usr/bin/env bash
# Carga (o actualiza) productos desde lambda-ventas/datos/productos.json → DynamoDB Productos.
# Uso: bash scripts/seed-catalog.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PRODUCTOS_JSON="${REPO_ROOT}/lambda-ventas/datos/productos.json"

# shellcheck source=lib/aws-local.sh
source "${SCRIPT_DIR}/lib/aws-local.sh"
# shellcheck source=lib/seed-productos.sh
source "${SCRIPT_DIR}/lib/seed-productos.sh"

init_aws_cli

echo "== Cargando catálogo en DynamoDB =="
echo "Origen: ${PRODUCTOS_JSON}"
seed_productos_from_json "$PRODUCTOS_JSON"
echo ""
echo "Verifica con:"
echo "  curl -s \"\${VITE_API_BASE_URL}/api/productos\" | head -c 500"
echo "Recarga el frontend (F5) para limpiar la caché del catálogo."
