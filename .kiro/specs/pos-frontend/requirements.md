# Documento de Requisitos / Requirements Document
## POS Frontend — Supermarket Point of Sale

---

## Introducción / Introduction

**ES:** El frontend POS es una aplicación web React + TypeScript que permite a los cajeros de supermercado gestionar transacciones de venta en terminales POS. Consume la **Sales API** (backend Spring Boot) y expone flujos completos de: búsqueda de productos por nombre y código de barras, gestión de carrito/venta, descuentos, checkout con efectivo y crédito, recibos, devoluciones y congelamiento de ventas.

**EN:** The POS frontend is a React + TypeScript web application that allows supermarket cashiers to manage sales transactions at POS terminals. It consumes the **Sales API** (Spring Boot backend) and exposes complete flows for: product search by name and barcode, cart/sale management, discounts, cash and credit checkout, receipts, returns, and sale freezing.

---

## Glosario / Glossary

- **Sale / Venta**: Transacción activa en el terminal POS. / Active transaction at the POS terminal.
- **SaleItem / Línea de venta**: Producto agregado a la venta con cantidad y precio snapshot. / Product added to the sale with quantity and price snapshot.
- **Cart / Carrito**: Vista de la venta activa con sus líneas. / View of the active sale with its lines.
- **Barcode / Código de barras**: Identificador de producto escaneable o ingresado manualmente. / Scannable or manually entered product identifier.
- **Cashier / Cajero**: Usuario operador del terminal. / Terminal operator user.
- **Terminal**: Dispositivo POS identificado por un ID. / POS device identified by an ID.
- **Receipt / Recibo**: Documento generado tras checkout exitoso. / Document generated after successful checkout.
- **SaleStatus**: ACTIVE, FROZEN, COMPLETED, CANCELLED, RETURNED, PARTIALLY_RETURNED.
- **MSW**: Mock Service Worker — intercepta peticiones HTTP en pruebas. / Intercepts HTTP requests in tests.

---

## Requisitos / Requirements

### Requisito 1: Búsqueda de Productos / Requirement 1: Product Search

**Historia de Usuario (ES):** Como cajero, quiero buscar productos por nombre o código de barras para agregarlos rápidamente a la venta.

**User Story (EN):** As a cashier, I want to search for products by name or barcode to quickly add them to the sale.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero escribe al menos 2 caracteres en el campo de búsqueda por nombre, LA UI DEBERÁ mostrar una lista de productos coincidentes con: nombre, código de barras, precio unitario, stock disponible y categoría.
   **EN:** WHEN the cashier types at least 2 characters in the name search field, THE UI SHALL display a list of matching products with: name, barcode, unit price, available stock, and category.

2. **ES:** CUANDO el cajero ingresa o escanea un código de barras, LA UI DEBERÁ buscar el producto exacto y mostrarlo inmediatamente.
   **EN:** WHEN the cashier enters or scans a barcode, THE UI SHALL search for the exact product and display it immediately.

3. **ES:** SI el backend responde con HTTP 503, LA UI DEBERÁ mostrar un mensaje de error claro indicando que el servicio de productos no está disponible.
   **EN:** IF the backend responds with HTTP 503, THE UI SHALL display a clear error message indicating the product service is unavailable.

4. **ES:** CUANDO la búsqueda no retorna resultados, LA UI DEBERÁ mostrar un mensaje indicando que no se encontraron productos.
   **EN:** WHEN the search returns no results, THE UI SHALL display a message indicating no products were found.

5. **ES:** MIENTRAS se realiza la búsqueda, LA UI DEBERÁ mostrar un indicador de carga.
   **EN:** WHILE the search is in progress, THE UI SHALL display a loading indicator.

---

### Requisito 2: Escaneo de Código de Barras / Requirement 2: Barcode Scanning

**Historia de Usuario (ES):** Como cajero, quiero escanear códigos de barras con la cámara o ingresarlos manualmente para agregar productos sin escribir el nombre.

**User Story (EN):** As a cashier, I want to scan barcodes with the camera or enter them manually to add products without typing the name.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero activa el escáner de cámara, LA UI DEBERÁ solicitar permiso de cámara y mostrar una vista previa en tiempo real.
   **EN:** WHEN the cashier activates the camera scanner, THE UI SHALL request camera permission and display a real-time preview.

