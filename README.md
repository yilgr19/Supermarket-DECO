# Supermarket — POS (SDD)

Monorepo del **punto de venta** para supermercado: frontend React y backend **serverless** (Lambda + API Gateway + DynamoDB en LocalStack). Incluye modo opcional con Spring Boot (`pos-sales-api`).

**Repositorio:** https://github.com/yilgr19/Supermarket-DECO

## Estructura

| Ruta | Contenido |
|------|-----------|
| **`lambda-ventas/`** | Backend serverless: Java 17, SAM, 2 Lambdas, DynamoDB, tests JUnit. [README](lambda-ventas/README.md) |
| **`pos-frontend/`** | Cliente POS: React 18, TypeScript, Vite, Tailwind, Vitest. [README](pos-frontend/README.md) |
| **`scripts/`** | Deploy LocalStack, verificar ventas, recargar catálogo |
| **`docs/`** | Infraestructura, capturas, [guía de estudio](docs/GUIA-ESTUDIO-TECNICO.md) |
| **`.kiro/specs/`** | Specs SDD: `lambda-ventas/`, `pos-frontend/` |
| **`pos-sales-api/`** | API Spring Boot opcional (puerto **8088**) |

## Arquitectura (modo examen)

```
pos-frontend :5173
       │  VITE_API_BASE_URL
       ▼
API Gateway SupermarketAPI (LocalStack :4566)
       ├── GET  /api/productos      → Lambda productos-get
       └── POST /api/v1/ventas      → Lambda ventas-post
                    │
                    ▼
              DynamoDB Productos (catálogo + stock)
              DynamoDB Ventas      (registro de ventas)
```

| Qué | Cómo se activa |
|-----|----------------|
| **LocalStack + Lambdas** | Scripts bash (manual) |
| **Ventas y descuento de stock** | Automático en cada `POST /api/v1/ventas` |
| **Frontend** | `npm run dev` (manual) |

---

## Guía paso a paso — LocalStack, Lambda y verificación

Sigue estos pasos **en orden** cada vez que reinicies el PC o Docker. Usa **Git Bash** (o WSL) para los scripts; **PowerShell** para el frontend.

### Paso 0 — Requisitos previos (solo primera vez)

1. **Docker** corriendo (en muchos equipos se levanta desde **Ubuntu/WSL** si en Windows directo falla).
2. **Perfil AWS** en `~/.aws/credentials`:

```ini
[localstack]
aws_access_key_id = test
aws_secret_access_key = test
```

3. Dependencias del monorepo:

```powershell
npm install
npm install --legacy-peer-deps --prefix pos-frontend
Copy-Item pos-frontend\.env.example pos-frontend\.env.development
```

---

### Paso 1 — Activar LocalStack (simulador AWS)

LocalStack debe escuchar en el puerto **4566**.

**Git Bash / WSL:**

```bash
curl -s http://localhost:4566/_localstack/health
```

**PowerShell:**

```powershell
curl.exe -s http://localhost:4566/_localstack/health
```

**Resultado esperado:** JSON con `"lambda": "running"` y `"dynamodb": "running"`.

Si no responde → levanta Docker/LocalStack desde Ubuntu/WSL y vuelve a probar.

> En PowerShell **no** uses `export ...` (eso es de Linux). Usa `$env:...` (ver paso 2).

---

### Paso 2 — Variables de entorno AWS (sesión actual)

**Git Bash / WSL** (raíz del repo `supermarket/`):

```bash
cd ~/OneDrive/Desktop/supermarket

export AWS_PROFILE=localstack
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566
```

**PowerShell** (solo para pruebas con `curl.exe`; los scripts de deploy van mejor en Git Bash):

```powershell
cd C:\Users\yilgr\OneDrive\Desktop\supermarket

$env:AWS_PROFILE="localstack"
$env:AWS_DEFAULT_REGION="us-east-1"
$env:AWS_ENDPOINT_URL="http://localhost:4566"
```

---

### Paso 3 — Compilar y desplegar las Lambdas

Sube el JAR Java a LocalStack como funciones `productos-get` y `ventas-post`.

```bash
bash scripts/build-and-deploy-lambdas.sh
```

**Resultado esperado:**

```text
== Compilando lambda-ventas ==
== Desplegando Lambdas ==
Actualizando productos-get...
Actualizando ventas-post...
Lambdas listas.
```

Si solo cambiaste código y el JAR ya está compilado:

```bash
bash scripts/localstack-deploy-lambdas.sh
```

> Sin AWS CLI en Git Bash, el script usa `wsl aws` automáticamente.

---

### Paso 4 — Crear tablas, cargar productos y configurar API Gateway

Crea tablas DynamoDB (`Productos`, `Ventas`), carga el catálogo desde `lambda-ventas/datos/productos.json` y deja listo API Gateway.

