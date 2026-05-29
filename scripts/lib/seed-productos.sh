#!/usr/bin/env bash
# Carga productos.json en DynamoDB (Productos). Requiere aws_cli (source aws-local.sh).
seed_productos_from_json() {
  local json_path="$1"
  local count=0 item

  if [[ ! -f "$json_path" ]]; then
    echo "No se encontró: $json_path"
    return 1
  fi

  if command -v node >/dev/null 2>&1; then
    local tmp items_file
    tmp="$(mktemp)"
    trap 'rm -f "$tmp"' RETURN
    PRODUCTOS_JSON="$json_path" node <<'NODE' >"$tmp"
const fs = require("fs");
const path = process.env.PRODUCTOS_JSON;
const data = JSON.parse(fs.readFileSync(path, "utf8"));
const items = Array.isArray(data) ? data : data.productos || [];
for (const p of items) {
  const item = {
    id: { S: p.id },
    nombre: { S: p.nombre },
    precio: { N: String(p.precio) },
    stock_disponible: { N: String(p.stock_disponible ?? 100) },
    estado: { S: p.estado ?? "ACTIVO" },
  };
  if (p.descripcion) item.descripcion = { S: p.descripcion };
  if (p.codigo_barras) item.codigo_barras = { S: p.codigo_barras };
  process.stdout.write(JSON.stringify(item) + "\n");
}
NODE
    while IFS= read -r item || [[ -n "$item" ]]; do
      item="${item//$'\r'/}"
      [[ -z "$item" ]] && continue
      aws_cli dynamodb put-item --table-name Productos --item "$item" </dev/null >/dev/null
      count=$((count + 1))
    done <"$tmp"
  elif command -v wsl >/dev/null 2>&1 && wsl bash -lc 'command -v python3 >/dev/null 2>&1'; then
    local wsl_json
    wsl_json="$(to_wsl_path "$json_path")"
    while IFS= read -r item; do
      aws_cli dynamodb put-item --table-name Productos --item "$item" </dev/null >/dev/null
      count=$((count + 1))
    done < <(wsl python3 - "$wsl_json" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as f:
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
    print(json.dumps(item))
PY
)
  else
    echo "ERROR: Se necesita Node.js o Python3 (WSL) para cargar el catálogo."
    return 1
  fi

  echo "Productos cargados: $count"
}

json_pretty() {
  if command -v node >/dev/null 2>&1; then
    node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.stringify(JSON.parse(d),null,2))}catch(e){process.stdout.write(d)}})"
  elif command -v wsl >/dev/null 2>&1; then
    wsl python3 -m json.tool
  else
    cat
  fi
}
