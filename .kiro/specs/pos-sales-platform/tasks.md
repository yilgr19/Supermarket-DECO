# Plan de Implementación / Implementation Plan
## Plataforma POS de Ventas — Sales API

---

## Instrucciones / Instructions

**ES:** Las tareas están ordenadas por dependencia. Completa cada tarea antes de avanzar a la siguiente. Cada tarea referencia los requisitos y secciones de diseño correspondientes.

**EN:** Tasks are ordered by dependency. Complete each task before moving to the next. Each task references the corresponding requirements and design sections.

---

- [ ] 1. Bootstrap del proyecto y configuración base / Project bootstrap and base configuration
  - [ ] 1.1 Crear proyecto Spring Boot 3.x con Maven/Gradle, Java 17+
  - [ ] 1.2 Agregar dependencias: Spring Web, Spring Data JPA, H2, Jakarta Validation, SpringDoc OpenAPI, JaCoCo, WireMock, Mockito
  - [ ] 1.3 Configurar `application.properties` con propiedades: `pos.sales.tax-rate`, `pos.sales.hold-expiry-hours`, `pos.sales.store-name`, `product.api.base-url`, `customer.api.base-url`
  - [ ] 1.4 Configurar perfil H2 para desarrollo y pruebas con esquema compatible PostgreSQL
  - [ ] 1.5 Configurar SpringDoc OpenAPI con Swagger UI en `/swagger-ui.html`
  - [ ] 1.6 Configurar JaCoCo con umbrales: ≥80% cobertura global, ≥90% en paquete de servicios
  - [ ] 1.7 Crear estructura de paquetes: `domain/model`, `domain/port`, `application/service`, `adapter/rest`, `adapter/external`, `infrastructure`
  - **Referencia / Reference:** Design §10, §11

- [ ] 2. Modelo de dominio y persistencia / Domain model and persistence
  - [ ] 2.1 Crear enums: `SaleStatus`, `PaymentType`, `DiscountType`, `ReturnType`, `ReceiptType`
  - [ ] 2.2 Crear entidad JPA `Sale` con todos los campos definidos en Design §3.1
  - [ ] 2.3 Crear entidad JPA `SaleItem` con FK a Sale (Design §3.2)
  - [ ] 2.4 Crear entidad JPA `Receipt` con todos los campos definidos en Design §3.3
  - [ ] 2.5 Crear entidad JPA `ReceiptItem` con FK a Receipt (Design §3.4)
  - [ ] 2.6 Crear interfaces de repositorio JPA: `SaleJpaRepository`, `ReceiptJpaRepository`
  - [ ] 2.7 Crear interfaces de puerto de dominio: `SaleRepository`, `ReceiptRepository`, `ProductApiPort`, `CustomerApiPort`
  - [ ] 2.8 Implementar adaptadores de persistencia que implementen los puertos de repositorio
  - **Referencia / Reference:** Requirements §3, §4, §5, §13; Design §3

- [ ] 3. Clientes HTTP externos / External HTTP clients
  - [ ] 3.1 Crear excepciones de dominio: `ProductServiceUnavailableException`, `CustomerServiceUnavailableException`, `ProductNotFoundException`, `CustomerNotFoundException`
  - [ ] 3.2 Implementar `ProductApiClient` que implemente `ProductApiPort`:
    - Búsqueda por nombre: `GET {productApiBaseUrl}/products/search?name={name}`
    - Búsqueda por barcode: `GET {productApiBaseUrl}/products/barcode/{barcode}`
    - Obtener por ID: `GET {productApiBaseUrl}/products/{productId}`
    - Decrementar stock: `PUT {productApiBaseUrl}/products/{productId}/stock`
    - Incrementar stock (devoluciones): `PUT {productApiBaseUrl}/products/{productId}/stock`
    - Mapear `ResourceAccessException` → `ProductServiceUnavailableException`
    - Mapear `HttpClientErrorException.NotFound` → `ProductNotFoundException`
  - [ ] 3.3 Implementar `CustomerApiClient` que implemente `CustomerApiPort`:
    - Búsqueda por nombre: `GET {customerApiBaseUrl}/customers/search?name={name}`
    - Búsqueda por documento: `GET {customerApiBaseUrl}/customers/document/{docNumber}`
    - Obtener por ID: `GET {customerApiBaseUrl}/customers/{customerId}`
    - Mapear `ResourceAccessException` → `CustomerServiceUnavailableException`
    - Mapear `HttpClientErrorException.NotFound` → `CustomerNotFoundException`
  - [ ] 3.4 Configurar bean `RestTemplate` con timeout de conexión y lectura
  - **Referencia / Reference:** Requirements §1, §2, §15; Design §7

