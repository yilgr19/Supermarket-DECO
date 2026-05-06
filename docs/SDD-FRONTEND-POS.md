# SDD — Frontend POS (Supermarket Point of Sale)  
# SDD — Frontend POS (Supermarket Point of Sale)

**Proyecto / Project:** Cliente web para POS de supermercado integrado con API REST de ventas  
**Metodología / Methodology:** Alineado a Spec-Driven Development (SDD); contratos derivados de `.kiro/specs/pos-api/` y del backend Spring Boot  
**Stack:** React, TypeScript  
**Document version / Versión del documento:** 2.0  
**Date / Fecha:** mayo 2026  

---

## 1. Relación con el taller API y SDD / Link to API workshop and SDD

### Español

El taller de **API** (ver `WORKSHOP-API.md`) define la **Sales API** en Java/Spring Boot, generada con **Kiro** a partir de `requirements.md`, `design.md` y `tasks.md` en **`.kiro/specs/pos-api/`**. El frontend POS debe **consumir** esa API (y, según arquitectura, endpoints de **Product API** / **Customer API** directamente o solo a través del backend agregador).

**Enunciado del POS (buenas prácticas bilingües):** el producto completo cubre **CRUD de productos** (típicamente en catálogo/Product API), **búsqueda por código de barras**, **sesión de carrito/venta**, **aplicación de descuentos**, **checkout con múltiples métodos de pago**, **generación/visualización de recibos** y **calidad de pruebas** en cliente. Este documento detalla cómo el **frontend** materializa esos flujos frente al contrato REST acordado.

### English

The **API workshop** (`WORKSHOP-API.md`) specifies the **Sales API** (Java / Spring Boot), driven by Kiro specs under **`.kiro/specs/pos-api/`**. The POS frontend **consumes** that API (and optionally Product/Customer APIs, depending on your BFF/gateway choice).

The **POS brief** calls for **product CRUD**, **barcode lookup**, **cart session**, **discounts**, **multi-method checkout**, **receipts**, and **strong testing**. This document maps those capabilities to **UI/UX** and **integration** responsibilities.

---

## 2. Requerimientos funcionales / Functional requirements

### 2.1 Catálogo y productos / Catalog and products

**ES:**

- Listados con paginación o virtualización; búsqueda por **nombre** (coincidencia parcial) y por **código de barras** (escáner o teclado), coherente con la Sales API o Product API.
- Visualización de: id, nombre, código de barras, precio unitario, **stock disponible**, categoría; feedback si el backend responde **`503`** (servicio de catálogo no disponible).
- Pantallas de **alta/edición/baja** de producto si el alcance del proyecto incluye **Product API** o módulo de backoffice conectado; validación de formularios y mensajes alineados a errores del servidor.

**EN:**

- Paginated lists; **name** and **barcode** search; display price, stock, category; handle **`503`** gracefully.
- **CRUD** screens when the Product API / admin scope is in play; server-aligned validation.

### 2.2 Clientes / Customers

**ES:** Búsqueda por nombre (parcial) y documento (exacto); mostrar estado de crédito (`APPROVED` | `REJECTED` | `PENDING`). Para **venta a crédito**, selección de cliente **obligatoria**; bloquear checkout con mensaje claro si el crédito no está aprobado (**`422`**).  
**EN:** Same; enforce mandatory customer for credit sales; surface **422** clearly.

### 2.3 Sesión de venta y carrito / Sale session and cart

**ES:**

- Crear venta en terminal POS (id de terminal en payload); opcionalmente asociar cliente al inicio o antes del pago según reglas.
- Agregar líneas por producto o **código de barras**; fusionar cantidades si el producto ya existe; cantidad mínima 1; impedir exceder **stock** con mensajes del backend.
- Editar cantidades y eliminar líneas; **recalcular** subtotal, impuestos, descuento y total según respuestas del servidor (fuente de verdad).
- Estados de venta en UI: **ACTIVE**, **FROZEN**, **COMPLETED**, **CANCELLED**, **RETURNED**, **PARTIALLY_RETURNED**; deshabilitar acciones inválidas por estado.

