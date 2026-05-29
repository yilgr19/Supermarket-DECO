# Lambda Ventas (Java 17 + SAM + DynamoDB)

Backend serverless del POS: **API Gateway**, Lambdas **`productos-get`** y **`ventas-post`**, tablas DynamoDB **Productos** y **Ventas**.

Monorepo: [Supermarket-DECO](../README.md) · Specs SDD: [`.kiro/specs/lambda-ventas/`](../.kiro/specs/lambda-ventas/)

## Arquitectura

```
pos-frontend ──HTTP──► API Gateway SupermarketAPI
                           ├── GET  /api/productos[/{id}]  → productos-get
                           └── POST /api/v1/ventas         → ventas-post
                                         │
                                         ▼
                                   DynamoDB Productos / Ventas
                                   (ventas-post descuenta stock)
```

## Despliegue (LocalStack)

Desde la **raíz del monorepo** (`supermarket/`), Git Bash o WSL:

```bash
export AWS_PROFILE=localstack AWS_DEFAULT_REGION=us-east-1 AWS_ENDPOINT_URL=http://localhost:4566

bash scripts/build-and-deploy-lambdas.sh   # compilar + desplegar
bash scripts/localstack-setup-api.sh       # tablas + catálogo + API Gateway
```

Solo actualizar JAR tras cambios en Java:

```bash
bash scripts/localstack-deploy-lambdas.sh
```

> Git Bash sin AWS CLI: los scripts en `scripts/lib/aws-local.sh` usan `wsl aws` automáticamente.

### URL base API Gateway

```text
http://localhost:4566/restapis/<API_ID>/prod/_user_request_
```

Copiar a `pos-frontend/.env.development` como `VITE_API_BASE_URL`.

Ejemplo activo en desarrollo:

```text
http://localhost:4566/restapis/s2arvqarhx/prod/_user_request_
```

## Endpoints

| Método | Ruta | Handler | Descripción |
|--------|------|---------|-------------|
| GET | `/api/productos` | ProductosHandler | Lista catálogo (scan DynamoDB) |
| GET | `/api/productos/{id}` | ProductosHandler | Detalle o 404 |
| POST | `/api/v1/ventas` | VentaHandler | Registra venta, descuenta stock, IVA 19% |

### Ejemplo POST venta

```bash
curl -X POST "${BASE_URL}/api/v1/ventas" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "prod-001", "nombre": "Arroz 1kg", "precio": 4500, "cantidad": 1}
    ],
    "descuento": 0
  }'
```

Respuesta **201** o **409** si stock insuficiente.

## Catálogo (`datos/productos.json`)

El JSON **no se lee en runtime**. Es semilla para DynamoDB.

```bash
# Tras agregar/editar productos en el JSON
bash scripts/seed-catalog.sh
```

Catálogo inicial también se carga con `localstack-setup-api.sh`.

Precios de ejemplo (COP): Arroz 4500, Leche 5200, Pan 6800, Shampoo 15000.

## Verificar ventas

```bash
bash scripts/consultar-venta.sh VNT-1780078872579   # una venta
bash scripts/consultar-venta.sh                      # todas
```

Ver [README raíz § Verificación operativa](../README.md#verificación-operativa).

## Pruebas unitarias

DynamoDB se **mockea** con Mockito (sin LocalStack en tests):

```bash
# WSL
cd lambda-ventas && mvn test

# Windows (si falla C:\Users\...\.m2)
cd lambda-ventas && .\mvn-test.ps1
```

**11 tests:** PT-1…PT-4 (productos) · VT-1…VT-6 (ventas, incluye stock 409).

Captura de referencia: [`docs/test.env/Test wsl.png`](../docs/test.env/Test%20%20wsl.png)

## Evidencias Postman

| Captura | Resultado |
|---------|-----------|
| [Get productos.png](../docs/postman/Get%20productos.png) | GET 200 |
| [post ventas exito.png](../docs/postman/post%20ventas%20exito.png) | POST 201 |
| [post venta error.png](../docs/postman/post%20venta%20error.png) | POST 400 |
| [Get producto no encontrado.png](../docs/postman/Get%20producto%20no%20encontrado.png) | GET 404 |

Más en [`docs/postman/`](../docs/postman/).

## Proceso SDD

1. **requirements.md**, **design.md**, **tasks.md** en `.kiro/specs/lambda-ventas/` antes del código.
2. Criterios PT-* y VT-* trazados a tests.
3. RF-1 a RF-3 implementados en handlers; frontend consume contrato en `design.md`.

## Estructura

```
lambda-ventas/
├── src/main/java/com/supermarket/lambda/
│   ├── ProductosHandler.java
│   ├── VentaHandler.java          # valida stock + descuenta + PutItem Ventas
│   ├── config/DynamoDbClientFactory.java
│   └── util/ApiResponse.java
├── src/test/java/                   # ProductosHandlerTest, VentaHandlerTest
├── template.yml
├── samconfig.toml
├── datos/productos.json             # semilla catálogo → DynamoDB
└── mvn-test.ps1                     # tests en Windows
```

Scripts de deploy del monorepo: [`scripts/`](../scripts/)
