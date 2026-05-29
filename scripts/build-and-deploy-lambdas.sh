#!/usr/bin/env bash
# Compila lambda-ventas (Maven) y despliega en LocalStack.
# En Windows/Git Bash usa .m2-home/ del monorepo (evita error C:\Users\...\.m2).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LAMBDA_DIR="${REPO_ROOT}/lambda-ventas"

to_maven_path() {
  local p
  p="$(cd "$1" 2>/dev/null && pwd || echo "$1")"
  if [[ "$p" =~ ^/([a-zA-Z])/(.*)$ ]]; then
    local drive="${BASH_REMATCH[1]}"
    drive="$(echo "$drive" | tr '[:lower:]' '[:upper:]')"
    echo "${drive}:/${BASH_REMATCH[2]}"
  else
    echo "$p"
  fi
}

setup_maven() {
  local m2_dir="${REPO_ROOT}/.m2-home/repository"
  mkdir -p "$m2_dir"
  local m2_maven
  m2_maven="$(to_maven_path "$m2_dir")"
  export MAVEN_SETTINGS="${LAMBDA_DIR}/.maven-settings-build.xml"
  cat > "$MAVEN_SETTINGS" <<EOF
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 https://maven.apache.org/xsd/settings-1.2.0.xsd">
  <localRepository>${m2_maven}</localRepository>
</settings>
EOF
  echo "Maven localRepository: ${m2_maven}"
}

maybe_java_home() {
  if [[ -n "${JAVA_HOME:-}" ]]; then
    return
  fi
  local candidates=(
    "/c/Program Files/Eclipse Adoptium/jdk-21.0.9.10-hotspot"
    "/c/Program Files/Eclipse Adoptium/jdk-17.0.14.7-hotspot"
  )
  for c in "${candidates[@]}"; do
    if [[ -d "$c" ]]; then
      export JAVA_HOME="$c"
      export PATH="${JAVA_HOME}/bin:${PATH}"
      echo "JAVA_HOME: $JAVA_HOME"
      return
    fi
  done
}

echo "== Compilando lambda-ventas =="
cd "$LAMBDA_DIR"
setup_maven
maybe_java_home

if command -v sam >/dev/null 2>&1; then
  sam build --template-file template.yml
else
  echo "SAM no encontrado; usando mvn package..."
  mvn -s "$MAVEN_SETTINGS" -q clean package -DskipTests
fi

echo "== Desplegando Lambdas =="
bash "${SCRIPT_DIR}/localstack-deploy-lambdas.sh"