2. **ES:** CUANDO la cámara detecta un código de barras válido, LA UI DEBERÁ buscar automáticamente el producto y agregarlo a la venta.
   **EN:** WHEN the camera detects a valid barcode, THE UI SHALL automatically search for the product and add it to the sale.

3. **ES:** CUANDO el cajero ingresa un código de barras manualmente y presiona Enter, LA UI DEBERÁ buscar el producto correspondiente.
   **EN:** WHEN the cashier manually enters a barcode and presses Enter, THE UI SHALL search for the corresponding product.

4. **ES:** SI el código de barras no corresponde a ningún producto, LA UI DEBERÁ mostrar un mensaje de error identificando el código no encontrado.
   **EN:** IF the barcode does not match any product, THE UI SHALL display an error message identifying the not-found code.

---

### Requisito 3: Gestión del Carrito / Requirement 3: Cart Management

**Historia de Usuario (ES):** Como cajero, quiero gestionar las líneas de la venta activa para construir la lista de compras del cliente.

**User Story (EN):** As a cashier, I want to manage the lines of the active sale to build the customer's purchase list.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero agrega un producto ya existente en el carrito, LA UI DEBERÁ incrementar la cantidad de esa línea en lugar de crear una duplicada.
   **EN:** WHEN the cashier adds a product already in the cart, THE UI SHALL increment the quantity of that line instead of creating a duplicate.

2. **ES:** CUANDO el cajero modifica la cantidad de una línea, LA UI DEBERÁ enviar la actualización al backend y reflejar los nuevos totales devueltos por el servidor.
   **EN:** WHEN the cashier modifies a line quantity, THE UI SHALL send the update to the backend and reflect the new totals returned by the server.

3. **ES:** CUANDO el cajero elimina una línea del carrito, LA UI DEBERÁ confirmar la acción y actualizar los totales.
   **EN:** WHEN the cashier removes a line from the cart, THE UI SHALL confirm the action and update the totals.

4. **ES:** LA UI DEBERÁ mostrar en todo momento: subtotal, impuesto (19%), descuento aplicado y total final, usando los valores devueltos por el servidor como fuente de verdad.
   **EN:** THE UI SHALL always display: subtotal, tax (19%), applied discount, and final total, using server-returned values as the source of truth.

5. **ES:** SI el backend responde con HTTP 409 al agregar un ítem (stock insuficiente), LA UI DEBERÁ mostrar el mensaje de error con el stock disponible.
   **EN:** IF the backend responds with HTTP 409 when adding an item (insufficient stock), THE UI SHALL display the error message with the available stock.

6. **ES:** MIENTRAS la venta tiene estado distinto de ACTIVE, LA UI DEBERÁ deshabilitar los controles de edición del carrito.
   **EN:** WHILE the sale has a status other than ACTIVE, THE UI SHALL disable cart editing controls.

---

### Requisito 4: Búsqueda y Selección de Clientes / Requirement 4: Customer Search and Selection

**Historia de Usuario (ES):** Como cajero, quiero buscar y asociar un cliente a la venta para ventas a crédito o para personalizar el recibo.

**User Story (EN):** As a cashier, I want to search and associate a customer with the sale for credit sales or to personalize the receipt.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero busca un cliente por nombre parcial o documento exacto, LA UI DEBERÁ mostrar los resultados con: nombre completo, tipo de documento, número de documento y estado de crédito.
   **EN:** WHEN the cashier searches for a customer by partial name or exact document, THE UI SHALL display results with: full name, document type, document number, and credit status.

2. **ES:** CUANDO el cajero selecciona un cliente con estado de crédito APPROVED, LA UI DEBERÁ habilitarlo para ventas a crédito.
   **EN:** WHEN the cashier selects a customer with APPROVED credit status, THE UI SHALL enable them for credit sales.

3. **ES:** SI el cajero intenta hacer checkout a crédito sin cliente asociado, LA UI DEBERÁ bloquear el checkout y mostrar un mensaje indicando que se requiere un cliente.
   **EN:** IF the cashier attempts credit checkout without an associated customer, THE UI SHALL block checkout and display a message indicating a customer is required.

4. **ES:** SI el cliente asociado tiene estado de crédito REJECTED o PENDING, LA UI DEBERÁ mostrar una advertencia visible y bloquear el checkout a crédito.
   **EN:** IF the associated customer has REJECTED or PENDING credit status, THE UI SHALL display a visible warning and block credit checkout.

---

### Requisito 5: Aplicación de Descuentos / Requirement 5: Discount Application

