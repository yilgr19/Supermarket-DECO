# POS Frontend (Supermarket)

Aplicación **React + TypeScript + Vite** para el punto de venta.

## Modos de backend

| Modo | Variables | Uso |
|------|-----------|-----|
| **Spring Boot** | `VITE_SALES_API_URL` vacío + proxy Vite | Desarrollo con `pos-sales-api` :8088 |
| **Lambda / API Gateway** | `VITE_API_BASE_URL` + `VITE_USE_MSW=false` | Examen serverless + LocalStack |

Specs SDD: [`.kiro/specs/pos-frontend/`](../.kiro/specs/pos-frontend/)

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (http://localhost:5173) |
| `npm run build` | `tsc` + bundle producción |
| `npm test` | Vitest |

## Configuración Lambda (evaluación)

1. Levantar backend: ver [lambda-ventas/README.md](../lambda-ventas/README.md)
2. Copiar URL base a `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:4566/restapis/TU_API_ID/prod/_user_request_
VITE_USE_MSW=false
```

3. `npm run dev`

Endpoints consumidos:

- `GET /api/productos` — búsqueda y catálogo
- `POST /api/v1/ventas` — checkout (payload `{ items, descuento }`)

## Proceso SDD

Los requisitos de vistas y contrato API están en `.kiro/specs/pos-frontend/requirements.md` (incl. **Requisito 15: Lambda**). El diseño documenta `VITE_API_BASE_URL` y adaptadores en `design.md` §11. Las tareas de implementación están en `tasks.md`.

**Justificación React:** el POS requiere estado reactivo (carrito, modales, loading) y llamadas async al API; React hooks + arquitectura hexagonal (`ports` / `adapters`) mantienen la UI desacoplada del backend Lambda o Spring.

## Capturas para entrega

### UI (`docs/screenshots/`)

- Listado/búsqueda productos — [`buscarp.png`](../docs/screenshots/buscarp.png)
- Recibo tras venta — [`factura.png`](../docs/screenshots/factura.png)
- Vista general POS — [`cap1.png`](../docs/screenshots/cap1.png)
- **Error API caído** — [`error-api-caido.png`](../docs/screenshots/error-api-caido.png)

Regenerar la captura de error (API inalcanzable):

```powershell
npm run capture:error-screenshot
```

Usa Playwright con `VITE_API_BASE_URL=http://127.0.0.1:59999` y muestra el mensaje *Sin conexión, verifique su red* en el modal de búsqueda.

### Configuración Lambda

Ver [`docs/test.env/.env.development.png`](../docs/test.env/.env.development.png).

## Estructura (`src`)

- **`config/api.ts`** — `VITE_API_BASE_URL`, endpoints Lambda
- **`adapters/http/`** — `resolvePorts.ts`, adapters Lambda y Spring
- **`features/`** — pantallas (sale, checkout, receipts, products-admin)
- **`infrastructure/`** — fetch, stores, `receiptStore` (recibos Lambda en sesión)
