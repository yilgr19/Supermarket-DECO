# SDD — Backend POS (Supermarket Sales API)  
# SDD — Backend POS (Supermarket Sales API)

**Proyecto / Project:** API REST de ventas para POS de supermercado (integración con APIs de catálogo y clientes)  
**Metodología / Methodology:** Spec-Driven Development (SDD) con Kiro (AWS)  
**Stack:** Java 17+, Spring Boot 3.x, Maven o Gradle  
**Document version / Versión del documento:** 2.0  
**Date / Fecha:** mayo 2026  

---

## 1. Contexto del taller y SDD / Workshop context and SDD

### Español

En este taller se aplica **desarrollo guiado por especificaciones (SDD)** usando **Kiro**: se redactan especificaciones claras para una **API REST de punto de venta** y, a partir de ellas, se generan implementación y pruebas.

Flujo SDD: **Requisitos → Diseño → Tareas → Implementación**.

Archivos de especificación generados y mantenidos bajo **`.kiro/specs/pos-api/`**:

| Archivo | Contenido |
|---------|-----------|
| `requirements.md` | Historias de usuario, reglas de negocio, criterios de aceptación, endpoints |
| `design.md` | Arquitectura por capas, modelo de datos, decisiones de stack, integraciones |
| `tasks.md` | Pasos ordenados de implementación |

**Mapeo con el enunciado general del POS:** el sistema completo incluye catálogo (**CRUD de productos**, stock, precios), **búsqueda por código de barras**, **gestión de sesión de carrito/venta**, **descuentos**, **checkout con varios métodos de pago**, **comprobantes/recibos** y **pruebas**. En el alcance del taller de **Coding and Testing**, el foco del backend entregable es la **Sales API**: consume las APIs externas de **Producto** y **Cliente**; el **CRUD de productos** vive típicamente en la **Product API** (el Sales API la invoca para validaciones de stock, precios y búsqueda).

### English

This workshop applies **Spec-Driven Development (SDD)** with **Kiro**: you write clear specs for a **supermarket POS REST API** and use them to drive implementation and tests.

SDD flow: **Requirements → Design → Tasks → Implementation**.

Specification files under **`.kiro/specs/pos-api/`**:

| File | Content |
|------|---------|
| `requirements.md` | User stories, business rules, acceptance criteria, endpoints |
| `design.md` | Layered architecture, data model, stack choices, integrations |
| `tasks.md` | Ordered implementation steps |

**Mapping to the generic POS brief:** the full solution covers **product CRUD**, **barcode lookup**, **cart/session management**, **discounts**, **checkout with multiple payment methods**, **receipts**, and **tests**. In the **Sales API** workshop scope, the delivered backend centers on the **Sales API**, which **consumes** external **Product** and **Customer** APIs; **product CRUD** is owned by the **Product API**, while the Sales API searches products, validates stock, and orchestrates sales.

### Herramientas / Tools

| Herramienta / Tool | Uso / Use |
|--------------------|-----------|
| Kiro IDE | Generación y refactor de specs y código |
| Java 17+ | Lenguaje |
| Maven 3.9+ o Gradle 8+ | Build |
| Postman, Insomnia o `curl` | Pruebas manuales de API |
| JUnit 5, Mockito, Spring Boot Test | Pruebas |
| WireMock o `MockRestServiceServer` | Mock de APIs externas en tests |
| JaCoCo | Cobertura (objetivo ≥ 80 % líneas) |
| SpringDoc OpenAPI | Documentación Swagger UI |

---

## 2. Entregables y autoevaluación / Deliverables and self-assessment

### Español

Alineado a **WORKSHOP-API.md**:

1. **Prompt de especificación** entregado a Kiro (guardar como `my-prompt.txt`; no copiar/pegar el enunciado del taller textualmente: debe ser redacción propia).
2. Los **tres archivos de spec** en `.kiro/specs/pos-api/`.
3. **API REST Spring Boot** funcional según especificación.
4. **Suite de pruebas** con informe JaCoCo **≥ 80 %** cobertura de líneas; capa de servicio **≥ 90 %** recomendado.
5. **Reflexión breve** (máx. 1 página): qué hubo que clarificar en specs, impacto del prompt en el código generado, qué harías distinto la próxima vez.

### English

Per **WORKSHOP-API.md**:

1. **Specification prompt** for Kiro (save as `my-prompt.txt`; write your own description, do not paste the brief verbatim).
2. **Three spec files** under `.kiro/specs/pos-api/`.
3. **Working Spring Boot REST API**.
4. **Test suite** with JaCoCo **≥ 80 %** line coverage; **≥ 90 %** on the service layer is recommended.
5. **Short reflection** (max 1 page): spec fixes, prompt impact on code quality, lessons learned.

### Criterios de evaluación / Evaluation criteria

| Criterio / Criterion | Peso / Weight |
|----------------------|---------------|
| Calidad del prompt de especificación para Kiro | 25 % |
| Calidad de los specs generados (tras tu revisión) | 15 % |
| Implementación API (endpoints funcionales) | 20 % |
| Calidad y cobertura de pruebas (≥ 80 %) | 30 % |
| Calidad de código (arquitectura limpia, errores, nombres) | 10 % |

---

## 3. Contexto del sistema / System context

### Español

- **Product API:** catálogo (CRUD, stock, precios). La Sales API la usa para búsqueda y validación de stock al agregar ítems y al cerrar venta.
- **Customer API:** datos de cliente y **estado de crédito** (`APPROVED`, `REJECTED`, `PENDING`). Obligatoria para ventas a **crédito**.
- **Sales API (este backend):** transacciones en terminal POS: venta, congelamiento, cancelación, checkout, devoluciones, totales, recibos.

Si la Product API no está disponible: respuesta **`503 Service Unavailable`** con mensaje claro.

### English

- **Product API:** catalog (CRUD, stock, pricing). The Sales API uses it for search and stock checks.
- **Customer API:** customer records and **credit status**. Required for **credit** sales.
- **Sales API:** POS transactions: sales, freeze, cancel, checkout, returns, totals, receipts.

If the Product API is down: return **`503 Service Unavailable`** with a clear message.

---

## 4. Requerimientos funcionales / Functional requirements

### 4.1 Búsqueda de productos (vía Product API) / Product search

**ES:** Búsqueda por nombre (parcial, sin distinción de mayúsculas), por código de barras. Respuesta: id, nombre, código de barras, precio unitario, stock disponible, categoría.  
**EN:** Search by name (partial, case-insensitive) and barcode. Response: id, name, barcode, unit price, available stock, category.

### 4.2 Búsqueda de clientes (vía Customer API) / Customer search

**ES:** Por nombre (parcial) y por documento (exacto). Respuesta: id, nombre completo, tipo y número de documento, estado de crédito. Asociar cliente es opcional en **efectivo**, obligatorio en **crédito**.  
**EN:** Partial name search, exact document search. Credit status required for credit sales.

### 4.3 Ciclo de vida de la venta / Sale lifecycle

**ES:** Estados y transiciones:

```
ACTIVE → COMPLETED (checkout exitoso)
ACTIVE → CANCELLED (cancelación antes del checkout)
ACTIVE → FROZEN (venta en espera)
FROZEN → ACTIVE (reanudar)
COMPLETED → RETURNED (devolución total)
COMPLETED → PARTIALLY_RETURNED (devolución parcial)
```

**EN:** Same state machine as above.

### 4.4 Creación y gestión de venta / Sale creation and lines

**ES:**

- Nueva venta en `ACTIVE`; **terminal POS** en la petición; cliente opcional (obligatorio según tipo de pago); **cajero** (cabecera o token).
- Agregar ítem: por id de producto o código de barras; snapshot de nombre y precio; cantidad ≥ 1; si el producto ya está, incrementar cantidad; validar stock vía Product API; recalcular totales.
- Actualizar cantidad o eliminar línea; recalcular totales.