**Historia de Usuario (ES):** Como cajero, quiero aplicar descuentos por porcentaje o monto fijo a la venta para reflejar promociones.

**User Story (EN):** As a cashier, I want to apply percentage or fixed-amount discounts to the sale to reflect promotions.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero aplica un descuento porcentual, LA UI DEBERÁ enviar el tipo PERCENTAGE y el valor al backend y mostrar el desglose actualizado (subtotal, impuesto, descuento, total).
   **EN:** WHEN the cashier applies a percentage discount, THE UI SHALL send type PERCENTAGE and value to the backend and display the updated breakdown (subtotal, tax, discount, total).

2. **ES:** CUANDO el cajero aplica un descuento de monto fijo, LA UI DEBERÁ enviar el tipo FIXED_AMOUNT y el valor al backend y mostrar el desglose actualizado.
   **EN:** WHEN the cashier applies a fixed-amount discount, THE UI SHALL send type FIXED_AMOUNT and value to the backend and display the updated breakdown.

3. **ES:** SI el descuento excede el subtotal, LA UI DEBERÁ mostrar el error 422 del backend con un mensaje claro.
   **EN:** IF the discount exceeds the subtotal, THE UI SHALL display the backend's 422 error with a clear message.

4. **ES:** LA UI DEBERÁ permitir remover el descuento aplicado y restaurar los totales originales.
   **EN:** THE UI SHALL allow removing the applied discount and restoring the original totals.

---

### Requisito 6: Checkout — Pago en Efectivo / Requirement 6: Checkout — Cash Payment

**Historia de Usuario (ES):** Como cajero, quiero completar una venta en efectivo ingresando el monto recibido para que el sistema calcule el vuelto.

**User Story (EN):** As a cashier, I want to complete a cash sale by entering the amount received so the system calculates the change.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero selecciona pago en efectivo e ingresa el monto recibido, LA UI DEBERÁ validar que el monto sea ≥ total antes de enviar al backend.
   **EN:** WHEN the cashier selects cash payment and enters the amount received, THE UI SHALL validate that the amount is ≥ total before sending to the backend.

2. **ES:** CUANDO el checkout es exitoso, LA UI DEBERÁ mostrar el vuelto calculado de forma prominente y navegar a la pantalla de recibo.
   **EN:** WHEN checkout is successful, THE UI SHALL display the calculated change prominently and navigate to the receipt screen.

3. **ES:** SI el backend responde con HTTP 409 (stock insuficiente), LA UI DEBERÁ mostrar la lista de productos sin stock con sus cantidades disponibles.
   **EN:** IF the backend responds with HTTP 409 (insufficient stock), THE UI SHALL display the list of out-of-stock products with their available quantities.

4. **ES:** SI el backend responde con HTTP 503 durante el checkout, LA UI DEBERÁ mostrar un error y mantener la venta en estado ACTIVE para reintentar.
   **EN:** IF the backend responds with HTTP 503 during checkout, THE UI SHALL display an error and keep the sale in ACTIVE state for retry.

---

### Requisito 7: Checkout — Pago a Crédito / Requirement 7: Checkout — Credit Payment

**Historia de Usuario (ES):** Como cajero, quiero completar una venta a crédito para un cliente aprobado y obtener la referencia de crédito.

**User Story (EN):** As a cashier, I want to complete a credit sale for an approved customer and obtain the credit reference.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero selecciona pago a crédito con cliente APPROVED asociado, LA UI DEBERÁ enviar el checkout al backend y mostrar la referencia de crédito generada en el recibo.
   **EN:** WHEN the cashier selects credit payment with an APPROVED customer associated, THE UI SHALL send the checkout to the backend and display the generated credit reference on the receipt.

2. **ES:** SI el backend responde con HTTP 422 (crédito no aprobado), LA UI DEBERÁ mostrar el mensaje de error y no cambiar el estado de la venta.
   **EN:** IF the backend responds with HTTP 422 (credit not approved), THE UI SHALL display the error message and not change the sale state.

---

### Requisito 8: Congelamiento y Reanudación / Requirement 8: Freeze and Resume

**Historia de Usuario (ES):** Como cajero, quiero congelar una venta activa para atender a otro cliente y reanudarla después.

