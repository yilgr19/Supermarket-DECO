#!/usr/bin/env bash
# Configura tablas DynamoDB + API Gateway manual en LocalStack (workaround CFN).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/aws-local.sh
source "${SCRIPT_DIR}/lib/aws-local.sh"
# shellcheck source=lib/seed-productos.sh
source "${SCRIPT_DIR}/lib/seed-productos.sh"

REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
init_aws_cli

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

PRODUCTOS_JSON="${REPO_ROOT}/lambda-ventas/datos/productos.json"
if [[ -f "$PRODUCTOS_JSON" ]]; then
  echo "== Cargando catálogo =="
  seed_productos_from_json "$PRODUCTOS_JSON"
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
echo ""
echo "Copia BASE_URL a pos-frontend/.env.development → VITE_API_BASE_URL"

echo "== Pruebas curl =="
curl -sf "${BASE_URL}/api/productos" | json_pretty | head -20
echo "---"
curl -sf "${BASE_URL}/api/productos/prod-001" | json_pretty
echo "---"
curl -sf -X POST "${BASE_URL}/api/v1/ventas" -H "Content-Type: application/json" \
  -d '{"items":[{"id":"prod-001","nombre":"Arroz 1kg","precio":4500,"cantidad":1}],"descuento":0}' | json_pretty