- [ ] 4. Lógica de cálculo de totales / Totals calculation logic
  - [ ] 4.1 Implementar `TotalsCalculator` con métodos:
    - `toCents(BigDecimal)` → long
    - `fromCents(long)` → BigDecimal (escala 2, HALF_UP)
    - `calculateSubtotal(List<SaleItem>)` → BigDecimal
    - `calculateTax(BigDecimal subtotal, BigDecimal taxRate)` → BigDecimal
    - `calculateDiscount(BigDecimal subtotal, DiscountType, BigDecimal value)` → BigDecimal
    - `calculateTotal(BigDecimal subtotal, BigDecimal tax, BigDecimal discount)` → BigDecimal
    - `recalculate(Sale)` → actualiza subtotal, tax, discount, total en la Sale
  - [ ] 4.2 Crear excepción `DiscountExceedsSubtotalException`
  - [ ] 4.3 Escribir pruebas unitarias para `TotalsCalculator` cubriendo: subtotal con múltiples ítems, impuesto 19%, descuento porcentual, descuento fijo, descuento que excede subtotal
  - **Referencia / Reference:** Requirements §6; Design §6

- [ ] 5. Servicio de gestión de ventas / Sale management service
  - [ ] 5.1 Crear excepciones de dominio: `SaleNotFoundException`, `SaleItemNotFoundException`, `InvalidSaleStateException`, `InvalidQuantityException`, `InsufficientStockException`
  - [ ] 5.2 Implementar `SaleService` con métodos:
    - `createSale(terminalId, cashierId, customerId)` → Sale en estado ACTIVE
    - `getSale(saleId)` → Sale o SaleNotFoundException
    - `addItem(saleId, productId, barcode, quantity)` → valida estado ACTIVE, llama ProductApiPort para obtener producto y validar stock, crea/actualiza SaleItem, recalcula totales
    - `updateItem(saleId, itemId, quantity)` → valida estado ACTIVE, valida stock, actualiza cantidad, recalcula totales
    - `removeItem(saleId, itemId)` → valida estado ACTIVE, elimina SaleItem, recalcula totales
    - `applyDiscount(saleId, discountType, discountValue)` → valida estado ACTIVE, aplica descuento, recalcula totales
    - `freezeSale(saleId)` → valida estado ACTIVE, cambia a FROZEN, registra frozenAt
    - `resumeSale(saleId)` → valida estado FROZEN, cambia a ACTIVE
    - `cancelSale(saleId, reason)` → valida estado ACTIVE o FROZEN, valida reason (no vacío, ≤255 chars), cambia a CANCELLED
    - `listFrozenSales(terminalId)` → lista ventas FROZEN del terminal ordenadas por frozenAt
  - [ ] 5.3 Escribir pruebas unitarias para `SaleService` con Mockito mockeando `SaleRepository` y `ProductApiPort`:
    - Crear venta exitosa
    - Agregar ítem por productId y por barcode
    - Fusionar ítem duplicado (incrementar cantidad)
    - Agregar ítem con stock insuficiente → InsufficientStockException
    - Agregar ítem a venta no ACTIVE → InvalidSaleStateException
    - Actualizar cantidad válida e inválida (< 1)
    - Eliminar ítem existente y no existente
    - Congelar venta ACTIVE y no ACTIVE
    - Reanudar venta FROZEN y no FROZEN
    - Cancelar venta ACTIVE y FROZEN con motivo válido e inválido
  - **Referencia / Reference:** Requirements §3, §4, §5, §9, §10, §14; Design §2, §8