**User Story (EN):** As a cashier, I want to freeze an active sale to attend another customer and resume it later.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero congela una venta ACTIVE, LA UI DEBERÁ cambiar el estado visual a FROZEN y mostrar la opción de iniciar una nueva venta.
   **EN:** WHEN the cashier freezes an ACTIVE sale, THE UI SHALL change the visual state to FROZEN and show the option to start a new sale.

2. **ES:** CUANDO el cajero accede a la lista de ventas congeladas del terminal, LA UI DEBERÁ mostrarlas ordenadas por fecha de congelamiento con opción de reanudar cada una.
   **EN:** WHEN the cashier accesses the frozen sales list for the terminal, THE UI SHALL display them ordered by freeze date with an option to resume each one.

3. **ES:** CUANDO el cajero reanuda una venta FROZEN, LA UI DEBERÁ cargar el carrito con los ítems y totales previos y cambiar el estado a ACTIVE.
   **EN:** WHEN the cashier resumes a FROZEN sale, THE UI SHALL load the cart with previous items and totals and change the state to ACTIVE.

4. **ES:** SI una venta congelada fue cancelada por expiración (TTL 2h), LA UI DEBERÁ mostrar un aviso indicando que la venta expiró y ya no está disponible.
   **EN:** IF a frozen sale was cancelled due to expiry (TTL 2h), THE UI SHALL display a notice indicating the sale expired and is no longer available.

---

### Requisito 9: Cancelación de Venta / Requirement 9: Sale Cancellation

**Historia de Usuario (ES):** Como cajero, quiero cancelar una venta activa o congelada con un motivo para anular la transacción.

**User Story (EN):** As a cashier, I want to cancel an active or frozen sale with a reason to void the transaction.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero cancela una venta, LA UI DEBERÁ mostrar un formulario de confirmación con campo de motivo (máx. 255 caracteres) antes de enviar al backend.
   **EN:** WHEN the cashier cancels a sale, THE UI SHALL display a confirmation form with a reason field (max 255 characters) before sending to the backend.

2. **ES:** CUANDO la cancelación es exitosa, LA UI DEBERÁ mostrar la venta en estado CANCELLED y deshabilitar todos los controles de edición y checkout.
   **EN:** WHEN cancellation is successful, THE UI SHALL display the sale in CANCELLED state and disable all editing and checkout controls.

3. **ES:** SI la venta no está en estado ACTIVE o FROZEN, LA UI DEBERÁ ocultar o deshabilitar el botón de cancelar.
   **EN:** IF the sale is not in ACTIVE or FROZEN state, THE UI SHALL hide or disable the cancel button.

---

### Requisito 10: Recibos / Requirement 10: Receipts

**Historia de Usuario (ES):** Como cajero, quiero ver e imprimir el recibo tras el checkout para entregárselo al cliente.

**User Story (EN):** As a cashier, I want to view and print the receipt after checkout to give it to the customer.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el checkout es exitoso, LA UI DEBERÁ mostrar automáticamente el recibo con: nombre de tienda, terminal, cajero, fecha/hora, cliente (si hay), líneas de productos, subtotal, impuesto, descuento, total, método de pago, monto recibido/vuelto (efectivo) o referencia de crédito, y TransactionId.
   **EN:** WHEN checkout is successful, THE UI SHALL automatically display the receipt with: store name, terminal, cashier, date/time, customer (if any), product lines, subtotal, tax, discount, total, payment method, amount received/change (cash) or credit reference, and TransactionId.

2. **ES:** LA UI DEBERÁ ofrecer un botón de impresión que use `window.print()` o genere un PDF del recibo.
   **EN:** THE UI SHALL offer a print button that uses `window.print()` or generates a PDF of the receipt.

3. **ES:** CUANDO el cajero busca un recibo por TransactionId, LA UI DEBERÁ mostrarlo completo.
   **EN:** WHEN the cashier searches for a receipt by TransactionId, THE UI SHALL display it in full.

---

### Requisito 11: Devoluciones / Requirement 11: Returns

**Historia de Usuario (ES):** Como cajero, quiero procesar devoluciones totales o parciales de ventas completadas.

**User Story (EN):** As a cashier, I want to process full or partial returns of completed sales.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero inicia una devolución total de una venta COMPLETED, LA UI DEBERÁ solicitar un motivo y enviar la solicitud al backend, luego mostrar el recibo de devolución.
   **EN:** WHEN the cashier initiates a full return of a COMPLETED sale, THE UI SHALL request a reason and send the request to the backend, then display the return receipt.

