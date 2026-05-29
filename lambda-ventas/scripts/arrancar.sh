#!/usr/bin/env bash
# Arranca LocalStack y despliega el proyecto (SAM + Lambdas Java + API Gateway)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
API_DECO_DIR="${API_DECO_DIR:-$HOME/api-deco}"
ENDPOINT="${AWS_ENDPOINT_URL:-http://localhost:4566}"

export PATH="$HOME/.local/bin:$PATH"
export AWS_PROFILE="${AWS_PROFILE:-localstack}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
export AWS_ENDPOINT_URL="$ENDPOINT"
export SAM_CLI_TELEMETRY=0

aws_local() { aws --endpoint-url="$ENDPOINT" "$@"; }

echo "=============================================="
echo " 1/5 LocalStack (Docker)"
echo "=============================================="
if [[ -f "$API_DECO_DIR/docker-compose.yml" ]]; then
  docker compose -f "$API_DECO_DIR/docker-compose.yml" up -d
else
  echo "   No se encontró $API_DECO_DIR/docker-compose.yml"
  echo "   Asegúrate de que LocalStack esté en $ENDPOINT"
fi

echo "   Esperando LocalStack..."
for i in $(seq 1 30); do
  if curl -sf "$ENDPOINT/_localstack/health" >/dev/null 2>&1; then
    echo "   LocalStack OK"
    break
  fi
  sleep 2
  [[ $i -eq 30 ]] && { echo "   LocalStack no respondió"; exit 1; }
done

echo ""
echo "=============================================="
echo " 2/5 Bucket S3 para SAM"
echo "=============================================="
aws_local s3 mb s3://sam-deploy-bucket 2>/dev/null || true

echo ""
echo "=============================================="
echo " 3/5 SAM build + deploy"
echo "=============================================="
if ! command -v sam &>/dev/null; then
  echo "   SAM no instalado. Ver: https://docs.aws.amazon.com/serverless-application-model/"
  exit 1
fi

cd "$PROJECT_DIR"
sam build --template-file template.yml
sam deploy --config-env localstack --no-confirm-changeset --no-fail-on-empty-changeset

echo ""
echo "=============================================="
echo " 4/5 Catálogo de productos (datos/productos.json)"
echo "=============================================="
CATALOGO="$PROJECT_DIR/datos/productos.json"
if [[ -f "$CATALOGO" ]]; then
  python3 <<PY
import json, subprocess, os

endpoint = os.environ["AWS_ENDPOINT_URL"]
catalog = json.load(open("$CATALOGO"))
for p in catalog.get("productos", []):
    item = {
        "id": {"S": p["id"]},
        "nombre": {"S": p["nombre"]},
        "descripcion": {"S": p.get("descripcion", "")},
        "precio": {"N": str(p["precio"])},
        "stock_disponible": {"N": str(int(p["stock_disponible"]))},
        "estado": {"S": p.get("estado", "activo")},
        "codigo_barras": {"S": p.get("codigo_barras", "")},
    }
    subprocess.run(
        ["aws", "--endpoint-url", endpoint, "dynamodb", "put-item",
         "--table-name", "Productos", "--item", json.dumps(item)],
        check=True, env={**os.environ, "AWS_PROFILE": os.environ.get("AWS_PROFILE", "localstack")},
    )
    print(f"   + {p['id']}: {p['nombre']}")
print(f"   {len(catalog.get('productos', []))} productos en DynamoDB")
PY
else
  echo "   Sin catálogo en $CATALOGO"
fi

echo ""
echo "=============================================="
echo " 5/5 Usuario IAM restringido (opcional)"
echo "=============================================="
IAM_POLICY="$PROJECT_DIR/iam/supermarket-app-policy.json"
USER_NAME="supermarket-app"
if [[ -f "$IAM_POLICY" ]]; then
  POLICY_ARN=$(aws_local iam create-policy --policy-name SupermarketAppPolicy \
    --policy-document "file://$IAM_POLICY" \
    --query 'Policy.Arn' --output text 2>/dev/null || \
    aws_local iam list-policies --scope Local \
    --query "Policies[?PolicyName=='SupermarketAppPolicy'].Arn | [0]" --output text)
  aws_local iam create-user --user-name "$USER_NAME" 2>/dev/null || true
  aws_local iam attach-user-policy --user-name "$USER_NAME" --policy-arn "$POLICY_ARN" 2>/dev/null || true
  echo "   Usuario: $USER_NAME (perfil AWS: supermarket)"
fi

API_ID=$(aws_local apigateway get-rest-apis --query "items[?name=='SupermarketAPI'].id | [0]" --output text 2>/dev/null || echo "")
echo ""
echo "=============================================="
echo " LISTO"
echo "=============================================="
echo "  Lambdas:  ventas-post, productos-get"
echo "  Tablas:   Ventas, Productos"
if [[ -n "$API_ID" && "$API_ID" != "None" ]]; then
  BASE="$ENDPOINT/restapis/$API_ID/prod/_user_request_"
  echo "  API POST ventas:    ${BASE}/api/v1/ventas"
  echo "  API GET productos:  ${BASE}/api/productos"
fi
echo ""
echo "  Perfil admin:      export AWS_PROFILE=localstack"
echo "  Perfil restringido: export AWS_PROFILE=supermarket"
echo "  UI (StackPort):    http://127.0.0.1:8080"
echo "=============================================="
