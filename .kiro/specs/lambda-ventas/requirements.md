# Requisitos — Backend Lambda POS (lambda-ventas)

## Introducción

Backend serverless para el POS de supermercado: **API Gateway + 2 Lambdas Java 17 + DynamoDB**, desplegado con **AWS SAM**. El frontend (`pos-frontend`) consume esta API vía `VITE_API_BASE_URL`.

---

## Requisitos funcionales

### RF-1: Listar productos

- **Endpoint:** `GET /api/productos`
- **Lambda:** `productos-get` (`ProductosHandler`)
- **Fuente:** tabla DynamoDB `Productos`
- **Respuesta 200:** JSON array de productos `{ id, nombre, descripcion?, precio, stock_disponible, estado, codigo_barras? }`
- **Errores:** 405 método incorrecto, 500 error DynamoDB

### RF-2: Detalle de producto

- **Endpoint:** `GET /api/productos/{id}`
- **Respuesta 200:** objeto producto
- **Respuesta 404:** `{ "error": "Producto no encontrado" }`

### RF-3: Registrar venta

- **Endpoint:** `POST /api/v1/ventas`
- **Lambda:** `ventas-post` (`VentaHandler`)
- **Body:**
  ```json
  {
  "items": [
    { "id": "prod-001", "nombre": "Arroz 1kg", "precio": 4500, "cantidad": 2 }
  ],
    "descuento": 0
  }
  ```
- **Validaciones:** items no vacío; cada ítem con id, nombre, precio, cantidad > 0; descuento ≥ 0 y ≤ subtotal
- **Cálculo:** IVA 19% redondeado sobre (subtotal − descuento); total = base + IVA
- **Persistencia:** `PutItem` en tabla `Ventas` (PK `idVenta`)
- **Respuesta 201:**
  ```json
  {
    "mensaje": "Venta procesada con éxito",
    "idVenta": "VNT-...",
    "items": [...],
    "subtotal": 5,
    "descuento": 0,
    "iva": 1,
    "total": 6
  }
  ```
- **Errores:** 400 body inválido, 405 método incorrecto, 500 error DynamoDB

### RF-4: CORS

- Origen `*`, métodos `GET, POST, OPTIONS` en API Gateway (stage `prod`)

---

## Requisitos no funcionales

- Java 17, timeout 30s, memoria 512 MB
- LocalStack en desarrollo (`DYNAMODB_ENDPOINT`); AWS real en producción
- Sin credenciales en el repositorio

---

## Criterios de aceptación — pruebas unitarias

### ProductosHandler

| ID | Escenario | Entrada | Resultado esperado |
|----|-----------|---------|-------------------|
| PT-1 | Catálogo con datos | GET sin path id, scan con ítems | HTTP 200, JSON con productos |
| PT-2 | Tabla vacía | GET, scan sin ítems | HTTP 200, `[]` |
| PT-3 | Producto inexistente | GET `/api/productos/{id}` | HTTP 404 |
| PT-4 | Error conexión DynamoDB | scan lanza excepción | HTTP 500 |

### VentaHandler

| ID | Escenario | Entrada | Resultado esperado |
|----|-----------|---------|-------------------|
| VT-1 | Venta válida | POST body con items | HTTP 201, idVenta, totales, putItem |
| VT-2 | Body vacío | POST sin body | HTTP 400 |
| VT-3 | Items vacíos | POST `{ "items": [] }` | HTTP 400 |
| VT-4 | Ítem incompleto | POST sin cantidad | HTTP 400 |
| VT-5 | Error conexión DynamoDB | putItem lanza excepción | HTTP 500 |

---

## Fuera de alcance (v1)

- CRUD productos vía Lambda
- Historial GET ventas
- Descuento de stock en tabla Productos al vender
- Autenticación IAM en API Gateway