2. **ES:** CUANDO el cajero inicia una devolución parcial, LA UI DEBERÁ mostrar las líneas de la venta con campos de cantidad devolvible (≤ comprada) y motivo por ítem.
   **EN:** WHEN the cashier initiates a partial return, THE UI SHALL display the sale lines with returnable quantity fields (≤ purchased) and per-item reason fields.

3. **ES:** CUANDO la devolución es exitosa, LA UI DEBERÁ mostrar el recibo de devolución con referencia al TransactionId original.
   **EN:** WHEN the return is successful, THE UI SHALL display the return receipt with reference to the original TransactionId.

4. **ES:** PARA ventas a crédito devueltas, LA UI DEBERÁ mostrar la nota de crédito en lugar de un reembolso en efectivo.
   **EN:** FOR returned credit sales, THE UI SHALL display the credit note instead of a cash refund.

---

### Requisito 12: Manejo de Errores y Resiliencia / Requirement 12: Error Handling and Resilience

**Historia de Usuario (ES):** Como cajero, quiero recibir mensajes de error claros y operativos para saber qué hacer cuando algo falla.

**User Story (EN):** As a cashier, I want to receive clear, operational error messages to know what to do when something fails.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** LA UI DEBERÁ mapear los códigos HTTP del backend a mensajes en lenguaje operativo: 503 → "Servicio no disponible, intente de nuevo", 409 → lista de ítems sin stock, 422 → mensaje específico del error de negocio, 404 → "No encontrado".
   **EN:** THE UI SHALL map backend HTTP codes to operational language messages: 503 → "Service unavailable, please try again", 409 → list of out-of-stock items, 422 → specific business error message, 404 → "Not found".

2. **ES:** MIENTRAS se procesa una operación, LA UI DEBERÁ mostrar un estado de carga y deshabilitar el botón de acción para evitar doble envío.
   **EN:** WHILE an operation is being processed, THE UI SHALL display a loading state and disable the action button to prevent double submission.

3. **ES:** CUANDO una operación falla con error de red, LA UI DEBERÁ mostrar un mensaje de desconexión y ofrecer la opción de reintentar.
   **EN:** WHEN an operation fails with a network error, THE UI SHALL display a disconnection message and offer a retry option.

---

### Requisito 13: Accesibilidad y Diseño Táctil / Requirement 13: Accessibility and Touch Design

**Historia de Usuario (ES):** Como cajero usando una pantalla táctil, quiero una interfaz con botones grandes y buen contraste para operar rápidamente.

**User Story (EN):** As a cashier using a touchscreen, I want an interface with large buttons and good contrast to operate quickly.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** TODOS los botones de acción principal DEBERÁN tener un área táctil mínima de 44×44px.
   **EN:** ALL primary action buttons SHALL have a minimum touch target of 44×44px.

2. **ES:** LA UI DEBERÁ cumplir con contraste de color WCAG AA (ratio ≥ 4.5:1 para texto normal).
   **EN:** THE UI SHALL meet WCAG AA color contrast (ratio ≥ 4.5:1 for normal text).

3. **ES:** TODOS los campos de formulario y botones DEBERÁN tener etiquetas accesibles (`aria-label` o `<label>` asociado).
   **EN:** ALL form fields and buttons SHALL have accessible labels (`aria-label` or associated `<label>`).

---

### Requisito 14: Autenticación del Cajero / Requirement 14: Cashier Authentication

**Historia de Usuario (ES):** Como cajero, quiero iniciar sesión con mis credenciales para que mis operaciones queden registradas con mi ID.

**User Story (EN):** As a cashier, I want to log in with my credentials so my operations are recorded with my ID.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO el cajero inicia sesión, LA UI DEBERÁ almacenar el cashier ID y terminal ID en el contexto de sesión y enviarlos en la cabecera `X-Cashier-Id` de todas las peticiones.
   **EN:** WHEN the cashier logs in, THE UI SHALL store the cashier ID and terminal ID in the session context and send them in the `X-Cashier-Id` header of all requests.

2. **ES:** CUANDO la sesión expira o el cajero cierra sesión, LA UI DEBERÁ redirigir al login y limpiar el estado local.
   **EN:** WHEN the session expires or the cashier logs out, THE UI SHALL redirect to login and clear local state.

3. **ES:** LAS rutas de la aplicación DEBERÁN estar protegidas y redirigir al login si no hay sesión activa.
   **EN:** THE application routes SHALL be protected and redirect to login if there is no active session.
