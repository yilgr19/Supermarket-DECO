# Diseño — Backend Lambda POS (lambda-ventas)

## Arquitectura

```
Cliente (pos-frontend)
    │ HTTP
    ▼
API Gateway SupermarketAPI (stage prod)
    ├── GET  /api/productos      → Lambda productos-get
    ├── GET  /api/productos/{id} → Lambda productos-get
    └── POST /api/v1/ventas      → Lambda ventas-post
              │
              ▼
         DynamoDB
         ├── Productos (PK: id)
         └── Ventas    (PK: idVenta)
```

## Stack

| Componente | Tecnología |
|------------|------------|
| IaC | AWS SAM (`template.yml`) |
| Runtime | Java 17 |
| SDK | AWS SDK v1 Document API |
| JSON | Jackson |
| Pruebas | JUnit 5 + Mockito |
| Local | LocalStack :4566 + `sam deploy --config-env localstack` |

## Tablas DynamoDB

### Productos

| Atributo | Tipo | Notas |
|----------|------|-------|
| id | String (PK) | ej. prod-001 |
| nombre | String | |
| precio | Number | |
| stock_disponible | Number | no se decrementa en v1 |
| estado | String | activo/inactivo |
| descripcion | String | opcional |
| codigo_barras | String | opcional |

### Ventas

| Atributo | Tipo | Notas |
|----------|------|-------|
| idVenta | String (PK) | VNT-{timestamp} |
| fecha | String | ISO-8601 |
| items | List | id, nombre, precio, cantidad |
| subtotal | Number | |
| descuento | Number | |
| iva | Number | 19% redondeado |
| total | Number | |

## Handlers

- `ProductosHandler`: inyección de `DynamoDB` para tests; scan (lista) o getItem (por id)
- `VentaHandler`: valida payload, calcula totales, putItem en Ventas
- `DynamoDbClientFactory`: singleton; endpoint LocalStack vía `DYNAMODB_ENDPOINT`
- `ApiResponse`: helpers JSON + CORS

## URL base (LocalStack)

```text
http://localhost:4566/restapis/{API_ID}/prod/_user_request_
```

Output SAM: `ApiUrlLocalStack`

## Estructura del proyecto

```
lambda-ventas/
├── .kiro/specs/          → en monorepo: ../.kiro/specs/lambda-ventas/
├── src/main/java/        → handlers
├── src/test/java/        → pruebas unitarias con mocks DynamoDB
├── template.yml          → SAM
├── samconfig.toml
├── datos/productos.json  → seed catálogo
└── scripts/arrancar.sh
```

## Integración frontend

Variable `VITE_API_BASE_URL` en `pos-frontend/.env.development` apunta a la URL base anterior. Adaptadores: `lambdaProductApiAdapter`, `lambdaSaleApiAdapter`.
