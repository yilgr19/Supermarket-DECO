# POS Frontend (Supermarket)

Aplicación **React + TypeScript + Vite** para el punto de venta. Consume la Sales API REST (`VITE_SALES_API_URL`). En desarrollo, **Mock Service Worker** puede simular el backend cuando `VITE_USE_MSW` no es `false`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (http://localhost:5173) |
| `npm run build` | `tsc` + bundle producción |
| `npm run preview` | Previsualiza el build |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright |

Copia `.env.example` → `.env` y ajusta URLs y terminal.

## Estructura de carpetas (`src`)

- **`adapters/http`** — llamadas REST (productos, clientes, ventas).
- **`core`** — tipos y puertos del dominio.
- **`features`** — pantallas y hooks por módulo (auth, sale, checkout, …).
- **`infrastructure`** — axios, errores, stores Zustand.
- **`mocks`** — handlers MSW y backend en memoria (solo demo/dev).
- **`shared`** — componentes y hooks reutilizables.
