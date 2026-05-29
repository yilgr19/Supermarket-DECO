# Lambda Ventas (Java 17 + SAM + DynamoDB)

Backend serverless del POS: **API Gateway**, Lambdas **`productos-get`** y **`ventas-post`**, tablas DynamoDB **Productos** y **Ventas**.

Especificaciones SDD: [`.kiro/specs/lambda-ventas/`](../.kiro/specs/lambda-ventas/) (requirements, design, tasks).

## Arquitectura

```
Frontend (pos-frontend) ──HTTP──► API Gateway SupermarketAPI
                                        ├── GET  /api/productos[/{id}]  → productos-get
                                        └── POST /api/v1/ventas         → ventas-post
                                                    │
                                                    ▼
                                              DynamoDB Productos / Ventas
```

## Requisitos

- JDK 17, Maven 3.9+, AWS SAM CLI
- LocalStack (desarrollo) o cuenta AWS (producción)
- AWS CLI configurado (`AWS_PROFILE=localstack` en LocalStack)

## Despliegue local (LocalStack / WSL)

```bash
export AWS_PROFILE=localstack
export AWS_DEFAULT_REGION=us-east-1

# Opción A: script completo
./scripts/arrancar.sh

# Opción B: manual (si CloudFormation falla en LocalStack)
bash ../scripts/localstack-deploy-lambdas.sh   # desde monorepo supermarket
bash ../scripts/localstack-setup-api.sh
```

Build y deploy SAM:

```bash
sam build --template-file template.yml
sam deploy --config-env localstack --no-confirm-changeset --no-fail-on-empty-changeset
```

## URL base API Gateway

Tras desplegar, obtener el API ID:

```bash
aws --endpoint-url=http://localhost:4566 apigateway get-rest-apis --output json
```

URL LocalStack:

```text
http://localhost:4566/restapis/<API_ID>/prod/_user_request_
```

Copiar a `pos-frontend/.env.development`:

```env
VITE_API_BASE_URL=http://localhost:4566/restapis/<API_ID>/prod/_user_request_
VITE_USE_MSW=false
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Lista catálogo |
| GET | `/api/productos/{id}` | Detalle producto |
| POST | `/api/v1/ventas` | Registrar venta |

### Ejemplo POST venta (curl / Postman)

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

## URL base activa (LocalStack)

```text
http://localhost:4566/restapis/s2arvqarhx/prod/_user_request_
```

Variable Postman `base_url` = URL anterior sin barra final.

## Evidencias de entrega

### Postman (`docs/postman/`)

| Captura | Endpoint | Resultado |
|---------|----------|-----------|
| [Get productos.png](../docs/postman/Get%20productos.png) | GET `/api/productos` | 200 OK |
| [get productos id.png](../docs/postman/get%20productos%20id.png) | GET `/api/productos/prod-001` | 200 OK |
| [Get producto no encontrado.png](../docs/postman/Get%20producto%20no%20encontrado.png) | GET `/api/productos/prod-999` | 404 |
| [post ventas exito.png](../docs/postman/post%20ventas%20exito.png) | POST `/api/v1/ventas` | 201 Created |
| [post venta error.png](../docs/postman/post%20venta%20error.png) | POST body inválido | 400 Bad Request |

### Pruebas unitarias y verificación (`docs/test.env/`)

| Captura | Descripción |
|---------|-------------|
| [Test wsl.png](../docs/test.env/Test%20%20wsl.png) | `mvn test` — BUILD SUCCESS, 10 tests |
| [consultar venta realizada postman.png](../docs/test.env/consultar%20venta%20realizada%20postman.png) | Venta `VNT-1780072628946` en DynamoDB |
| [.env.development.png](../docs/test.env/.env.development.png) | Configuración `VITE_API_BASE_URL` en frontend |

## Pruebas unitarias

DynamoDB se **mockea** con Mockito (sin LocalStack en tests):

```bash
mvn test
```

Casos cubiertos (ver `requirements.md` § Criterios de aceptación):

- Productos: catálogo OK, tabla vacía, 404, error conexión
- Ventas: registro OK, body inválido, items vacíos, error conexión

> **Entrega:** captura en [`docs/test.env/Test wsl.png`](../docs/test.env/Test%20%20wsl.png) o ejecutar `.\mvn-test.ps1` / WSL `mvn test`.

### Windows (error `.m2\repository`)

Si aparece `Could not create local repository at C:\Users\...\.m2\repository`, tu perfil de Windows no puede crear esa carpeta. Opciones:

**Opción A — WSL (recomendada):**

```bash
wsl bash -c "cd /mnt/c/Users/yilgr/OneDrive/Desktop/supermarket/lambda-ventas && mvn test"
```

**Opción B — PowerShell con repo alternativo + JDK 21:**

```powershell
cd lambda-ventas
.\mvn-test.ps1
```

Usa `maven-settings-local.xml` (caché en `%LOCALAPPDATA%\m2\repository`) y JDK 21. Con Java 23, Mockito puede fallar al mockear DynamoDB.

## Postman

Importar colección o probar manualmente:

1. **GET** `{BASE_URL}/api/productos` → 200, array JSON
2. **POST** `{BASE_URL}/api/v1/ventas` → 201, `idVenta`
3. **POST** body inválido `{}` → 400, `{ "error": "..." }`

> **Entrega:** capturas en [`docs/postman/`](../docs/postman/) (ver tabla arriba).

## Proceso SDD

1. Se escribieron **requirements.md**, **design.md** y **tasks.md** en `.kiro/specs/lambda-ventas/` **antes** de cerrar handlers y tests.
2. Cada endpoint y caso de prueba (PT-*, VT-*) está trazado en requirements.
3. Los handlers implementan RF-1 a RF-3; las pruebas verifican los criterios de aceptación.
4. El frontend consume el contrato documentado en design § Integración frontend.

## Estructura

```
lambda-ventas/
├── src/main/java/com/supermarket/lambda/
│   ├── ProductosHandler.java
│   ├── VentaHandler.java
│   ├── config/DynamoDbClientFactory.java
│   └── util/ApiResponse.java
├── src/test/java/com/supermarket/lambda/
│   ├── ProductosHandlerTest.java
│   └── VentaHandlerTest.java
├── template.yml
├── samconfig.toml
├── datos/productos.json
└── scripts/
```

## Datos de ejemplo

- Catálogo: `datos/productos.json` (cargado por `arrancar.sh` o `localstack-setup-api.sh`)
- Consultar venta: `bash ../scripts/consultar-venta.sh VNT-...`