**EN:**

- Mirror the sale lifecycle; **barcode**-first workflows for cashiers; trust server totals.

### 2.4 Congelamiento y reanudación / Freeze and resume

**ES:** Pausar venta (**ACTIVE → FROZEN**); listar ventas congeladas por **terminal**; reanudar (**FROZEN → ACTIVE**); avisar si una venta congelada fue **cancelada por expiración** (p. ej. TTL 2 h).  
**EN:** Hold/resume lists per terminal; UX for TTL expiry.

### 2.5 Cancelación / Cancellation

**ES:** Solo si `ACTIVE` o `FROZEN`; formulario de **motivo** (≤ 255 caracteres); tras cancelar, no permitir edición ni checkout.  
**EN:** Reason required; read-only cancelled sales.

### 2.6 Checkout y pagos / Checkout and payments

**ES:**

- Validar ítems y datos de pago antes de enviar.
- **Efectivo (`CASH`):** monto recibido ≥ total; mostrar **vuelto** devuelto por API.
- **Crédito (`CREDIT`):** cliente obligatorio y crédito aprobado; mostrar **referencia de crédito** si la API la genera.
- Manejar **`409 Conflict`** con lista de ítems sin stock en el cierre.

**EN:**

- **Cash** vs **credit** flows; show change and credit reference; **409** with line-level detail.

### 2.7 Descuentos / Discounts

**ES:** Aplicar descuento **por porcentaje** o **monto fijo** según reglas del backend (coherente con `WORKSHOP-API.md` Feature 9); la UI envía parámetros acordados y muestra desglose (subtotal, impuesto, descuento, total).  
**EN:** Percentage or fixed discount per API contract; clear breakdown.

### 2.8 Recibos y devoluciones / Receipts and returns

**ES:**

- Tras checkout: pantalla o impresión con: tienda, terminal, cajero, fecha/hora, cliente (si hay), líneas, subtotal, impuesto, descuento, total, método de pago, monto recibido/vuelto, **ID de transacción**.
- **Devolución total** solo sobre `COMPLETED`; confirmar motivo; mostrar recibo de devolución ligado al ID original.
- **Devolución parcial:** seleccionar líneas y cantidades ≤ compradas; motivo por ítem; reflejar **`PARTIALLY_RETURNED`**.
- Ventas a crédito: UI orientada a **nota de crédito** según contrato.

**EN:**

- Receipt preview/print; full and partial returns; credit-note flow for credit sales.

### 2.9 Errores y resiliencia / Errors and resilience

**ES:** Mapear **`503`**, **`409`**, **`422`** y errores de validación a mensajes operativos (cajero); reintentos donde sea seguro; estados de carga y desconexión.  
**EN:** Operational error mapping; loading and offline-aware UX where applicable.

### 2.10 Seguridad, roles y sesión / Security, roles, and session

**ES:** Autenticación alineada al backend; **cajero** en cabecera o token según diseño; rutas protegidas por rol; sin secretos en el bundle.  
**EN:** Auth headers/tokens; role-based UI; no secrets in client bundle.

### 2.11 Accesibilidad e i18n / A11y and i18n

**ES:** Uso en **mostrador / táctil**: targets grandes, contraste; cadenas preparadas para **ES/EN** según buenas prácticas de producto internacional.  
**EN:** Touch-friendly POS; bilingual-ready strings (**ES/EN**).

### 2.12 Requerimientos no funcionales / Non-functional

**ES:** Code splitting, minimizar re-renders en listas largas, tipado estricto TypeScript, trazas opcionales alineadas al backend.  
**EN:** Performance, strict typing, optional correlation IDs.

---

## 3. Diseño / Design

### 3.1 Arquitectura en frontend / Frontend architecture

**ES:** **Hexagonal / ports & adapters:** núcleo con casos de uso (comandos de venta, búsqueda, checkout); **puertos** (`SaleRepository`, `ProductSearchGateway`, etc.); adaptadores HTTP que implementan esos puertos; UI desacoplada de `fetch` directo.

**EN:** Same **ports & adapters** approach; testable core without real HTTP in unit tests.