**EN:** Same rules; stock validated via Product API; totals recalculated on each change.

### 4.5 Tipos de pago / Payment types

**ES:**

- **CASH:** cliente opcional; monto recibido ≥ total; calcular vuelto; al completar → `COMPLETED`.
- **CREDIT:** cliente obligatorio; crédito `APPROVED` vía Customer API; si no, **`422 Unprocessable Entity`**; referencia de crédito autogenerada; → `COMPLETED`.

**EN:** Cash vs credit rules as above; reject non-approved credit with **422**.

### 4.6 Checkout

**ES:** Validar que hay ítems, datos de pago completos y stock suficiente. Éxito: `COMPLETED`, decrementar stock (Product API), recibo con **ID de transacción único**. Stock insuficiente en cierre: **`409 Conflict`** con listado de ítems afectados.  
**EN:** Same; **409** with out-of-stock list when applicable.

### 4.7 Cancelación

**ES:** Solo `ACTIVE` o `FROZEN`. Estado `CANCELLED`; motivo obligatorio (texto, máx. 255); sin cambios de stock.  
**EN:** Only active/frozen sales; reason required; no stock movement.

### 4.8 Congelamiento (hold)

**ES:** Solo `ACTIVE` → `FROZEN`; conservar ítems y totales; reanudar a `ACTIVE`; un terminal puede tener varias ventas congeladas; listar por terminal; expiración configurable (por defecto 2 h) → cancelación automática.  
**EN:** Hold/resume; multiple frozen sales per terminal; TTL default 2 hours.

### 4.9 Devoluciones

**ES:**

- Solo ventas `COMPLETED`. Una venta no se “devuelve dos veces” como nueva jerarquía; `PARTIALLY_RETURNED` puede recibir más devoluciones parciales sobre lo restante.
- **Total:** todos los ítems; `RETURNED`; restaurar stock; motivo; recibo de devolución con transacción origen.
- **Parcial:** cantidades ≤ compradas; `PARTIALLY_RETURNED`; stock solo de lo devuelto; motivo por ítem; recibo parcial.
- Ventas a crédito: **nota de crédito** (no reembolso en efectivo en flujo documentado).

**EN:** Full vs partial returns; credit sales yield credit notes.

### 4.10 Totales, impuestos y descuentos / Totals, tax, and discounts

**ES:**

- Subtotal = Σ (precio unitario × cantidad).
- Impuesto = subtotal × tasa (configurable, **defecto 19 %**).
- **Descuento:** opcional, por porcentaje o monto fijo (misma línea de reglas que el taller de frontend POS, si aplica).
- Total = subtotal + impuesto − descuento.
- Valores monetarios: **`BigDecimal`** con 2 decimales; internamente **aritmética en centavos** donde se indique en implementación para evitar errores de punto flotante.

**EN:** Same formulas; configurable tax; optional line/order discount; **BigDecimal** and cent-safe arithmetic.

### 4.11 Recibos / Receipts

**ES:** Tras checkout exitoso: nombre tienda, terminal, cajero, fecha/hora, cliente (si hay), líneas, subtotal, impuesto, descuento, total, método de pago, monto recibido y vuelto (efectivo), ID transacción. Devoluciones: referencia a transacción original e ítems devueltos.  
**EN:** Receipt contents as above; return receipts reference original sale.

---

## 5. Stack técnico obligatorio / Required tech stack

| Componente / Component | Tecnología / Technology |
|------------------------|-------------------------|
| Lenguaje | Java 17+ |
| Framework | Spring Boot 3.x |
| Build | Maven o Gradle |
| Base de datos | H2 (dev/test), esquema compatible PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Validación | Jakarta Bean Validation |
| Cliente HTTP | `RestTemplate` o `WebClient` |
| Pruebas | JUnit 5, Mockito, `@SpringBootTest` |
| Cobertura | JaCoCo |
| Documentación API | SpringDoc OpenAPI (Swagger UI) |
| APIs externas en test | WireMock o `MockRestServiceServer` |