```bash
bash scripts/localstack-setup-api.sh
```

**Resultado esperado:**

```text
== Tablas DynamoDB ==
== Cargando catálogo ==
Productos cargados: 4
== API Gateway SupermarketAPI ==
BASE_URL=http://localhost:4566/restapis/XXXXXXXX/prod/_user_request_
```

**Importante:** copia el `BASE_URL` completo. El `XXXXXXXX` es el **API ID**; **cambia cada vez que reinicias LocalStack**.

---

### Paso 5 — Configurar el frontend

Edita `pos-frontend/.env.development`:

```env
VITE_API_BASE_URL=http://localhost:4566/restapis/TU_API_ID/prod/_user_request_
VITE_USE_MSW=false
VITE_SALES_API_URL=
VITE_TERMINAL_ID=TERM-001
VITE_STORE_NAME=Supermercado POS
```

Sustituye `TU_API_ID` por el valor del paso 4 (ej. `dif7o56qm3`).

Inicia el frontend (**PowerShell**):

```powershell
cd pos-frontend
npm run dev
```

Abre **http://localhost:5173/login**

> Si cambias `.env.development`, **detén y vuelve a ejecutar** `npm run dev` (Vite no recarga la URL sola).

---

### Paso 6 — Verificar que los productos están en DynamoDB

**Opción A — API (recomendada):**

**Git Bash:**

```bash
curl -s "http://localhost:4566/restapis/TU_API_ID/prod/_user_request_/api/productos"
```

**PowerShell:**

```powershell
curl.exe -s "http://localhost:4566/restapis/TU_API_ID/prod/_user_request_/api/productos"
```

**Resultado esperado:** JSON con array de productos (`prod-001`, `prod-002`, …).

**Opción B — Un producto por ID:**

```bash
curl -s "http://localhost:4566/restapis/TU_API_ID/prod/_user_request_/api/productos/prod-001"
```

Debe incluir `nombre`, `precio`, `stock_disponible`.

**Opción C — UI:** login → buscar `pan` o `arroz` (mín. 2 letras) → debe listar productos.

**Si ves "Sin conexión" en el POS:** casi siempre el `VITE_API_BASE_URL` tiene un **API ID viejo**. Repite pasos 4 y 5.

---

### Paso 7 — Verificar que las ventas se guardan en DynamoDB

**Opción A — Desde el POS:**

1. Agrega productos al carrito.
2. **Checkout efectivo**.
3. Copia el `idVenta` del recibo (ej. `VNT-1780078872579`).
4. Primera venta puede tardar **15–20 s** (cold start JVM).

**Opción B — POST manual (Git Bash):**

```bash
curl -s -X POST "http://localhost:4566/restapis/TU_API_ID/prod/_user_request_/api/v1/ventas" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"prod-001","nombre":"Arroz 1kg","precio":4500,"cantidad":1}],"descuento":0}'
```

**Resultado esperado:** HTTP **201** y JSON con `idVenta`, `subtotal`, `iva`, `total`.

**Opción C — Consultar DynamoDB (Git Bash, raíz del repo):**

```bash
# Una venta por ID del recibo
bash scripts/consultar-venta.sh VNT-1780078872579

# Todas las ventas registradas
bash scripts/consultar-venta.sh
```

Debes ver el ítem, totales y fecha en la tabla **Ventas**.

**Verificar descuento de stock** (opcional):

```bash
curl -s "http://localhost:4566/restapis/TU_API_ID/prod/_user_request_/api/productos/prod-001"
```

El `stock_disponible` debe haber bajado respecto al valor anterior. En el POS, pulsa **F5** para refrescar el catálogo.

---

### Paso 8 — Recargar catálogo si editas `productos.json`

El archivo [`lambda-ventas/datos/productos.json`](lambda-ventas/datos/productos.json) **no se lee en vivo**. Hay que volver a cargarlo en DynamoDB:

```bash
bash scripts/seed-catalog.sh
```

**Resultado esperado:** `Productos cargados: N` (N = cantidad de ítems en el JSON).

Luego **F5** en el navegador.

---

## Checklist rápido (arranque del día)

| # | Acción | Comando | ¿OK? |
|---|--------|---------|------|
| 1 | LocalStack activo | `curl` health `:4566` | JSON con lambda + dynamodb running |
| 2 | Variables AWS | `export` o `$env:` | Perfil `localstack` |
| 3 | Deploy Lambdas | `bash scripts/build-and-deploy-lambdas.sh` | `Lambdas listas` |
| 4 | Tablas + API + catálogo | `bash scripts/localstack-setup-api.sh` | `Productos cargados: N` + `BASE_URL` |
| 5 | `.env` + frontend | Copiar `BASE_URL` → `npm run dev` | Login carga |
| 6 | Productos OK | `GET /api/productos` | Array JSON |
| 7 | Venta OK | Checkout o `consultar-venta.sh VNT-...` | Venta en DynamoDB |

