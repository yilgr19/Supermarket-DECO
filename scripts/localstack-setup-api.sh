#!/usr/bin/env bash
# Configura tablas DynamoDB + API Gateway manual en LocalStack (workaround CFN).
set -euo pipefail

EP="${AWS_ENDPOINT_URL:-http://localhost:4566}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
export AWS_DEFAULT_REGION="$REGION"
export AWS_PROFILE="${AWS_PROFILE:-localstack}"

aws_cli() { aws --endpoint-url="$EP" "$@"; }

echo "== Tablas DynamoDB =="
aws_cli dynamodb create-table \
  --table-name Ventas \
  --attribute-definitions AttributeName=idVenta,AttributeType=S \
  --key-schema AttributeName=idVenta,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST 2>/dev/null || true

aws_cli dynamodb create-table \
  --table-name Productos \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST 2>/dev/null || true

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PRODUCTOS_JSON="${SCRIPT_DIR}/../lambda-ventas/datos/productos.json"
if [[ ! -f "$PRODUCTOS_JSON" ]]; then
  PRODUCTOS_JSON="${HOME}/lambda-ventas/datos/productos.json"
fi
if [[ -f "$PRODUCTOS_JSON" ]]; then
  echo "== Cargando catálogo =="
  python3 - "$PRODUCTOS_JSON" "$EP" <<'PY'
import json, subprocess, sys, os
path, ep = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as f:
    data = json.load(f)
items = data["productos"] if isinstance(data, dict) and "productos" in data else data
for p in items:
    item = {
        "id": {"S": p["id"]},
        "nombre": {"S": p["nombre"]},
        "precio": {"N": str(p["precio"])},
        "stock_disponible": {"N": str(p.get("stock_disponible", 100))},
        "estado": {"S": p.get("estado", "ACTIVO")},
    }
    if p.get("descripcion"):
        item["descripcion"] = {"S": p["descripcion"]}
    if p.get("codigo_barras"):
        item["codigo_barras"] = {"S": p["codigo_barras"]}
    subprocess.run(
        ["aws", "--endpoint-url", ep, "dynamodb", "put-item",
         "--table-name", "Productos", "--item", json.dumps(item)],
        check=True,
        env={**os.environ, "AWS_DEFAULT_REGION": "us-east-1"},
    )
print(f"Productos cargados: {len(items)}")
PY
fi

echo "== API Gateway SupermarketAPI =="
EXISTING=$(aws_cli apigateway get-rest-apis --query "items[?name=='SupermarketAPI'].id | [0]" --output text)
if [[ -n "$EXISTING" && "$EXISTING" != "None" ]]; then
  API_ID="$EXISTING"
  echo "API existente: $API_ID"
