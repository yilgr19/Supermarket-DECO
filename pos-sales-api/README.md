# POS Sales API

API REST de ventas (contrato compatible con `pos-frontend`), implementada según `.kiro/specs/pos-sales-platform/`.

## Requisitos

- JDK 17
- Maven 3.9+

## Arranque

```bash
mvn -f pos-sales-api/pom.xml spring-boot:run
```

Por defecto escucha en el puerto **8080** (igual que el mock MSW del frontend).

## Frontend

Configure la URL base del bundle Vite para apuntar a esta API:

```properties
VITE_SALES_API_URL=http://localhost:8080
```

Opcional: mismo host y puerto sin variable (el cliente ya usa `http://localhost:8080` por defecto).

### Cliente en la venta (crédito)

Tras crear la venta, el front debe **enlazar el cliente en el servidor** antes de un pago a crédito:

`PATCH /api/v1/sales/{saleId}` con cuerpo `{ "customerId": "<id>" | null }`.

El encabezado `X-Cashier-Id` (enviado desde el store de sesión) se usa al crear la venta; si falta, se aplica `pos.sales.default-cashier-id`.

## Catálogo y clientes en memoria

Este módulo incluye stubs (`InMemoryProductCatalog`, `InMemoryCustomerDirectory`) que sustituyen las APIs externas hasta integrar HTTP real.

## OpenAPI

Con el servicio en marcha: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).

## Pruebas

```bash
mvn -f pos-sales-api/pom.xml verify
```
