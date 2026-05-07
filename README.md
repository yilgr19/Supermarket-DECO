# Supermarket — taller POS (SDD)

Monorepo liviano: **documentación y especificaciones en la raíz**; **única aplicación web** aislada en su propia carpeta (sin mezclar con el futuro backend Java).

## Estructura

| Ruta | Contenido |
|------|------------|
| **`pos-frontend/`** | Cliente POS: React 18, TypeScript, Vite, Tailwind, MSW en desarrollo. **Todo el código de frontend vive aquí.** |
| **`docs/`** | Taller y SDD (`WORKSHOP-API.md`, `SDD-*-POS.md`). |
| **`.kiro/specs/`** | Especificaciones generadas con Kiro (`pos-frontend`, `pos-sales-platform`, etc.). |

No hay backend Spring en este repositorio por ahora; el front puede usar **MSW** (`VITE_USE_MSW=true`) o apuntar a una API real (`VITE_SALES_API_URL`).

## Interfaz — capturas / UI screenshots

Ejemplos del cliente web **Supermercado POS** (Vite dev, tema claro, bilingüe ES/EN).

Las imágenes siguientes apuntan a **`docs/screenshots/login.png`** y **`docs/screenshots/punto-de-venta.png`**. Solo se verán en GitHub cuando **existan en el mismo commit que este README** (sube los PNG, `git add`, `git commit`, `git push`). Si aparecen enlaces rotos en la vista del repo, abre  
`https://github.com/yilgr19/Supermarket-DECO/raw/main/docs/screenshots/login.png`  
(sustituye usuario/repo/rama si aplica): un **404** confirma que el archivo **no llegó al remoto** o tiene otro nombre (mayúsculas cuentan en el servidor).

### Inicio de sesión (`/login`)

![Pantalla de inicio de sesión — Cajero y terminal](docs/screenshots/login.png)

Tarjeta centrada sobre fondo en degradado: identificadores de **cajero** y **terminal**, y pie con sesión demo local.

### Punto de venta (`/sale`)

![Vista principal POS — Productos, cliente, carrito y acciones](docs/screenshots/punto-de-venta.png)

Cabecera oscura con estado de venta, panel de búsqueda de productos y cliente, área del carrito, totales, descuentos y acciones Congelar / Cancelar / Checkout.

**Incluir en el commit:** desde la raíz del repo, coloca tus dos PNG con esos nombres exactos y ejecuta `git add docs/screenshots/*.png`.

## Arranque del frontend

```bash
cd pos-frontend
npm install --legacy-peer-deps
npm run dev
```

Opcional: renombrar `pos-frontend` → `frontend` cuando ningún proceso tenga la carpeta abierta (OneDrive/IDE a veces bloquean el cambio de nombre).