else
  API_ID=$(aws_cli apigateway create-rest-api --name SupermarketAPI --query id --output text)
  echo "API creada: $API_ID"

  ROOT=$(aws_cli apigateway get-resources --rest-api-id "$API_ID" --query "items[?path=='/'].id" --output text)
  api_res=$(aws_cli apigateway create-resource --rest-api-id "$API_ID" --parent-id "$ROOT" --path-part api --query id --output text)
  prod_res=$(aws_cli apigateway create-resource --rest-api-id "$API_ID" --parent-id "$api_res" --path-part productos --query id --output text)
  prod_id_res=$(aws_cli apigateway create-resource --rest-api-id "$API_ID" --parent-id "$prod_res" --path-part '{id}' --query id --output text)
  v1_res=$(aws_cli apigateway create-resource --rest-api-id "$API_ID" --parent-id "$api_res" --path-part v1 --query id --output text)
  ventas_res=$(aws_cli apigateway create-resource --rest-api-id "$API_ID" --parent-id "$v1_res" --path-part ventas --query id --output text)

  LAMBDA_PRODUCTOS="arn:aws:lambda:us-east-1:000000000000:function:productos-get"
  LAMBDA_VENTAS="arn:aws:lambda:us-east-1:000000000000:function:ventas-post"
  PROXY_URI_PRODUCTOS="arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/${LAMBDA_PRODUCTOS}/invocations"
  PROXY_URI_VENTAS="arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/${LAMBDA_VENTAS}/invocations"

  for rid in "$prod_res" "$prod_id_res" "$ventas_res"; do
    aws_cli apigateway put-method --rest-api-id "$API_ID" --resource-id "$rid" --http-method OPTIONS --authorization-type NONE >/dev/null || true
    aws_cli apigateway put-method-response --rest-api-id "$API_ID" --resource-id "$rid" --http-method OPTIONS --status-code 200 \
      --response-parameters method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false >/dev/null || true
    aws_cli apigateway put-integration --rest-api-id "$API_ID" --resource-id "$rid" --http-method OPTIONS --type MOCK \
      --request-templates '{"application/json":"{\"statusCode\": 200}"}' >/dev/null || true
    aws_cli apigateway put-integration-response --rest-api-id "$API_ID" --resource-id "$rid" --http-method OPTIONS --status-code 200 \
      --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,Authorization'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,POST,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' >/dev/null || true
  done

  aws_cli apigateway put-method --rest-api-id "$API_ID" --resource-id "$prod_res" --http-method GET --authorization-type NONE >/dev/null
  aws_cli apigateway put-integration --rest-api-id "$API_ID" --resource-id "$prod_res" --http-method GET --type AWS_PROXY --integration-http-method POST --uri "$PROXY_URI_PRODUCTOS" >/dev/null

  aws_cli apigateway put-method --rest-api-id "$API_ID" --resource-id "$prod_id_res" --http-method GET --authorization-type NONE >/dev/null
  aws_cli apigateway put-integration --rest-api-id "$API_ID" --resource-id "$prod_id_res" --http-method GET --type AWS_PROXY --integration-http-method POST --uri "$PROXY_URI_PRODUCTOS" >/dev/null

  aws_cli apigateway put-method --rest-api-id "$API_ID" --resource-id "$ventas_res" --http-method POST --authorization-type NONE >/dev/null
  aws_cli apigateway put-integration --rest-api-id "$API_ID" --resource-id "$ventas_res" --http-method POST --type AWS_PROXY --integration-http-method POST --uri "$PROXY_URI_VENTAS" >/dev/null

  aws_cli lambda add-permission --function-name productos-get --statement-id "apigw-productos-$(date +%s)" \
    --action lambda:InvokeFunction --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:us-east-1:000000000000:${API_ID}/*/*/*" 2>/dev/null || true
  aws_cli lambda add-permission --function-name ventas-post --statement-id "apigw-ventas-$(date +%s)" \
    --action lambda:InvokeFunction --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:us-east-1:000000000000:${API_ID}/*/*/*" 2>/dev/null || true

  aws_cli apigateway create-deployment --rest-api-id "$API_ID" --stage-name prod >/dev/null

  if [[ -x "$(dirname "$0")/localstack-deploy-lambdas.sh" ]]; then
    "$(dirname "$0")/localstack-deploy-lambdas.sh" || true
  fi
fi

BASE_URL="http://localhost:4566/restapis/${API_ID}/prod/_user_request_"
echo "BASE_URL=${BASE_URL}"
mkdir -p "$(dirname "$0")/../pos-frontend" 2>/dev/null || true
echo "$BASE_URL" > "$(cd "$(dirname "$0")/.." && pwd)/pos-frontend/.lambda-base-url" 2>/dev/null || echo "$BASE_URL" > "${HOME}/lambda-ventas/.base_url"

echo "== Pruebas curl =="
curl -sf "${BASE_URL}/api/productos" | python3 -m json.tool | head -20
echo "---"
curl -sf "${BASE_URL}/api/productos/prod-001" | python3 -m json.tool
echo "---"
curl -sf -X POST "${BASE_URL}/api/v1/ventas" -H "Content-Type: application/json" \
  -d '{"items":[{"id":"prod-001","nombre":"Arroz 1kg","precio":4500,"cantidad":1}],"descuento":0}' | python3 -m json.tool
