#!/usr/bin/env bash
# Resuelve AWS CLI en Git Bash (usa WSL si aws no está en PATH).
# shellcheck disable=SC2034

EP="${AWS_ENDPOINT_URL:-http://localhost:4566}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
export AWS_PROFILE="${AWS_PROFILE:-localstack}"

USE_WSL_AWS=false

init_aws_cli() {
  if command -v aws >/dev/null 2>&1; then
    USE_WSL_AWS=false
    return 0
  fi
  if command -v wsl >/dev/null 2>&1 && wsl bash -lc 'command -v aws >/dev/null 2>&1'; then
    USE_WSL_AWS=true
    echo "AWS CLI no está en Git Bash → usando WSL"
    return 0
  fi
  echo "ERROR: No se encontró 'aws'."
  echo "  Instala AWS CLI en Windows, o usa WSL:"
  echo "  wsl bash -c 'cd /mnt/c/Users/yilgr/OneDrive/Desktop/supermarket && bash scripts/localstack-deploy-lambdas.sh'"
  exit 1
}

to_file_uri() {
  local p dir base
  dir="$(cd "$(dirname "$1")" && pwd)"
  base="$(basename "$1")"
  p="${dir}/${base}"
  if $USE_WSL_AWS; then
    if [[ "$p" =~ ^/([a-zA-Z])/(.*)$ ]]; then
      local drive
      drive="$(echo "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')"
      p="/mnt/${drive}/${BASH_REMATCH[2]}"
    fi
  elif [[ "$p" =~ ^/([a-zA-Z])/(.*)$ ]]; then
    local drive
    drive="$(echo "${BASH_REMATCH[1]}" | tr '[:lower:]' '[:upper:]')"
    p="${drive}:/${BASH_REMATCH[2]}"
  fi
  echo "fileb://${p}"
}

aws_cli() {
  if $USE_WSL_AWS; then
    wsl env AWS_PROFILE="$AWS_PROFILE" AWS_DEFAULT_REGION="$AWS_DEFAULT_REGION" \
      aws --endpoint-url="$EP" "$@"
  else
    aws --endpoint-url="$EP" "$@"
  fi
}

to_wsl_path() {
  local p="$1"
  if [[ "$p" =~ ^/([a-zA-Z])/(.*)$ ]]; then
    local drive
    drive="$(echo "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')"
    echo "/mnt/${drive}/${BASH_REMATCH[2]}"
  else
    echo "$p"
  fi
}