- [ ] 6. Servicio de checkout / Checkout service
  - [ ] 6.1 Crear excepciones: `InsufficientPaymentException`, `CreditNotApprovedException`, `CustomerRequiredForCreditException`
  - [ ] 6.2 Implementar `CheckoutService` con método `checkout(saleId, paymentType, amountReceived, customerId)`:
    - Validar que la venta está en estado ACTIVE
    - Validar que la venta tiene al menos un SaleItem
    - Para CASH: validar amountReceived ≥ total; calcular changeAmount
    - Para CREDIT: validar que customerId está asociado; llamar CustomerApiPort para verificar CreditStatus == APPROVED
    - Verificar stock actual de todos los ítems vía ProductApiPort (puede haber cambiado desde que se agregaron)
    - Si stock insuficiente → InsufficientStockException con lista de ítems afectados
    - Cambiar estado a COMPLETED
    - Decrementar stock de cada ítem vía ProductApiPort
    - Generar CreditReference (UUID) para ventas CREDIT
    - Generar Receipt con TransactionId (UUID) y todos los campos requeridos
    - Persistir Receipt y ReceiptItems
    - Retornar Receipt
  - [ ] 6.3 Escribir pruebas unitarias para `CheckoutService`:
    - Checkout CASH exitoso con vuelto correcto
    - Checkout CASH con monto insuficiente → InsufficientPaymentException
    - Checkout CASH sin ítems → InvalidSaleStateException
    - Checkout CREDIT exitoso con CreditReference
    - Checkout CREDIT sin cliente → CustomerRequiredForCreditException
    - Checkout CREDIT con crédito REJECTED → CreditNotApprovedException
    - Checkout CREDIT con crédito PENDING → CreditNotApprovedException
    - Checkout con stock insuficiente al momento del cierre → InsufficientStockException con lista
    - Product API caída durante checkout → ProductServiceUnavailableException (no cambia estado)
  - **Referencia / Reference:** Requirements §7, §8, §13; Design §5.3

- [ ] 7. Servicio de devoluciones / Return service
  - [ ] 7.1 Implementar `ReturnService` con métodos:
    - `fullReturn(saleId, reason)`:
      - Validar estado COMPLETED
      - Validar reason no vacío
      - Cambiar estado a RETURNED
      - Restaurar stock de todos los ítems vía ProductApiPort
      - Generar Receipt de devolución total referenciando TransactionId original
      - Para ventas CREDIT: generar nota de crédito (campo creditNoteId en ReturnRecord)
    - `partialReturn(saleId, List<ReturnItemRequest>)`:
      - Validar estado COMPLETED o PARTIALLY_RETURNED
      - Validar que cada cantidad devuelta ≤ cantidad restante devolvible
      - Validar reason por ítem
      - Restaurar stock solo de ítems devueltos vía ProductApiPort
      - Cambiar estado a PARTIALLY_RETURNED
      - Generar Receipt de devolución parcial
      - Para ventas CREDIT: generar nota de crédito parcial
  - [ ] 7.2 Escribir pruebas unitarias para `ReturnService`:
    - Devolución total exitosa de venta COMPLETED
    - Devolución total de venta no COMPLETED → InvalidSaleStateException
    - Devolución total sin motivo → InvalidSaleStateException
    - Devolución parcial exitosa
    - Devolución parcial con cantidad > comprada → InvalidQuantityException
    - Devolución parcial de venta PARTIALLY_RETURNED (segunda devolución parcial)
    - Devolución de venta CREDIT genera nota de crédito
  - **Referencia / Reference:** Requirements §11, §12; Design §3.3

- [ ] 8. Scheduler de expiración de ventas congeladas / Frozen sale expiry scheduler
  - [ ] 8.1 Implementar `FrozenSaleExpiryScheduler` con `@Scheduled(fixedDelayString = "${pos.sales.expiry-check-interval-ms:60000}")`
  - [ ] 8.2 El scheduler busca ventas con status=FROZEN y frozenAt < (now - holdExpiryHours)
  - [ ] 8.3 Cancela cada venta expirada con reason = "Venta congelada expirada automáticamente / Frozen sale automatically expired"
  - [ ] 8.4 Habilitar scheduling con `@EnableScheduling` en clase de configuración
  - [ ] 8.5 Escribir prueba unitaria que verifique que ventas expiradas son canceladas y ventas no expiradas no son afectadas
  - **Referencia / Reference:** Requirements §10 (criterio 8 y 9); Design §9

- [ ] 9. Manejador global de excepciones / Global exception handler
  - [ ] 9.1 Implementar `GlobalExceptionHandler` con `@RestControllerAdvice`
  - [ ] 9.2 Mapear todas las excepciones de dominio a respuestas HTTP según tabla en Design §8
  - [ ] 9.3 Implementar respuesta de error estándar con campos: timestamp, status, error, message, path
  - [ ] 9.4 Implementar respuesta especial para `InsufficientStockException` con campo `outOfStockItems`
  - [ ] 9.5 Manejar `MethodArgumentNotValidException` de Bean Validation → 400 con lista de errores de campo
  - [ ] 9.6 Escribir pruebas unitarias del manejador verificando códigos HTTP y estructura de respuesta
  - **Referencia / Reference:** Requirements §15; Design §8