### 3.2 Módulos sugeridos / Suggested modules

**ES:** `auth`, `catalogo` (CRUD + búsqueda), `venta` (carrito, freeze, cancel), `checkout`, `recibos`, `devoluciones`, `shared/ui`.  
**EN:** Feature slices as above.

### 3.3 Estado / State

**ES:** Estado global mínimo (sesión, venta activa opcional); preferir estado local y servidor como fuente de verdad para totales y stock.  
**EN:** Minimize duplicated business state; server-authoritative totals.

### 3.4 Contratos y tipos / Contracts and types

**ES:** Tipos/DTOs alineados a **OpenAPI** del backend; generación de cliente opcional; **mappers** a view models.  
**EN:** OpenAPI-aligned types; optional codegen.

---

## 4. Pruebas / Testing

### Español

| Tipo | Objetivo |
|------|----------|
| Unitarias | Casos de uso y hooks sin red; mocks de puertos |
| Componentes | Formularios críticos, listas, flujo de líneas de venta |
| Integración / E2E | Playwright/Cypress o similar: búsqueda por código de barras, agregar ítems, descuento, checkout efectivo/crédito, congelar/reanudar; **`409`**, **`422`**, **`503`** simulados con MSW |

**Cobertura:** definir umbral de equipo (el taller de API exige **≥ 80 %** en backend; en frontend se recomienda umbral explícito en CI, p. ej. **≥ 70–80 %** en módulos core según política del curso).

### English

| Type | Goal |
|------|------|
| Unit | Use-cases with mocked ports |
| Component | Critical POS forms and line items |
| Integration / E2E | Barcode flow, discounts, cash/credit checkout, freeze/resume; MSW for **409**/**422**/**503** |

Set a clear **coverage gate** in CI for core modules.

---

## 5. Plan de tareas (alto nivel) / Task plan (high level)

### Español

1. Design system POS, shell, routing, cliente HTTP con auth e interceptores de error.
2. Búsqueda catálogo + **código de barras**; CRUD producto si aplica.
3. Flujo venta: crear, líneas, totales desde API; descuentos.
4. Freeze/resume/cancel; lista por terminal.
5. Checkout efectivo/crédito; manejo **409**/**422**.
6. Recibos y flujos de devolución.
7. Pruebas unit/component/E2E y hardening a11y/i18n ES/EN.

### English

1. Shell, HTTP client, error mapping.  
2. Catalog + **barcode**; optional CRUD.  
3. Sale lines + **discounts**.  
4. Hold/cancel/resume.  
5. **Cash/credit** checkout.  
6. Receipts + returns.  
7. Tests + a11y + bilingual strings.

---

## 6. Alineación frontend–backend / Frontend–backend alignment

### Español

- Los códigos HTTP (`503`, `409`, `422`) y los DTO de error deben documentarse en **OpenAPI** compartido.
- La seguridad real reside en el backend; el front solo refleja permisos.
- Descuentos, impuestos y totales: **siempre** coherentes con la Sales API (`WORKSHOP-API.md`).

### English

- Share **OpenAPI** error models and status codes.
- Backend is the security boundary.
- Totals and discounts must match the **Sales API** spec.

---

## 7. Entregables opcionales del frontend (curso completo) / Optional frontend deliverables

| ES | EN |
|----|-----|
| Repositorio React + TS con CI (lint, test, build) | React + TS repo with CI |
| Storybook o guía de componentes clave (opcional) | Storybook for key widgets (optional) |
| Manual corto de despliegue (env vars) | Short deploy notes |

---

## 8. Control de versiones del documento / Document history

| Versión | Fecha | Cambios |
|---------|--------|---------|
| 1.0 | 2026-04 | Versión inicial SDD frontend |
| 2.0 | 2026-05 | Alineación WORKSHOP-API, SDD/Kiro, flujos POS completos, bilingüe ES/EN, pruebas |

---

*SDD — Frontend POS. Referencia de negocio backend: `WORKSHOP-API.md`; specs Kiro: `.kiro/specs/pos-api/`.*
