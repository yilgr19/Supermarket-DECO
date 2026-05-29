#!/usr/bin/env bash
# Despliega Lambdas Java en LocalStack sin CloudFormation (workaround bug CFN).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/aws-local.sh
source "${SCRIPT_DIR}/lib/aws-local.sh"

REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LAMBDA_DIR="${LAMBDA_DIR:-${REPO_ROOT}/lambda-ventas}"

init_aws_cli

resolve_jar() {
  local candidates=(
    "${LAMBDA_DIR}/target/lambda-ventas-1.0-SNAPSHOT.jar"
    "${LAMBDA_DIR}/.aws-sam/build/ProductosFunction/lambda-ventas-1.0-SNAPSHOT.jar"
    "${LAMBDA_DIR}/.aws-sam/build/VentasFunction/lambda-ventas-1.0-SNAPSHOT.jar"
  )
  for c in "${candidates[@]}"; do
    if [[ -f "$c" ]]; then
      echo "$c"
      return 0
    fi
  done
  return 1
}

JAR="$(resolve_jar || true)"
if [[ -z "$JAR" ]]; then
  echo "No se encontró el JAR. Compila primero:"
  echo "  bash scripts/build-and-deploy-lambdas.sh"
  exit 1
fi

JAR_URI="$(to_file_uri "$JAR")"
echo "Usando JAR: $JAR"
echo "Lambda dir: $LAMBDA_DIR"

ROLE_NAME="lambda-exec"
ROLE_ARN="arn:aws:iam::000000000000:role/${ROLE_NAME}"

TRUST='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws_cli iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document "$TRUST" 2>/dev/null || true
aws_cli iam put-role-policy --role-name "$ROLE_NAME" --policy-name dynamodb-all \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"dynamodb:*","Resource":"*"}]}' 2>/dev/null || true

deploy_fn() {
  local name="$1" handler="$2"
  if aws_cli lambda get-function --function-name "$name" >/dev/null 2>&1; then
    echo "Actualizando $name..."
    aws_cli lambda update-function-code --function-name "$name" --zip-file "$JAR_URI" >/dev/null
  else
    echo "Creando $name..."
    aws_cli lambda create-function \
      --function-name "$name" \
      --runtime java17 \
      --handler "$handler" \
      --role "$ROLE_ARN" \
      --timeout 30 \
      --memory-size 512 \
      --zip-file "$JAR_URI" \
      --environment "Variables={TABLA_VENTAS=Ventas,TABLA_PRODUCTOS=Productos,DYNAMODB_ENDPOINT=http://localhost.localstack.cloud:4566,AWS_REGION=us-east-1}" >/dev/null
  fi
}

deploy_fn productos-get 'com.supermarket.lambda.ProductosHandler::handleRequest'
deploy_fn ventas-post 'com.supermarket.lambda.VentaHandler::handleRequest'
echo "Lambdas listas."
aws_cli lambda list-functions --query 'Functions[].FunctionName' --output text