---

## 6. Diseño / Design

### Español

Arquitectura en capas (**hexagonal** o **limpia**): dominio sin dependencias de framework; casos de uso / servicios de aplicación; adaptadores REST; clientes HTTP para Product y Customer API; persistencia en H2/PostgreSQL para ventas, líneas, estados, recibos; manejo global de excepciones con códigos HTTP alineados (`409`, `422`, `503`, etc.).

### English

Layered **hexagonal/clean** architecture: framework-free domain core; application services; REST adapters; persistence for sales aggregate; **REST client** ports to external APIs; exception handling mapped to **409 / 422 / 503** as specified.

---

## 7. Requerimientos de pruebas / Testing requirements

### Español

**Unitarias:** Mockito por servicio; mockear Product API y Customer API; reglas de pago, crédito, stock, límites de devolución; transiciones de estado; casos límite: checkout sin ítems, devolución por encima de lo comprado, venta congelada expirada, crédito sin cliente.

**Integración:** `@SpringBootTest` + H2; WireMock para externos; flujos: venta efectivo (crear → ítems → checkout → recibo); crédito con cliente aprobado; congelar → reanudar → checkout; devolución total y parcial; cancelación y comprobación de no modificación posterior.

**Cobertura:** ≥ **80 %** líneas global; **≥ 90 %** servicios recomendado.

### English

**Unit:** isolate services with Mockito; mock external APIs; state transitions and edge cases.

**Integration:** full flows with H2 + WireMock as above.

**Coverage:** **≥ 80 %** lines; **≥ 90 %** service layer target.

---

## 8. Plan de tareas (alto nivel) / Task plan (high level)

### Español

1. Bootstrap Spring Boot 3, perfiles, OpenAPI, JaCoCo, estructura de paquetes.
2. Modelo de dominio y persistencia de venta / líneas / recibos; enums de estado y tipo de pago.
3. Clientes HTTP Product + Customer con manejo de `503`.
4. Endpoints: búsqueda proxy o agregado según diseño; CRUD de venta y líneas; freeze/resume/list; cancel; checkout; returns.
5. Cálculo de totales (impuesto, descuento, centavos).
6. Generación de recibos y notas de devolución.
7. Pruebas unitarias e integración; ajustar cobertura.

*(El detalle ordenado vive en `.kiro/specs/pos-api/tasks.md`.)*

### English

1. Bootstrap, OpenAPI, JaCoCo, packages.  
2. Domain + JPA model for sales.  
3. External API clients + **503** handling.  
4. REST endpoints for full lifecycle.  
5. Totals and discounts.  
6. Receipts and return documents.  
7. Unit + integration tests to **≥ 80 %**.

*(Detailed order belongs in `.kiro/specs/pos-api/tasks.md`.)*

---

## 9. Consejos para el prompt a Kiro / Tips for your Kiro prompt

### Español

Especificar transiciones de estado, códigos HTTP y mensajes por fallo, contratos de APIs externas (request/response para mocks), campos obligatorios/opcionales, **BigDecimal** y edge cases (Product API caída, crédito no aprobado, doble devolución inválida).

### English

Be explicit about **state transitions**, **HTTP error codes**, **external API contracts**, required fields, **BigDecimal** money rules, and edge cases.

---

## 10. Control de versiones del documento / Document history

| Versión | Fecha | Cambios |
|---------|--------|---------|
| 1.0 | 2026-04 | Versión inicial SDD backend |
| 2.0 | 2026-05 | Alineación WORKSHOP-API, SDD/Kiro, entregables, evaluación, bilingüe ES/EN |

---

*SDD — Backend POS (Sales API). Referencia de negocio detallada: `WORKSHOP-API.md`.*