- [ ] 10. Controladores REST / REST Controllers
  - [ ] 10.1 Implementar `ProductSearchController`:
    - `GET /api/v1/products/search?name={name}` → llama ProductApiPort
    - `GET /api/v1/products/barcode/{barcode}` → llama ProductApiPort
  - [ ] 10.2 Implementar `CustomerSearchController`:
    - `GET /api/v1/customers/search?name={name}` → llama CustomerApiPort
    - `GET /api/v1/customers/document/{docNumber}` → llama CustomerApiPort
  - [ ] 10.3 Implementar `SaleController` con todos los endpoints de Design §4.3:
    - POST /api/v1/sales
    - GET /api/v1/sales/{saleId}
    - POST /api/v1/sales/{saleId}/items
    - PUT /api/v1/sales/{saleId}/items/{itemId}
    - DELETE /api/v1/sales/{saleId}/items/{itemId}
    - POST /api/v1/sales/{saleId}/discount
    - POST /api/v1/sales/{saleId}/checkout
    - POST /api/v1/sales/{saleId}/cancel
    - POST /api/v1/sales/{saleId}/freeze
    - POST /api/v1/sales/{saleId}/resume
    - GET /api/v1/sales/frozen?terminalId={id}
    - POST /api/v1/sales/{saleId}/return
    - POST /api/v1/sales/{saleId}/partial-return
  - [ ] 10.4 Implementar `ReceiptController`:
    - `GET /api/v1/receipts/{transactionId}`
  - [ ] 10.5 Agregar anotaciones `@Operation`, `@ApiResponse` de SpringDoc en todos los endpoints
  - [ ] 10.6 Agregar Bean Validation (`@Valid`, `@NotBlank`, `@Min`, etc.) en todos los DTOs de request
  - [ ] 10.7 Extraer `X-Cashier-Id` del header en todos los endpoints de venta
  - **Referencia / Reference:** Requirements §1–§13, §16; Design §4, §5

- [ ] 11. Pruebas de integración / Integration tests
  - [ ] 11.1 Configurar clase base de integración con `@SpringBootTest`, H2 y WireMock server
  - [ ] 11.2 Crear stubs WireMock para Product API: búsqueda por nombre, búsqueda por barcode, obtener por ID, decrementar stock, incrementar stock, respuesta 503
  - [ ] 11.3 Crear stubs WireMock para Customer API: búsqueda por nombre, búsqueda por documento, obtener por ID con crédito APPROVED/REJECTED/PENDING, respuesta 503
  - [ ] 11.4 Implementar prueba de integración: flujo venta efectivo completo (crear → agregar ítems → checkout → verificar recibo con vuelto correcto)
  - [ ] 11.5 Implementar prueba de integración: flujo venta crédito (crear → asociar cliente → agregar ítems → checkout → verificar CreditReference en recibo)
  - [ ] 11.6 Implementar prueba de integración: flujo congelar y reanudar (crear → agregar ítems → congelar → listar congeladas → reanudar → checkout)
  - [ ] 11.7 Implementar prueba de integración: flujo devolución total (completar venta → devolución total → verificar estado RETURNED → verificar stock restaurado)
  - [ ] 11.8 Implementar prueba de integración: flujo devolución parcial (completar venta → devolver 2 de 5 ítems → verificar PARTIALLY_RETURNED → segunda devolución parcial)
  - [ ] 11.9 Implementar prueba de integración: flujo cancelación (crear → agregar ítems → cancelar → verificar que no se puede modificar ni hacer checkout)
  - [ ] 11.10 Implementar prueba de integración: Product API caída durante checkout → 503, venta permanece ACTIVE
  - [ ] 11.11 Implementar prueba de integración: stock insuficiente en checkout → 409 con lista de ítems
  - **Referencia / Reference:** Requirements §17; Design §12

- [ ] 12. Verificación de cobertura y ajustes finales / Coverage verification and final adjustments
  - [ ] 12.1 Ejecutar `mvn verify` (o `gradle check`) y revisar reporte JaCoCo en `target/site/jacoco/index.html`
  - [ ] 12.2 Identificar líneas no cubiertas en la capa de servicios y agregar pruebas unitarias faltantes hasta alcanzar ≥90%
  - [ ] 12.3 Identificar líneas no cubiertas en el resto del proyecto y agregar pruebas hasta alcanzar ≥80% global
  - [ ] 12.4 Verificar que Swagger UI está accesible en `/swagger-ui.html` y todos los endpoints están documentados
  - [ ] 12.5 Verificar que la aplicación arranca correctamente con `mvn spring-boot:run` y responde en `/api/v1/sales`
  - [ ] 12.6 Crear archivo `my-prompt.txt` en la raíz del proyecto con el prompt de especificación original entregado a Kiro (requerimiento del taller)
  - **Referencia / Reference:** Requirements §16, §17; Design §12
