# POS Frontend (Supermarket)

Aplicación **React + TypeScript + Vite** para el punto de venta del monorepo [Supermarket-DECO](../README.md).

## Modos de backend

| Modo | Variables `.env.development` | Backend |
|------|------------------------------|---------|
| **Lambda (examen)** | `VITE_API_BASE_URL` + `VITE_USE_MSW=false` | LocalStack :4566 |
| **Spring Boot** | `VITE_API_BASE_URL` vacío, `VITE_USE_MSW=false` | `pos-sales-api` :8088 |
| **Mocks** | `VITE_API_BASE_URL` vacío, `VITE_USE_MSW=true` | MSW en el navegador |

Specs SDD: [`.kiro/specs/pos-frontend/`](../.kiro/specs/pos-frontend/)

## Arranque (modo Lambda)

1. Levantar infraestructura — ver [README raíz § Inicio rápido](../README.md#inicio-rápido).
2. Configurar `.env.development`:

```env
VITE_API_BASE_URL=http://localhost:4566/restapis/TU_API_ID/prod/_user_request_
VITE_USE_MSW=false
VITE_SALES_API_URL=
VITE_TERMINAL_ID=TERM-001
VITE_STORE_NAME=Supermercado POS
```

3. Iniciar:

```powershell
npm run dev
```

→ **http://localhost:5173/login**

## Endpoints consumidos

| Método | Ruta | Uso en UI |
|--------|------|-----------|
| GET | `/api/productos` | Búsqueda y catálogo (caché en memoria) |
| GET | `/api/productos/{id}` | Detalle por código de barras |
| POST | `/api/v1/ventas` | Checkout efectivo (`{ items, descuento }`) |

Tras checkout exitoso: recibo con `idVenta`, IVA y total del servidor. El catálogo se recarga para reflejar stock actualizado (**F5** si no ves cambios).

## Scripts npm

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo (http://localhost:5173) |
| `npm run build` | `tsc` + bundle producción |
| `npm test` | Vitest |
| `npm run capture:error-screenshot` | Captura UI sin conexión al API |

## Verificación (desde el monorepo)

Operaciones en Git Bash/WSL desde la **raíz** del repo:

```bash
# Confirmar venta en DynamoDB
bash scripts/consultar-venta.sh VNT-XXXXXXXX

# Recargar catálogo tras editar lambda-ventas/datos/productos.json
bash scripts/seed-catalog.sh
```

Detalle completo: [README raíz § Verificación operativa](../README.md#verificación-operativa).

## Arquitectura frontend

- **`config/api.ts`** — `VITE_API_BASE_URL`, endpoints Lambda
- **`adapters/http/`** — `resolvePorts.ts`, adapters Lambda y Spring
- **`adapters/http/lambdaCatalogCache.ts`** — caché GET productos
- **`infrastructure/http/lambdaWarmup.ts`** — precalentamiento `ventas-post`
- **`features/`** — sale, checkout, receipts, products-admin
- **`infrastructure/`** — fetch, stores, `receiptStore` (recibos Lambda en sesión)

**Justificación React:** estado reactivo (carrito, modales, loading) y llamadas async; hooks + arquitectura hexagonal desacoplan UI del backend Lambda o Spring.

## Capturas para entrega

| Captura | Archivo |
|---------|---------|
| Búsqueda productos | [`docs/screenshots/buscarp.png`](../docs/screenshots/buscarp.png) |
| Recibo venta | [`docs/screenshots/factura.png`](../docs/screenshots/factura.png) |
| Vista POS | [`docs/screenshots/cap1.png`](../docs/screenshots/cap1.png) |
| Error API caído | [`docs/screenshots/error-api-caido.png`](../docs/screenshots/error-api-caido.png) |
| Config `.env` | [`docs/test.env/.env.development.png`](../docs/test.env/.env.development.png) |

## Proceso SDD

Requisitos en `.kiro/specs/pos-frontend/requirements.md` (incl. **Requisito 15: Lambda**). Diseño de adaptadores y variables en `design.md` §11. Tareas en `tasks.md`.
