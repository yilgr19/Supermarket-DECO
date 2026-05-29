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
| stock_disponible | Number | se decrementa al registrar venta (UpdateItem atómico) |
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
- `VentaHandler`: valida payload, **valida y descuenta stock** en Productos (`descontarStock`), calcula totales, putItem en Ventas
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

## Descuento de stock (`VentaHandler.descontarStock`)

1. Agrupa cantidades por `id` de producto en el body.
2. Para cada producto: `GetItem` en tabla Productos; si no existe → 409.
3. Si `stock_disponible < cantidad solicitada` → HTTP **409** con mensaje identificando producto y stock disponible.
4. Si pasa validación: `UpdateItem` con:
   - `SET stock_disponible = stock_disponible - :q`
   - `ConditionExpression: stock_disponible >= :q` (evita condiciones de carrera)
5. Si la condición falla → 409.
6. Solo después persiste la venta en tabla Ventas.

## Integración frontend

Variable `VITE_API_BASE_URL` en `pos-frontend/.env.development` apunta a la URL base anterior. Adaptadores: `lambdaProductApiAdapter`, `lambdaSaleApiAdapter`. Tras checkout exitoso el frontend invalida caché del catálogo para reflejar stock actualizado.
