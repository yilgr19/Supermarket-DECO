# Plan de Implementación / Implementation Plan
## POS Frontend — Supermarket Point of Sale

---

## Instrucciones / Instructions

**ES:** Las tareas están ordenadas por dependencia. Cada tarea referencia los requisitos y secciones de diseño correspondientes. El proyecto se genera en la carpeta `pos-frontend/` en la raíz del workspace.

**EN:** Tasks are ordered by dependency. Each task references the corresponding requirements and design sections. The project is generated in the `pos-frontend/` folder at the workspace root.

---

- [ ] 1. Bootstrap del proyecto / Project bootstrap
  - [ ] 1.1 Crear proyecto Vite + React + TypeScript: `npm create vite@latest pos-frontend -- --template react-ts`
  - [ ] 1.2 Instalar dependencias: `react-router-dom`, `zustand`, `axios`, `@zxing/browser`, `tailwindcss`, `@radix-ui/react-dialog`, `@radix-ui/react-label`, `lucide-react`
  - [ ] 1.3 Instalar dependencias de desarrollo: `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `msw`, `playwright`, `eslint`, `prettier`
  - [ ] 1.4 Configurar Tailwind CSS: `tailwind.config.ts` con paths `./src/**/*.{ts,tsx}`
  - [ ] 1.5 Configurar Vitest en `vite.config.ts` con coverage threshold ≥70% para `src/core/**`
  - [ ] 1.6 Crear archivo `.env` con `VITE_SALES_API_URL`, `VITE_TERMINAL_ID`, `VITE_STORE_NAME`
  - [ ] 1.7 Crear estructura de carpetas según Design §3.1: `core/`, `adapters/`, `infrastructure/`, `features/`, `shared/`
  - **Referencia / Reference:** Design §2, §3.1, §11

- [ ] 2. Tipos, puertos y cliente HTTP / Types, ports and HTTP client
  - [ ] 2.1 Crear tipos en `src/core/types/`: `sale.types.ts`, `product.types.ts`, `customer.types.ts`, `receipt.types.ts` según Design §4
  - [ ] 2.2 Crear interfaces de puertos en `src/core/ports/`: `SalePort.ts`, `ProductPort.ts`, `CustomerPort.ts` según Design §5
  - [ ] 2.3 Crear `ApiError` class con campos: `status`, `message`, `outOfStockItems`
  - [ ] 2.4 Implementar `src/infrastructure/http/axiosClient.ts`:
    - Instancia Axios con `baseURL = import.meta.env.VITE_SALES_API_URL`
    - Interceptor de request: agrega `X-Cashier-Id` desde sessionStore
    - Interceptor de response: captura errores y lanza `ApiError` tipado
  - [ ] 2.5 Escribir pruebas unitarias para el mapeo de errores del interceptor (503, 409, 422, 404, network error)
  - **Referencia / Reference:** Requirements §12; Design §6

- [ ] 3. Estado global y autenticación / Global state and authentication
  - [ ] 3.1 Implementar `src/infrastructure/store/sessionStore.ts` (Zustand): `cashierId`, `terminalId`, `isAuthenticated`, `login()`, `logout()`
  - [ ] 3.2 Implementar `src/infrastructure/store/saleStore.ts` (Zustand): `activeSale`, `setActiveSale()`, `clearSale()`
  - [ ] 3.3 Implementar `src/features/auth/LoginPage.tsx`: formulario con campos Cashier ID y Terminal ID, validación de campos no vacíos, llama `sessionStore.login()` y redirige a `/sale`
  - [ ] 3.4 Implementar `src/features/auth/useAuth.ts`: hook que expone estado de sesión y función logout
  - [ ] 3.5 Implementar `ProtectedRoute` component: redirige a `/login` si `!isAuthenticated`
  - [ ] 3.6 Configurar `src/router.tsx` con todas las rutas de Design §8, envolviendo rutas protegidas con `ProtectedRoute`
  - [ ] 3.7 Escribir pruebas de componente para `LoginPage`: submit con campos vacíos, submit exitoso, redirección
  - **Referencia / Reference:** Requirements §14; Design §7, §8

- [ ] 4. Adaptadores HTTP / HTTP Adapters
  - [ ] 4.1 Implementar `src/adapters/http/productApiAdapter.ts` implementando `ProductPort`:
    - `searchByName(name)` → `GET /api/v1/products/search?name={name}`
    - `searchByBarcode(barcode)` → `GET /api/v1/products/barcode/{barcode}`
  - [ ] 4.2 Implementar `src/adapters/http/customerApiAdapter.ts` implementando `CustomerPort`:
    - `searchByName(name)` → `GET /api/v1/customers/search?name={name}`
    - `searchByDocument(doc)` → `GET /api/v1/customers/document/{doc}`
  - [ ] 4.3 Implementar `src/adapters/http/salesApiAdapter.ts` implementando `SalePort` con todos los métodos de Design §5
  - [ ] 4.4 Configurar MSW handlers en `src/mocks/handlers.ts` para todos los endpoints usados en pruebas
  - **Referencia / Reference:** Design §5, §6

- [ ] 5. Búsqueda de productos y escaneo de barcode / Product search and barcode scanning
  - [ ] 5.1 Implementar `src/features/products/useProductSearch.ts`: estado `query`, `results`, `isLoading`, `error`; debounce de 300ms en búsqueda por nombre; búsqueda inmediata por barcode
  - [ ] 5.2 Implementar `src/features/products/ProductSearch.tsx`:
    - Input de búsqueda por nombre con debounce
    - Lista de resultados con: nombre, barcode, precio, stock, categoría
    - Botón "Agregar" por cada resultado
    - Estado de carga y mensaje de error 503
    - Mensaje "Sin resultados" cuando la lista está vacía
  - [ ] 5.3 Implementar `src/features/products/BarcodeScanner.tsx`:
    - Botón para activar cámara con `@zxing/browser`
    - Vista previa de cámara en tiempo real
    - Input manual de barcode con handler en `onKeyDown Enter`
    - Al detectar barcode: llama `searchByBarcode` y agrega al carrito automáticamente
    - Manejo de error si barcode no encontrado (404)
  - [ ] 5.4 Escribir pruebas de componente para `ProductSearch`: búsqueda exitosa, estado de carga, error 503, sin resultados
  - [ ] 5.5 Escribir pruebas de componente para `BarcodeScanner`: entrada manual, barcode no encontrado
  - **Referencia / Reference:** Requirements §1, §2; Design §9.1

- [ ] 6. Búsqueda y selección de clientes / Customer search and selection
  - [ ] 6.1 Implementar `useCustomerSearch.ts`: búsqueda por nombre (debounce 300ms) y por documento (exacto)
  - [ ] 6.2 Implementar `CustomerSearch.tsx`:
    - Input de búsqueda con toggle nombre/documento
    - Lista de resultados con: nombre, documento, estado de crédito (badge de color: verde APPROVED, rojo REJECTED, amarillo PENDING)
    - Botón "Seleccionar" por cada resultado
    - Al seleccionar: asocia cliente a la venta activa vía `saleStore`
  - [ ] 6.3 Mostrar cliente seleccionado en el panel de venta con su estado de crédito
  - [ ] 6.4 Escribir pruebas de componente para `CustomerSearch`: resultados, selección, badge de estado de crédito
  - **Referencia / Reference:** Requirements §4; Design §9.1

- [ ] 7. Carrito y gestión de la venta / Cart and sale management
  - [ ] 7.1 Implementar `src/features/sale/useSale.ts`:
    - `createSale()`: llama adapter, guarda en saleStore
    - `addItemToSale(productId?, barcode?, quantity)`: llama adapter, actualiza saleStore
    - `updateItemQuantity(itemId, quantity)`: llama adapter, actualiza saleStore
    - `removeItem(itemId)`: llama adapter, actualiza saleStore
    - `applyDiscount(type, value)`: llama adapter, actualiza saleStore
    - `removeDiscount()`: llama adapter con value=0
    - Manejo de errores: 409 (stock), 422 (estado inválido), 503
  - [ ] 7.2 Implementar `src/features/sale/CartItem.tsx`:
    - Muestra: nombre producto, precio unitario, input de cantidad (mín 1), total de línea
    - Botón eliminar con confirmación
    - Deshabilitar controles si sale.status !== 'ACTIVE'
  - [ ] 7.3 Implementar `src/features/sale/CartPanel.tsx`:
    - Lista de `CartItem` components
    - Mensaje "Carrito vacío" si no hay ítems
    - Manejo de error 409 con lista de productos sin stock
  - [ ] 7.4 Implementar `src/features/sale/TotalsSummary.tsx`:
    - Muestra subtotal, impuesto (19%), descuento, total desde `activeSale`
    - Formato de moneda colombiana (COP)
  - [ ] 7.5 Implementar `src/features/sale/DiscountForm.tsx`:
    - Toggle entre PERCENTAGE y FIXED_AMOUNT
    - Input de valor con validación (> 0)
    - Botón aplicar y botón remover descuento
    - Muestra error 422 si descuento excede subtotal
  - [ ] 7.6 Escribir pruebas unitarias para `useSale`: crear venta, agregar ítem, fusionar duplicado, actualizar cantidad, eliminar, aplicar descuento, error 409
  - [ ] 7.7 Escribir pruebas de componente para `CartPanel` y `CartItem`
  - **Referencia / Reference:** Requirements §3, §5; Design §9.1

- [ ] 8. Congelamiento, reanudación y cancelación / Freeze, resume and cancellation
  - [ ] 8.1 Agregar a `useSale.ts`:
    - `freezeSale()`: llama adapter, actualiza estado en saleStore
    - `resumeSale(saleId)`: llama adapter, carga venta en saleStore
    - `cancelSale(reason)`: llama adapter, actualiza estado en saleStore
  - [ ] 8.2 Implementar `src/features/sale/FrozenSalesList.tsx`:
    - Llama `listFrozen(terminalId)` al montar
    - Lista ventas congeladas con: ID, fecha de congelamiento, total, número de ítems
    - Botón "Reanudar" por cada venta
    - Manejo de venta expirada (status CANCELLED): muestra badge "Expirada" y deshabilita reanudar
  - [ ] 8.3 Agregar botones en `SalePage.tsx`:
    - "❄ Congelar": visible solo si status === 'ACTIVE', llama `freezeSale()`
    - "✕ Cancelar": visible si status === 'ACTIVE' o 'FROZEN', abre `CancelDialog`
  - [ ] 8.4 Implementar `CancelDialog.tsx`: modal con textarea de motivo (máx 255 chars, contador de caracteres), botones Cancelar/Confirmar
  - [ ] 8.5 Escribir pruebas de componente para `FrozenSalesList` y `CancelDialog`
  - **Referencia / Reference:** Requirements §8, §9; Design §9.1

- [ ] 9. Checkout / Checkout
  - [ ] 9.1 Implementar `src/features/checkout/useCheckout.ts`:
    - `checkoutCash(amountReceived)`: valida amountReceived ≥ total localmente, llama adapter, retorna Receipt
    - `checkoutCredit()`: valida cliente asociado y creditStatus === 'APPROVED' localmente, llama adapter, retorna Receipt
    - Manejo de errores: 409 (stock), 422 (crédito no aprobado, cliente requerido), 503
  - [ ] 9.2 Implementar `src/features/checkout/CashPaymentForm.tsx`:
    - Input "Monto recibido" con validación ≥ total
    - Muestra vuelto calculado en tiempo real mientras el cajero escribe
    - Deshabilita confirmar si monto < total
  - [ ] 9.3 Implementar `src/features/checkout/CreditPaymentForm.tsx`:
    - Muestra cliente asociado y su estado de crédito
    - Bloquea con mensaje si no hay cliente o creditStatus !== 'APPROVED'
  - [ ] 9.4 Implementar `src/features/checkout/CheckoutModal.tsx`:
    - Modal con toggle Efectivo/Crédito
    - Renderiza `CashPaymentForm` o `CreditPaymentForm` según selección
    - Botón "Confirmar Pago" con estado de carga
    - Al éxito: navega a `/receipt/:transactionId`
    - Muestra error 409 con lista de ítems sin stock
    - Muestra error 503 con opción de reintentar
  - [ ] 9.5 Escribir pruebas unitarias para `useCheckout`: cash exitoso, cash monto insuficiente, credit sin cliente, credit no aprobado, 409, 503
  - [ ] 9.6 Escribir pruebas de componente para `CheckoutModal`, `CashPaymentForm`, `CreditPaymentForm`
  - **Referencia / Reference:** Requirements §6, §7, §12; Design §9.2

- [ ] 10. Recibos / Receipts
  - [ ] 10.1 Implementar `src/features/receipts/useReceipt.ts`: `getReceipt(transactionId)` → llama `GET /api/v1/receipts/:transactionId`
  - [ ] 10.2 Implementar `src/features/receipts/ReceiptView.tsx`:
    - Muestra todos los campos del recibo según Design §9.3
    - Para CASH: muestra monto recibido y vuelto
    - Para CREDIT: muestra referencia de crédito
    - Para devoluciones: muestra TransactionId original y tipo de devolución
    - Para ventas a crédito devueltas: muestra "Nota de Crédito" en lugar de reembolso
  - [ ] 10.3 Implementar `src/features/receipts/ReceiptPage.tsx`:
    - Carga recibo por `transactionId` de los params de ruta
    - Renderiza `ReceiptView`
    - Botón "🖨 Imprimir" que llama `window.print()`
    - Botón "Nueva Venta" que limpia saleStore y navega a `/sale`
    - Botón "Procesar Devolución" que navega a `/sale/:saleId/return`
  - [ ] 10.4 Escribir pruebas de componente para `ReceiptView`: recibo CASH, recibo CREDIT, recibo de devolución
  - **Referencia / Reference:** Requirements §10; Design §9.3

- [ ] 11. Devoluciones / Returns
  - [ ] 11.1 Implementar `src/features/returns/useReturn.ts`:
    - `fullReturn(saleId, reason)`: llama adapter, retorna Receipt de devolución
    - `partialReturn(saleId, items)`: llama adapter, retorna Receipt de devolución parcial
  - [ ] 11.2 Implementar `src/features/returns/FullReturnForm.tsx`:
    - Muestra resumen de la venta a devolver
    - Campo de motivo (requerido)
    - Botón confirmar con estado de carga
  - [ ] 11.3 Implementar `src/features/returns/PartialReturnForm.tsx`:
    - Lista de ítems de la venta con: nombre, cantidad comprada, input de cantidad a devolver (0 a comprada), campo de motivo por ítem
    - Validación: al menos un ítem con cantidad > 0
    - Botón confirmar con estado de carga
  - [ ] 11.4 Implementar `src/features/returns/ReturnPage.tsx`:
    - Carga la venta por `saleId` de los params
    - Toggle entre devolución total y parcial
    - Renderiza `FullReturnForm` o `PartialReturnForm`
    - Al éxito: navega a `/receipt/:transactionId` del recibo de devolución
  - [ ] 11.5 Escribir pruebas de componente para `FullReturnForm` y `PartialReturnForm`
  - **Referencia / Reference:** Requirements §11; Design §10

- [ ] 12. Pantalla principal de venta / Main sale screen
  - [ ] 12.1 Implementar `src/features/sale/SalePage.tsx` integrando todos los componentes:
    - Header: logo, terminal ID, cashier ID, botón logout
    - Panel izquierdo: `ProductSearch` + `BarcodeScanner` + `CustomerSearch`
    - Panel derecho: `CartPanel` + `TotalsSummary` + `DiscountForm`
    - Barra de acciones: botones Congelar, Cancelar, Checkout (según estado de la venta)
    - Botón "Ver ventas congeladas" que navega a `/sale/frozen`
    - Al montar: si no hay `activeSale` en store, llama `createSale()` automáticamente
  - [ ] 12.2 Implementar `src/shared/components/StatusBadge.tsx`: badge de color por SaleStatus
  - [ ] 12.3 Implementar `src/shared/components/ErrorMessage.tsx`: componente reutilizable para errores con icono y mensaje
  - [ ] 12.4 Implementar `src/shared/components/LoadingSpinner.tsx`: spinner accesible con `aria-label`
  - [ ] 12.5 Implementar `src/shared/components/ConfirmDialog.tsx`: modal de confirmación reutilizable
  - [ ] 12.6 Verificar que todos los botones tienen área táctil ≥ 44×44px (Requirements §13)
  - [ ] 12.7 Verificar contraste de colores WCAG AA en los componentes principales
  - **Referencia / Reference:** Requirements §3, §8, §9, §13; Design §9.1

- [ ] 13. Pruebas E2E / E2E Tests
  - [ ] 13.1 Configurar Playwright: `playwright.config.ts` apuntando a `http://localhost:5173`
  - [ ] 13.2 Configurar MSW en modo browser para interceptar peticiones en E2E
  - [ ] 13.3 Implementar E2E: flujo completo efectivo (login → buscar producto → agregar → checkout → recibo → nueva venta)
  - [ ] 13.4 Implementar E2E: flujo crédito (asociar cliente APPROVED → checkout crédito → recibo con referencia)
  - [ ] 13.5 Implementar E2E: flujo freeze/resume (congelar → nueva venta → listar congeladas → reanudar → checkout)
  - [ ] 13.6 Implementar E2E: manejo de error 503 en búsqueda de productos
  - [ ] 13.7 Implementar E2E: manejo de error 409 en checkout (stock insuficiente)
  - [ ] 13.8 Implementar E2E: devolución total de venta completada
  - **Referencia / Reference:** Requirements §1–§12; Design §10

- [ ] 14. Verificación final y entregables / Final verification and deliverables
  - [ ] 14.1 Ejecutar `npm run test -- --coverage` y verificar cobertura ≥70% en `src/core/`
  - [ ] 14.2 Ejecutar `npx playwright test` y verificar que todos los E2E pasan
  - [ ] 14.3 Ejecutar `npm run build` y verificar que el build de producción no tiene errores
  - [ ] 14.4 Ejecutar `npm run lint` y corregir todos los errores de ESLint
  - [ ] 14.5 Verificar accesibilidad: todos los botones con `aria-label`, inputs con `<label>`, contraste WCAG AA
  - [ ] 14.6 Crear `pos-frontend/my-prompt.txt` con el prompt de especificación original (requerimiento del taller)
  - [ ] 14.7 Crear `pos-frontend/REFLECTION.md` (máx. 1 página) comparando SDD con desarrollo tradicional
  - **Referencia / Reference:** Requirements §13; Design §10