---

## Git Bash vs PowerShell

| Tarea | Terminal recomendada |
|-------|----------------------|
| Scripts deploy / seed / consultar ventas | **Git Bash** o **WSL** |
| `npm run dev` (frontend) | **PowerShell** |
| Health check LocalStack | Ambas (`curl` / `curl.exe`) |

**Git Bash / WSL:**

```bash
export AWS_PROFILE=localstack
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566
curl -s http://localhost:4566/_localstack/health
```

**PowerShell:**

```powershell
$env:AWS_PROFILE="localstack"
$env:AWS_DEFAULT_REGION="us-east-1"
$env:AWS_ENDPOINT_URL="http://localhost:4566"
curl.exe -s http://localhost:4566/_localstack/health
```

> En PowerShell, `curl` es alias de `Invoke-WebRequest`. Usa **`curl.exe`** para evitar errores.

---

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| **Sin conexión** en búsqueda de productos | `VITE_API_BASE_URL` con API ID viejo | Paso 4 → copiar nuevo `BASE_URL` → reiniciar `npm run dev` |
| `aws: command not found` en Git Bash | AWS CLI solo en WSL | Los scripts usan `wsl aws`; o ejecuta desde WSL |
| Producto nuevo en JSON no aparece | No se recargó DynamoDB | `bash scripts/seed-catalog.sh` + F5 |
| Primera venta muy lenta | Cold start JVM | Normal (~15–20 s); las siguientes van más rápido |
| `export` falla en PowerShell | Comando de bash | Usa `$env:NOMBRE="valor"` |

---

## Scripts de referencia

| Script | Cuándo usarlo |
|--------|----------------|
| [`build-and-deploy-lambdas.sh`](scripts/build-and-deploy-lambdas.sh) | Compilar + desplegar Lambdas |
| [`localstack-deploy-lambdas.sh`](scripts/localstack-deploy-lambdas.sh) | Solo subir JAR (sin compilar) |
| [`localstack-setup-api.sh`](scripts/localstack-setup-api.sh) | Tablas + catálogo + API Gateway |
| [`seed-catalog.sh`](scripts/seed-catalog.sh) | Tras editar `productos.json` |
| [`consultar-venta.sh`](scripts/consultar-venta.sh) | Ver ventas en DynamoDB |

---

## Endpoints del API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Listar catálogo (DynamoDB `Productos`) |
| GET | `/api/productos/{id}` | Detalle producto |
| POST | `/api/v1/ventas` | Registrar venta en DynamoDB `Ventas`; descuenta stock |

Errores: **400** body inválido · **409** stock insuficiente · **404** producto no encontrado.

---

## Requisitos

| Herramienta | Uso |
|-------------|-----|
| **Docker** + LocalStack | Puerto **4566** |
| **Git Bash** o **WSL** | Scripts bash |
| **AWS CLI** | WSL o vía `wsl aws` |
| **JDK 17+** + **Maven** | Compilar Lambdas |
| **Node.js 18+** | Frontend y seed catálogo |

---

## Pruebas unitarias backend

```bash
cd lambda-ventas && mvn test
```

Windows si falla `.m2`: `cd lambda-ventas && .\mvn-test.ps1`

11 tests (5 productos + 6 ventas, incluye stock 409).

---

## Modos alternativos

**Spring Boot:** `.\start-dev.cmd` — dejar `VITE_API_BASE_URL` vacío.

**Mocks:** `VITE_USE_MSW=true` y `VITE_API_BASE_URL` vacío.

---

## Proceso SDD

| Spec | Ubicación |
|------|-----------|
| Backend Lambda | [`.kiro/specs/lambda-ventas/`](.kiro/specs/lambda-ventas/) |
| Frontend POS | [`.kiro/specs/pos-frontend/`](.kiro/specs/pos-frontend/) |

Más documentación: [lambda-ventas/README.md](lambda-ventas/README.md) · [INFRAESTRUCTURA-LOCALSTACK.md](docs/INFRAESTRUCTURA-LOCALSTACK.md) · [Guía de estudio](docs/GUIA-ESTUDIO-TECNICO.md)

---

## Evidencias de entrega

| Tipo | Carpeta |
|------|---------|
| Postman | [`docs/postman/`](docs/postman/) |
| Tests / DynamoDB / `.env` | [`docs/test.env/`](docs/test.env/) |
| UI del POS | [`docs/screenshots/`](docs/screenshots/) |

![Vista principal del POS](docs/screenshots/cap1.png)
