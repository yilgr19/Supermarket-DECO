#!/usr/bin/env bash
# Despliega Lambdas Java en LocalStack sin CloudFormation (workaround bug CFN).
set -euo pipefail

EP="${AWS_ENDPOINT_URL:-http://localhost:4566}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
export AWS_PROFILE="${AWS_PROFILE:-localstack}"

aws_cli() { aws --endpoint-url="$EP" "$@"; }

LAMBDA_DIR="${HOME}/lambda-ventas"
BUILD_DIR="${LAMBDA_DIR}/.aws-sam/build"
JAR="${BUILD_DIR}/ProductosFunction/lambda-ventas-1.0-SNAPSHOT.jar"
ROLE_NAME="lambda-exec"
ROLE_ARN="arn:aws:iam::000000000000:role/${ROLE_NAME}"

if [[ ! -f "$JAR" ]]; then
  echo "Ejecuta primero: cd ~/lambda-ventas && sam build"
  exit 1
fi

TRUST='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws_cli iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document "$TRUST" 2>/dev/null || true
aws_cli iam put-role-policy --role-name "$ROLE_NAME" --policy-name dynamodb-all \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"dynamodb:*","Resource":"*"}]}' 2>/dev/null || true

deploy_fn() {
  local name="$1" handler="$2"
  if aws_cli lambda get-function --function-name "$name" >/dev/null 2>&1; then
    echo "Actualizando $name..."
    aws_cli lambda update-function-code --function-name "$name" --zip-file "fileb://${JAR}" >/dev/null
  else
    echo "Creando $name..."
    aws_cli lambda create-function \
      --function-name "$name" \
      --runtime java17 \
      --handler "$handler" \
      --role "$ROLE_ARN" \
      --timeout 30 \
      --memory-size 512 \
      --zip-file "fileb://${JAR}" \
      --environment "Variables={TABLA_VENTAS=Ventas,TABLA_PRODUCTOS=Productos,DYNAMODB_ENDPOINT=http://localhost.localstack.cloud:4566,AWS_REGION=us-east-1}" >/dev/null
  fi
}

deploy_fn productos-get 'com.supermarket.lambda.ProductosHandler::handleRequest'
deploy_fn ventas-post 'com.supermarket.lambda.VentaHandler::handleRequest'
echo "Lambdas listas."
aws_cli lambda list-functions --query 'Functions[].FunctionName' --output text
