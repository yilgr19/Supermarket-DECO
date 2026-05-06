# Documento de Requisitos / Requirements Document

## Introducción / Introduction

**ES:** La **Sales API** es un servicio REST que gestiona todas las transacciones de venta en terminales POS de supermercado.
Integra dos servicios externos — la **Product API** (catálogo de productos, stock, precios) y la
**Customer API** (registros de clientes, estado de crédito) — para orquestar el ciclo de vida completo de la venta:
creación, gestión de ítems, pago, checkout, congelamiento, cancelación y devoluciones.

El sistema está implementado en Java 17+ con Spring Boot 3.x y expone una API REST JSON consumida por los clientes
de terminales POS. Todos los valores monetarios usan `BigDecimal` con dos decimales; la aritmética interna se
realiza en centavos enteros para evitar errores de punto flotante.

**EN:** The **Sales API** is a REST service that manages all sales transactions at supermarket POS terminals.
It integrates with two external services — the **Product API** (product catalog, stock, pricing) and the
**Customer API** (customer records, credit status) — to orchestrate the complete sale lifecycle: creation,
item management, payment, checkout, freezing, cancellation, and returns.

The system is implemented in Java 17+ with Spring Boot 3.x and exposes a JSON REST API consumed by POS
terminal clients. All monetary values use `BigDecimal` with two decimal places; internal arithmetic is
performed in integer cents to avoid floating-point errors.

---

## Glosario / Glossary

- **Sales_API**: El servicio REST Spring Boot especificado en este documento. / The Spring Boot REST service being specified in this document.
- **Product_API**: El servicio REST externo que gestiona el catálogo de productos, niveles de stock y precios. / The external REST service that owns the product catalog, stock levels, and pricing.
- **Customer_API**: El servicio REST externo que gestiona los registros de clientes y el estado de crédito. / The external REST service that owns customer records and credit status.
- **Sale**: Agregado que representa una única transacción POS, identificado por un ID de venta único. / An aggregate representing a single POS transaction, identified by a unique sale ID.
- **SaleItem**: Línea dentro de una Sale que registra el ID del producto, snapshot del nombre, snapshot del precio unitario, cantidad y total de línea. / A line within a Sale recording product ID, name snapshot, unit price snapshot, quantity, and line total.
- **Receipt**: Documento inmutable generado en un checkout exitoso o devolución, que contiene todos los detalles de la transacción. / An immutable document generated on successful checkout or return, containing all transaction details.
- **Terminal**: Dispositivo POS físico o lógico identificado por un string de terminal ID. / A physical or logical POS device identified by a terminal ID string.
- **Cashier**: El operador del terminal, identificado por un cashier ID suministrado en la cabecera de la petición. / The operator of the terminal, identified by a cashier ID supplied in the request header.
- **PaymentType**: Enumeración de métodos de pago aceptados: `CASH` o `CREDIT`. / Enumeration of accepted payment methods: `CASH` or `CREDIT`.
- **SaleStatus**: Enumeración de estados del ciclo de vida de la venta: `ACTIVE`, `COMPLETED`, `CANCELLED`, `FROZEN`, `RETURNED`, `PARTIALLY_RETURNED`. / Enumeration of sale lifecycle states: `ACTIVE`, `COMPLETED`, `CANCELLED`, `FROZEN`, `RETURNED`, `PARTIALLY_RETURNED`.
- **CreditStatus**: Enumeración de estados de crédito del cliente devueltos por la Customer_API: `APPROVED`, `REJECTED`, `PENDING`. / Enumeration of customer credit states returned by the Customer_API: `APPROVED`, `REJECTED`, `PENDING`.
- **Subtotal**: La suma de todos los totales de línea (precio unitario × cantidad) antes de impuesto y descuento. / The sum of all line totals (unit price × quantity) before tax and discount.
- **Tax**: El monto añadido al subtotal, calculado como `subtotal × tax_rate`. / The amount added to the subtotal, calculated as `subtotal × tax_rate`.
- **Discount**: Reducción opcional aplicada a la venta, expresada como porcentaje o monto fijo. / An optional reduction applied to the sale, expressed as a percentage or a fixed monetary amount.
- **Total**: El monto final a pagar: `subtotal + tax − discount`. / The final amount due: `subtotal + tax − discount`.
- **CreditReference**: Identificador alfanumérico autogenerado registrado en ventas a crédito. / An auto-generated alphanumeric identifier recorded on credit sales.
- **TransactionId**: Identificador globalmente único asignado a cada recibo de venta completada. / A globally unique identifier assigned to each completed sale receipt.
- **HoldExpiry**: Duración configurable tras la cual una venta `FROZEN` se cancela automáticamente (por defecto: 2 horas). / The configurable duration after which a `FROZEN` sale is automatically cancelled (default: 2 hours).
- **TaxRate**: Porcentaje configurable aplicado al subtotal (por defecto: 19%). / The configurable percentage applied to the subtotal (default: 19%).

---

## Requisitos / Requirements

### Requisito 1: Búsqueda de Productos vía Product API / Requirement 1: Product Search via Product API

**Historia de Usuario (ES):** Como cajero, quiero buscar productos por nombre o código de barras, para poder encontrar y agregar ítems a una venta rápidamente.

**User Story (EN):** As a cashier, I want to search for products by name or barcode, so that I can quickly find and add items to a sale.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero envía una solicitud de búsqueda de producto con una cadena de nombre parcial, LA Sales_API DEBERÁ reenviar la consulta a la Product_API y devolver todos los productos coincidentes cuyos nombres contengan la cadena de búsqueda (sin distinción de mayúsculas).
   **EN:** WHEN a cashier submits a product search request with a partial name string, THE Sales_API SHALL forward the query to the Product_API and return all matching products whose names contain the search string (case-insensitive).

2. **ES:** CUANDO un cajero envía una solicitud de búsqueda de producto con un valor de código de barras, LA Sales_API DEBERÁ reenviar el código de barras a la Product_API y devolver el producto coincidente.
   **EN:** WHEN a cashier submits a product search request with a barcode value, THE Sales_API SHALL forward the barcode to the Product_API and return the matching product.

3. **ES:** LA Sales_API DEBERÁ incluir los siguientes campos en cada resultado de búsqueda de producto: ID de producto, nombre del producto, código de barras, precio unitario, cantidad de stock disponible y categoría.
   **EN:** THE Sales_API SHALL include the following fields in every product search result: product ID, product name, barcode, unit price, available stock quantity, and category.

4. **ES:** SI la Product_API no está disponible o devuelve un error de conexión, ENTONCES LA Sales_API DEBERÁ devolver HTTP 503 con un mensaje indicando que el servicio de productos no está disponible temporalmente.
   **EN:** IF the Product_API is unavailable or returns a connection error, THEN THE Sales_API SHALL return HTTP 503 with a message indicating that the product service is temporarily unavailable.

5. **ES:** CUANDO una búsqueda de producto no devuelve resultados, LA Sales_API DEBERÁ devolver HTTP 200 con una lista vacía.
   **EN:** WHEN a product search returns no results, THE Sales_API SHALL return HTTP 200 with an empty list.

---

### Requisito 2: Búsqueda de Clientes vía Customer API / Requirement 2: Customer Search via Customer API

**Historia de Usuario (ES):** Como cajero, quiero buscar clientes por nombre o número de documento, para poder asociar un cliente a una venta cuando sea necesario.

**User Story (EN):** As a cashier, I want to search for customers by name or document number, so that I can associate a customer with a sale when required.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero envía una solicitud de búsqueda de cliente con una cadena de nombre parcial, LA Sales_API DEBERÁ reenviar la consulta a la Customer_API y devolver todos los clientes coincidentes cuyos nombres completos contengan la cadena de búsqueda (sin distinción de mayúsculas).
   **EN:** WHEN a cashier submits a customer search request with a partial name string, THE Sales_API SHALL forward the query to the Customer_API and return all matching customers whose full names contain the search string (case-insensitive).

2. **ES:** CUANDO un cajero envía una solicitud de búsqueda de cliente con un número de documento, LA Sales_API DEBERÁ reenviar el número de documento exacto a la Customer_API y devolver el cliente coincidente.
   **EN:** WHEN a cashier submits a customer search request with a document number, THE Sales_API SHALL forward the exact document number to the Customer_API and return the matching customer.

3. **ES:** LA Sales_API DEBERÁ incluir los siguientes campos en cada resultado de búsqueda de cliente: ID de cliente, nombre completo, tipo de documento, número de documento y estado de crédito.
   **EN:** THE Sales_API SHALL include the following fields in every customer search result: customer ID, full name, document type, document number, and credit status.

4. **ES:** SI la Customer_API no está disponible o devuelve un error de conexión, ENTONCES LA Sales_API DEBERÁ devolver HTTP 503 con un mensaje indicando que el servicio de clientes no está disponible temporalmente.
   **EN:** IF the Customer_API is unavailable or returns a connection error, THEN THE Sales_API SHALL return HTTP 503 with a message indicating that the customer service is temporarily unavailable.

5. **ES:** CUANDO una búsqueda de cliente no devuelve resultados, LA Sales_API DEBERÁ devolver HTTP 200 con una lista vacía.
   **EN:** WHEN a customer search returns no results, THE Sales_API SHALL return HTTP 200 with an empty list.

---

### Requisito 3: Creación de Venta / Requirement 3: Sale Creation

**Historia de Usuario (ES):** Como cajero, quiero crear una nueva venta asociada a mi terminal, para poder comenzar a registrar ítems de una transacción de cliente.

**User Story (EN):** As a cashier, I want to create a new sale associated with my terminal, so that I can begin recording items for a customer transaction.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero envía una solicitud de creación de venta con un terminal ID y cashier ID, LA Sales_API DEBERÁ crear una nueva Sale con estado `ACTIVE` y devolver el sale ID, terminal ID, cashier ID, estado y timestamp de creación.
   **EN:** WHEN a cashier sends a create-sale request with a terminal ID and cashier ID, THE Sales_API SHALL create a new Sale with status `ACTIVE` and return the sale ID, terminal ID, cashier ID, status, and creation timestamp.

2. **ES:** LA Sales_API DEBERÁ registrar el terminal ID proporcionado en el cuerpo de la solicitud de creación de venta.
   **EN:** THE Sales_API SHALL record the terminal ID provided in the create-sale request body.

3. **ES:** LA Sales_API DEBERÁ registrar el cashier ID proporcionado en la cabecera de solicitud `X-Cashier-Id`.
   **EN:** THE Sales_API SHALL record the cashier ID provided in the `X-Cashier-Id` request header.

4. **ES:** CUANDO una solicitud de creación de venta incluye un customer ID opcional, LA Sales_API DEBERÁ asociar ese cliente con la Sale.
   **EN:** WHEN a create-sale request includes an optional customer ID, THE Sales_API SHALL associate that customer with the Sale.

5. **ES:** LA Sales_API DEBERÁ inicializar el subtotal, impuesto, descuento y total de una Sale recién creada en cero.
   **EN:** THE Sales_API SHALL initialise the subtotal, tax, discount, and total of a newly created Sale to zero.

---

### Requisito 4: Agregar Ítem a la Venta / Requirement 4: Add Item to Sale

**Historia de Usuario (ES):** Como cajero, quiero agregar productos a una venta activa por ID de producto o código de barras, para poder construir la lista de compras del cliente.

**User Story (EN):** As a cashier, I want to add products to an active sale by product ID or barcode, so that I can build the customer's purchase list.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero agrega un ítem a una venta `ACTIVE` usando un product ID, LA Sales_API DEBERÁ llamar a la Product_API para obtener los detalles del producto y crear un SaleItem con un snapshot del nombre y precio unitario del producto al momento de la adición.
   **EN:** WHEN a cashier adds an item to an `ACTIVE` sale using a product ID, THE Sales_API SHALL call the Product_API to retrieve the product details and create a SaleItem with a snapshot of the product name and unit price at the time of addition.

2. **ES:** CUANDO un cajero agrega un ítem a una venta `ACTIVE` usando un código de barras, LA Sales_API DEBERÁ llamar a la Product_API para obtener el producto por código de barras y crear un SaleItem con un snapshot del nombre y precio unitario del producto.
   **EN:** WHEN a cashier adds an item to an `ACTIVE` sale using a barcode, THE Sales_API SHALL call the Product_API to retrieve the product by barcode and create a SaleItem with a snapshot of the product name and unit price.

3. **ES:** CUANDO un cajero agrega un ítem cuyo product ID ya existe en la Sale, LA Sales_API DEBERÁ incrementar la cantidad del SaleItem existente por el monto solicitado en lugar de crear una línea duplicada.
   **EN:** WHEN a cashier adds an item whose product ID already exists in the Sale, THE Sales_API SHALL increment the existing SaleItem quantity by the requested amount rather than creating a duplicate line.

4. **ES:** SI la cantidad solicitada para un ítem es menor que 1, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que la cantidad debe ser al menos 1.
   **EN:** IF the requested quantity for an item is less than 1, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that quantity must be at least 1.

5. **ES:** CUANDO un cajero agrega un ítem, LA Sales_API DEBERÁ llamar a la Product_API para verificar que el stock disponible sea mayor o igual a la cantidad total solicitada para ese producto en la Sale.
   **EN:** WHEN a cashier adds an item, THE Sales_API SHALL call the Product_API to verify that the available stock is greater than or equal to the total requested quantity for that product in the Sale.

6. **ES:** SI el stock disponible es menor que la cantidad total solicitada, ENTONCES LA Sales_API DEBERÁ devolver HTTP 409 con un mensaje identificando el producto y la cantidad de stock disponible.
   **EN:** IF the available stock is less than the total requested quantity, THEN THE Sales_API SHALL return HTTP 409 with a message identifying the product and the available stock quantity.

7. **ES:** CUANDO un ítem es agregado o actualizado exitosamente, LA Sales_API DEBERÁ recalcular y persistir el subtotal, impuesto y total de la Sale.
   **EN:** WHEN an item is successfully added or updated, THE Sales_API SHALL recalculate and persist the Sale subtotal, tax, and total.

8. **ES:** SI un cajero intenta agregar un ítem a una Sale cuyo estado no es `ACTIVE`, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que los ítems solo pueden agregarse a ventas activas.
   **EN:** IF a cashier attempts to add an item to a Sale whose status is not `ACTIVE`, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that items can only be added to active sales.

9. **ES:** SI la Product_API no está disponible al agregar un ítem, ENTONCES LA Sales_API DEBERÁ devolver HTTP 503 con un mensaje indicando que el servicio de productos no está disponible temporalmente.
   **EN:** IF the Product_API is unavailable when adding an item, THEN THE Sales_API SHALL return HTTP 503 with a message indicating that the product service is temporarily unavailable.

---

### Requisito 5: Actualizar y Eliminar Ítems de la Venta / Requirement 5: Update and Remove Sale Items

**Historia de Usuario (ES):** Como cajero, quiero actualizar la cantidad de un ítem o eliminarlo de la venta, para poder corregir errores antes del checkout.

**User Story (EN):** As a cashier, I want to update the quantity of an item or remove it from the sale, so that I can correct mistakes before checkout.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero actualiza la cantidad de un SaleItem existente en una venta `ACTIVE`, LA Sales_API DEBERÁ reemplazar la cantidad del ítem con el nuevo valor y recalcular los totales de la Sale.
   **EN:** WHEN a cashier updates the quantity of an existing SaleItem in an `ACTIVE` sale, THE Sales_API SHALL replace the item quantity with the new value and recalculate the Sale totals.

2. **ES:** SI la cantidad actualizada es menor que 1, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que la cantidad debe ser al menos 1.
   **EN:** IF the updated quantity is less than 1, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that quantity must be at least 1.

3. **ES:** CUANDO un cajero actualiza la cantidad de un ítem, LA Sales_API DEBERÁ llamar a la Product_API para verificar que el stock disponible sea mayor o igual a la nueva cantidad.
   **EN:** WHEN a cashier updates an item quantity, THE Sales_API SHALL call the Product_API to verify that the available stock is greater than or equal to the new quantity.

4. **ES:** SI el stock disponible es menor que la nueva cantidad, ENTONCES LA Sales_API DEBERÁ devolver HTTP 409 con un mensaje identificando el producto y la cantidad de stock disponible.
   **EN:** IF the available stock is less than the new quantity, THEN THE Sales_API SHALL return HTTP 409 with a message identifying the product and the available stock quantity.

5. **ES:** CUANDO un cajero elimina un SaleItem de una venta `ACTIVE`, LA Sales_API DEBERÁ eliminar la línea y recalcular los totales de la Sale.
   **EN:** WHEN a cashier removes a SaleItem from an `ACTIVE` sale, THE Sales_API SHALL delete the line and recalculate the Sale totals.

6. **ES:** SI un cajero intenta actualizar o eliminar un ítem de una Sale cuyo estado no es `ACTIVE`, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que los ítems solo pueden modificarse en ventas activas.
   **EN:** IF a cashier attempts to update or remove an item from a Sale whose status is not `ACTIVE`, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that items can only be modified in active sales.

7. **ES:** SI un cajero intenta actualizar o eliminar un SaleItem que no existe en la Sale, ENTONCES LA Sales_API DEBERÁ devolver HTTP 404 con un mensaje identificando el ítem faltante.
   **EN:** IF a cashier attempts to update or remove a SaleItem that does not exist in the Sale, THEN THE Sales_API SHALL return HTTP 404 with a message identifying the missing item.

---

### Requisito 6: Totales de Venta y Cálculo de Impuestos / Requirement 6: Sale Totals and Tax Calculation

**Historia de Usuario (ES):** Como cajero, quiero que los totales de la venta se calculen automáticamente con impuesto y descuentos opcionales, para que al cliente se le cobre el monto correcto.

**User Story (EN):** As a cashier, I want the sale totals to be automatically calculated with tax and optional discounts, so that the customer is charged the correct amount.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** LA Sales_API DEBERÁ calcular el subtotal de una Sale como la suma de (precio unitario × cantidad) para todos los SaleItems, usando aritmética `BigDecimal` redondeada a 2 decimales.
   **EN:** THE Sales_API SHALL calculate the subtotal of a Sale as the sum of (unit price × quantity) for all SaleItems, using `BigDecimal` arithmetic rounded to 2 decimal places.

2. **ES:** LA Sales_API DEBERÁ calcular el monto de impuesto como el subtotal multiplicado por el TaxRate configurado (por defecto 19%), redondeado a 2 decimales usando redondeo `HALF_UP`.
   **EN:** THE Sales_API SHALL calculate the tax amount as subtotal multiplied by the configured TaxRate (default 19%), rounded to 2 decimal places using `HALF_UP` rounding.

3. **ES:** CUANDO se aplica un descuento porcentual a una Sale, LA Sales_API DEBERÁ calcular el monto de descuento como el subtotal multiplicado por el porcentaje de descuento, redondeado a 2 decimales.
   **EN:** WHEN a percentage discount is applied to a Sale, THE Sales_API SHALL calculate the discount amount as subtotal multiplied by the discount percentage, rounded to 2 decimal places.

4. **ES:** CUANDO se aplica un descuento de monto fijo a una Sale, LA Sales_API DEBERÁ usar el monto fijo proporcionado como valor de descuento.
   **EN:** WHEN a fixed-amount discount is applied to a Sale, THE Sales_API SHALL use the provided fixed amount as the discount value.

5. **ES:** LA Sales_API DEBERÁ calcular el total como subtotal más impuesto menos descuento, redondeado a 2 decimales.
   **EN:** THE Sales_API SHALL calculate the total as subtotal plus tax minus discount, rounded to 2 decimal places.

6. **ES:** SI un monto de descuento excede el subtotal, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que el descuento no puede exceder el subtotal.
   **EN:** IF a discount amount exceeds the subtotal, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that the discount cannot exceed the subtotal.

7. **ES:** LA Sales_API DEBERÁ realizar todos los cálculos monetarios intermedios en centavos enteros para evitar errores de punto flotante antes de convertir de vuelta a `BigDecimal` para almacenamiento y respuesta.
   **EN:** THE Sales_API SHALL perform all intermediate monetary calculations in integer cents to avoid floating-point errors before converting back to `BigDecimal` for storage and response.

---

### Requisito 7: Pago en Efectivo y Checkout / Requirement 7: Cash Payment and Checkout

**Historia de Usuario (ES):** Como cajero, quiero completar una venta en efectivo ingresando el monto recibido, para que el sistema calcule el vuelto y marque la venta como completada.

**User Story (EN):** As a cashier, I want to complete a cash sale by entering the amount received, so that the system calculates the change and marks the sale as completed.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero inicia el checkout en una venta `ACTIVE` con tipo de pago `CASH`, LA Sales_API DEBERÁ validar que la venta contiene al menos un SaleItem.
   **EN:** WHEN a cashier initiates checkout on an `ACTIVE` sale with payment type `CASH`, THE Sales_API SHALL validate that the sale contains at least one SaleItem.

2. **ES:** CUANDO un cajero inicia el checkout con tipo de pago `CASH`, LA Sales_API DEBERÁ validar que el monto recibido sea mayor o igual al total de la venta.
   **EN:** WHEN a cashier initiates checkout with payment type `CASH`, THE Sales_API SHALL validate that the amount received is greater than or equal to the sale total.

3. **ES:** SI el monto recibido es menor que el total de la venta, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando monto de pago insuficiente.
   **EN:** IF the amount received is less than the sale total, THEN THE Sales_API SHALL return HTTP 422 with a message indicating insufficient payment amount.

4. **ES:** CUANDO un checkout en efectivo es válido, LA Sales_API DEBERÁ llamar a la Product_API para verificar el stock actual de cada SaleItem antes de completar la venta.
   **EN:** WHEN a cash checkout is valid, THE Sales_API SHALL call the Product_API to verify current stock for every SaleItem before completing the sale.

5. **ES:** SI algún SaleItem tiene stock insuficiente al momento del checkout, ENTONCES LA Sales_API DEBERÁ devolver HTTP 409 con una lista de todos los productos afectados y sus cantidades de stock disponibles.
   **EN:** IF any SaleItem has insufficient stock at checkout time, THEN THE Sales_API SHALL return HTTP 409 with a list of all affected products and their available stock quantities.

6. **ES:** CUANDO todas las validaciones pasan para un checkout en efectivo, LA Sales_API DEBERÁ establecer el estado de la Sale a `COMPLETED`, decrementar el stock de cada SaleItem vía la Product_API, generar un Receipt con un TransactionId único y devolver el Receipt.
   **EN:** WHEN all validations pass for a cash checkout, THE Sales_API SHALL set the Sale status to `COMPLETED`, decrement stock for each SaleItem via the Product_API, generate a Receipt with a unique TransactionId, and return the Receipt.

7. **ES:** LA Sales_API DEBERÁ calcular el monto de vuelto como el monto recibido menos el total de la venta e incluirlo en el Receipt.
   **EN:** THE Sales_API SHALL calculate the change amount as amount received minus sale total and include it in the Receipt.

8. **ES:** CUANDO se completa un checkout en efectivo, LA Sales_API DEBERÁ incluir en el Receipt: nombre de la tienda, terminal ID, cashier ID, timestamp de completado, información del cliente (si está asociado), todos los SaleItems con precios unitarios y cantidades, subtotal, monto de impuesto, monto de descuento, total, tipo de pago `CASH`, monto recibido y monto de vuelto.
   **EN:** WHEN a cash checkout is completed, THE Sales_API SHALL include in the Receipt: store name, terminal ID, cashier ID, completion timestamp, customer information (if associated), all SaleItems with unit prices and quantities, subtotal, tax amount, discount amount, total, payment type `CASH`, amount received, and change amount.

9. **ES:** DONDE un cliente está asociado a una venta en efectivo, LA Sales_API DEBERÁ incluir el customer ID y nombre completo en el Receipt.
   **EN:** WHERE a customer is associated with a cash sale, THE Sales_API SHALL include the customer ID and full name in the Receipt.

---

### Requisito 8: Pago a Crédito y Checkout / Requirement 8: Credit Payment and Checkout

**Historia de Usuario (ES):** Como cajero, quiero completar una venta a crédito para un cliente aprobado, para que la transacción quede registrada con una referencia de crédito.

**User Story (EN):** As a cashier, I want to complete a credit sale for an approved customer, so that the transaction is recorded with a credit reference.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero inicia el checkout en una venta `ACTIVE` con tipo de pago `CREDIT`, LA Sales_API DEBERÁ validar que un customer ID está asociado a la Sale.
   **EN:** WHEN a cashier initiates checkout on an `ACTIVE` sale with payment type `CREDIT`, THE Sales_API SHALL validate that a customer ID is associated with the Sale.

2. **ES:** SI ningún cliente está asociado a una venta a crédito en el checkout, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que se requiere un cliente para ventas a crédito.
   **EN:** IF no customer is associated with a credit sale at checkout, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that a customer is required for credit sales.

3. **ES:** CUANDO se inicia un checkout a crédito, LA Sales_API DEBERÁ llamar a la Customer_API para obtener el estado de crédito actual del cliente asociado.
   **EN:** WHEN a credit checkout is initiated, THE Sales_API SHALL call the Customer_API to retrieve the current credit status of the associated customer.

4. **ES:** SI el estado de crédito del cliente no es `APPROVED`, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que el crédito del cliente no está aprobado.
   **EN:** IF the customer's credit status is not `APPROVED`, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that the customer's credit is not approved.

5. **ES:** CUANDO todas las validaciones de crédito pasan, LA Sales_API DEBERÁ llamar a la Product_API para verificar el stock actual de cada SaleItem antes de completar la venta.
   **EN:** WHEN all credit validations pass, THE Sales_API SHALL call the Product_API to verify current stock for every SaleItem before completing the sale.

6. **ES:** SI algún SaleItem tiene stock insuficiente al momento del checkout, ENTONCES LA Sales_API DEBERÁ devolver HTTP 409 con una lista de todos los productos afectados y sus cantidades de stock disponibles.
   **EN:** IF any SaleItem has insufficient stock at checkout time, THEN THE Sales_API SHALL return HTTP 409 with a list of all affected products and their available stock quantities.

7. **ES:** CUANDO todas las validaciones pasan para un checkout a crédito, LA Sales_API DEBERÁ establecer el estado de la Sale a `COMPLETED`, generar un CreditReference único, decrementar el stock de cada SaleItem vía la Product_API, generar un Receipt con un TransactionId único y devolver el Receipt.
   **EN:** WHEN all validations pass for a credit checkout, THE Sales_API SHALL set the Sale status to `COMPLETED`, generate a unique CreditReference, decrement stock for each SaleItem via the Product_API, generate a Receipt with a unique TransactionId, and return the Receipt.

8. **ES:** LA Sales_API DEBERÁ incluir el CreditReference en el Receipt para ventas a crédito.
   **EN:** THE Sales_API SHALL include the CreditReference in the Receipt for credit sales.

9. **ES:** CUANDO se completa un checkout a crédito, LA Sales_API DEBERÁ incluir en el Receipt: nombre de la tienda, terminal ID, cashier ID, timestamp de completado, customer ID, nombre completo del cliente, todos los SaleItems, subtotal, monto de impuesto, monto de descuento, total, tipo de pago `CREDIT` y CreditReference.
   **EN:** WHEN a credit checkout is completed, THE Sales_API SHALL include in the Receipt: store name, terminal ID, cashier ID, completion timestamp, customer ID, customer full name, all SaleItems, subtotal, tax amount, discount amount, total, payment type `CREDIT`, and CreditReference.

---

### Requisito 9: Cancelación de Venta / Requirement 9: Sale Cancellation

**Historia de Usuario (ES):** Como cajero, quiero cancelar una venta activa o congelada con un motivo, para que la transacción quede anulada sin afectar el stock.

**User Story (EN):** As a cashier, I want to cancel an active or frozen sale with a reason, so that the transaction is voided without affecting stock.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero cancela una Sale cuyo estado es `ACTIVE` o `FROZEN`, LA Sales_API DEBERÁ establecer el estado de la Sale a `CANCELLED` y registrar el motivo de cancelación y el timestamp.
   **EN:** WHEN a cashier cancels a Sale whose status is `ACTIVE` or `FROZEN`, THE Sales_API SHALL set the Sale status to `CANCELLED` and record the cancellation reason and timestamp.

2. **ES:** SI un cajero intenta cancelar una Sale cuyo estado no es `ACTIVE` o `FROZEN`, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que solo las ventas activas o congeladas pueden cancelarse.
   **EN:** IF a cashier attempts to cancel a Sale whose status is not `ACTIVE` or `FROZEN`, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that only active or frozen sales can be cancelled.

3. **ES:** SI una solicitud de cancelación no incluye un motivo, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que se requiere un motivo de cancelación.
   **EN:** IF a cancellation request does not include a reason, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that a cancellation reason is required.

4. **ES:** SI el motivo de cancelación excede 255 caracteres, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando la longitud máxima.
   **EN:** IF the cancellation reason exceeds 255 characters, THEN THE Sales_API SHALL return HTTP 422 with a message indicating the maximum length.

5. **ES:** CUANDO una Sale es cancelada, LA Sales_API NO DEBERÁ modificar los niveles de stock de ningún SaleItem en la Sale cancelada.
   **EN:** WHEN a Sale is cancelled, THE Sales_API SHALL NOT modify stock levels for any SaleItem in the cancelled Sale.

6. **ES:** MIENTRAS una Sale tiene estado `CANCELLED`, LA Sales_API DEBERÁ rechazar cualquier intento de agregar, actualizar o eliminar ítems con HTTP 422.
   **EN:** WHILE a Sale has status `CANCELLED`, THE Sales_API SHALL reject any attempt to add, update, or remove items with HTTP 422.

---

### Requisito 10: Congelamiento de Venta (Hold) / Requirement 10: Sale Freezing (Hold)

**Historia de Usuario (ES):** Como cajero, quiero congelar una venta activa para poder atender a otro cliente y reanudar la venta pausada más tarde.

**User Story (EN):** As a cashier, I want to freeze an active sale so that I can attend another customer and resume the paused sale later.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero congela una venta `ACTIVE`, LA Sales_API DEBERÁ establecer el estado de la Sale a `FROZEN` y registrar el timestamp de congelamiento.
   **EN:** WHEN a cashier freezes an `ACTIVE` sale, THE Sales_API SHALL set the Sale status to `FROZEN` and record the freeze timestamp.

2. **ES:** SI un cajero intenta congelar una Sale cuyo estado no es `ACTIVE`, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que solo las ventas activas pueden congelarse.
   **EN:** IF a cashier attempts to freeze a Sale whose status is not `ACTIVE`, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that only active sales can be frozen.

3. **ES:** MIENTRAS una Sale tiene estado `FROZEN`, LA Sales_API DEBERÁ preservar todos los SaleItems, cantidades y totales calculados sin modificación.
   **EN:** WHILE a Sale has status `FROZEN`, THE Sales_API SHALL preserve all SaleItems, quantities, and calculated totals without modification.

4. **ES:** CUANDO un cajero reanuda una venta `FROZEN`, LA Sales_API DEBERÁ establecer el estado de la Sale de vuelta a `ACTIVE`.
   **EN:** WHEN a cashier resumes a `FROZEN` sale, THE Sales_API SHALL set the Sale status back to `ACTIVE`.

5. **ES:** SI un cajero intenta reanudar una Sale cuyo estado no es `FROZEN`, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que solo las ventas congeladas pueden reanudarse.
   **EN:** IF a cashier attempts to resume a Sale whose status is not `FROZEN`, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that only frozen sales can be resumed.

6. **ES:** LA Sales_API DEBERÁ permitir que un único Terminal tenga múltiples ventas `FROZEN` concurrentes.
   **EN:** THE Sales_API SHALL allow a single Terminal to have multiple concurrent `FROZEN` sales.

7. **ES:** CUANDO un cajero solicita la lista de ventas congeladas para un terminal ID, LA Sales_API DEBERÁ devolver todas las Sales con estado `FROZEN` asociadas a ese terminal, ordenadas por timestamp de congelamiento ascendente.
   **EN:** WHEN a cashier requests the list of frozen sales for a terminal ID, THE Sales_API SHALL return all Sales with status `FROZEN` associated with that terminal, ordered by freeze timestamp ascending.

8. **ES:** CUANDO una venta `FROZEN` ha estado congelada por más tiempo que la duración HoldExpiry configurada (por defecto 2 horas), LA Sales_API DEBERÁ establecer automáticamente el estado de la Sale a `CANCELLED` con un motivo de cancelación generado por el sistema indicando expiración.
   **EN:** WHEN a `FROZEN` sale has been frozen for longer than the configured HoldExpiry duration (default 2 hours), THE Sales_API SHALL automatically set the Sale status to `CANCELLED` with a system-generated cancellation reason indicating expiry.

9. **ES:** LA Sales_API DEBERÁ evaluar el HoldExpiry para ventas congeladas de forma programada y cancelar todas las ventas congeladas expiradas en un único ciclo.
   **EN:** THE Sales_API SHALL evaluate HoldExpiry for frozen sales on a scheduled basis and cancel all expired frozen sales in a single pass.

---

### Requisito 11: Devolución Total / Requirement 11: Full Return

**Historia de Usuario (ES):** Como cajero, quiero procesar una devolución total de una venta completada, para que todos los ítems sean reembolsados y el stock sea restaurado.

**User Story (EN):** As a cashier, I want to process a full return of a completed sale, so that all items are refunded and stock is restored.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero inicia una devolución total en una Sale con estado `COMPLETED`, LA Sales_API DEBERÁ establecer el estado de la Sale a `RETURNED`, restaurar el stock de todos los SaleItems vía la Product_API y generar un Receipt de devolución referenciando el TransactionId original.
   **EN:** WHEN a cashier initiates a full return on a Sale with status `COMPLETED`, THE Sales_API SHALL set the Sale status to `RETURNED`, restore stock for all SaleItems via the Product_API, and generate a return Receipt referencing the original TransactionId.

2. **ES:** SI un cajero intenta una devolución total en una Sale cuyo estado no es `COMPLETED`, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que solo las ventas completadas pueden devolverse.
   **EN:** IF a cashier attempts a full return on a Sale whose status is not `COMPLETED`, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that only completed sales can be returned.

3. **ES:** SI una solicitud de devolución total no incluye un motivo de devolución, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que se requiere un motivo de devolución.
   **EN:** IF a full return request does not include a return reason, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that a return reason is required.

4. **ES:** LA Sales_API DEBERÁ incluir en el Receipt de devolución: TransactionId original, timestamp de devolución, todos los SaleItems devueltos con cantidades y precios unitarios, monto total de reembolso y motivo de devolución.
   **EN:** THE Sales_API SHALL include in the return Receipt: original TransactionId, return timestamp, all returned SaleItems with quantities and unit prices, total refund amount, and return reason.

5. **ES:** CUANDO se procesa una devolución total para una venta a crédito, LA Sales_API DEBERÁ generar un registro de nota de crédito en lugar de un registro de reembolso en efectivo, referenciando el CreditReference original.
   **EN:** WHEN a full return is processed for a credit sale, THE Sales_API SHALL generate a credit note record instead of a cash refund record, referencing the original CreditReference.

---

### Requisito 12: Devolución Parcial / Requirement 12: Partial Return

**Historia de Usuario (ES):** Como cajero, quiero devolver ítems y cantidades específicas de una venta completada, para que solo los ítems seleccionados sean reembolsados y su stock sea restaurado.

**User Story (EN):** As a cashier, I want to return specific items and quantities from a completed sale, so that only the selected items are refunded and their stock is restored.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO un cajero inicia una devolución parcial en una Sale con estado `COMPLETED` o `PARTIALLY_RETURNED`, LA Sales_API DEBERÁ procesar la devolución para los ítems y cantidades especificados, restaurar el stock de los ítems devueltos vía la Product_API y generar un Receipt de devolución parcial referenciando el TransactionId original.
   **EN:** WHEN a cashier initiates a partial return on a Sale with status `COMPLETED` or `PARTIALLY_RETURNED`, THE Sales_API SHALL process the return for the specified items and quantities, restore stock for the returned items via the Product_API, and generate a partial return Receipt referencing the original TransactionId.

2. **ES:** SI un cajero intenta una devolución parcial en una Sale cuyo estado no es `COMPLETED` o `PARTIALLY_RETURNED`, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que solo las ventas completadas o parcialmente devueltas pueden recibir devoluciones parciales.
   **EN:** IF a cashier attempts a partial return on a Sale whose status is not `COMPLETED` or `PARTIALLY_RETURNED`, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that only completed or partially-returned sales can receive partial returns.

3. **ES:** SI la cantidad de devolución solicitada para cualquier ítem excede la cantidad devolvible restante (comprada originalmente menos previamente devuelta), ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje identificando el ítem y la cantidad máxima devolvible.
   **EN:** IF the requested return quantity for any item exceeds the remaining returnable quantity (originally purchased minus previously returned), THEN THE Sales_API SHALL return HTTP 422 with a message identifying the item and the maximum returnable quantity.

4. **ES:** CUANDO se procesa una devolución parcial y al menos un ítem todavía tiene una cantidad devolvible restante, LA Sales_API DEBERÁ establecer el estado de la Sale a `PARTIALLY_RETURNED`.
   **EN:** WHEN a partial return is processed and at least one item still has a remaining returnable quantity, THE Sales_API SHALL set the Sale status to `PARTIALLY_RETURNED`.

5. **ES:** SI una solicitud de devolución parcial no incluye un motivo de devolución para cada ítem devuelto, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje indicando que se requiere un motivo de devolución por ítem.
   **EN:** IF a partial return request does not include a return reason for each returned item, THEN THE Sales_API SHALL return HTTP 422 with a message indicating that a return reason is required per item.

6. **ES:** LA Sales_API DEBERÁ incluir en el Receipt de devolución parcial: TransactionId original, timestamp de devolución, SaleItems devueltos con cantidades y precios unitarios, monto de reembolso parcial y motivos de devolución por ítem.
   **EN:** THE Sales_API SHALL include in the partial return Receipt: original TransactionId, return timestamp, returned SaleItems with quantities and unit prices, partial refund amount, and per-item return reasons.

7. **ES:** CUANDO se procesa una devolución parcial para una venta a crédito, LA Sales_API DEBERÁ generar un registro de nota de crédito por el monto parcial en lugar de un registro de reembolso en efectivo.
   **EN:** WHEN a partial return is processed for a credit sale, THE Sales_API SHALL generate a credit note record for the partial amount instead of a cash refund record.

---

### Requisito 13: Generación de Recibos / Requirement 13: Receipt Generation

**Historia de Usuario (ES):** Como cajero, quiero que se genere un recibo automáticamente en el checkout y en las devoluciones, para que el cliente tenga un registro de la transacción.

**User Story (EN):** As a cashier, I want a receipt to be generated automatically on checkout and returns, so that the customer has a record of the transaction.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** CUANDO una Sale se completa exitosamente vía checkout, LA Sales_API DEBERÁ generar un Receipt que contenga: nombre de la tienda, terminal ID, cashier ID, timestamp de completado, customer ID y nombre completo (si está asociado), todos los SaleItems con nombre del producto, precio unitario, cantidad y total de línea, subtotal, monto de impuesto, monto de descuento, total, tipo de pago, monto recibido (para `CASH`), monto de vuelto (para `CASH`), CreditReference (para `CREDIT`) y un TransactionId único.
   **EN:** WHEN a Sale is successfully completed via checkout, THE Sales_API SHALL generate a Receipt containing: store name, terminal ID, cashier ID, completion timestamp, customer ID and full name (if associated), all SaleItems with product name, unit price, quantity, and line total, subtotal, tax amount, discount amount, total, payment type, amount received (for `CASH`), change amount (for `CASH`), CreditReference (for `CREDIT`), and a unique TransactionId.

2. **ES:** LA Sales_API DEBERÁ generar el TransactionId como un UUID y garantizar su unicidad en todos los recibos.
   **EN:** THE Sales_API SHALL generate the TransactionId as a UUID and guarantee its uniqueness across all receipts.

3. **ES:** CUANDO se genera un Receipt de devolución, LA Sales_API DEBERÁ incluir el TransactionId original, tipo de devolución (total o parcial), timestamp de devolución, ítems devueltos y monto total de reembolso.
   **EN:** WHEN a return Receipt is generated, THE Sales_API SHALL include the original TransactionId, return type (full or partial), return timestamp, returned items, and total refund amount.

4. **ES:** LA Sales_API DEBERÁ persistir todos los Receipts y hacerlos recuperables por TransactionId.
   **EN:** THE Sales_API SHALL persist all Receipts and make them retrievable by TransactionId.

5. **ES:** CUANDO un cajero solicita un Receipt por TransactionId, LA Sales_API DEBERÁ devolver los datos completos del Receipt.
   **EN:** WHEN a cashier requests a Receipt by TransactionId, THE Sales_API SHALL return the full Receipt data.

6. **ES:** SI un Receipt con el TransactionId solicitado no existe, ENTONCES LA Sales_API DEBERÁ devolver HTTP 404.
   **EN:** IF a Receipt with the requested TransactionId does not exist, THEN THE Sales_API SHALL return HTTP 404.

---

### Requisito 14: Aplicación de Transiciones de Estado / Requirement 14: Sale State Transition Enforcement

**Historia de Usuario (ES):** Como operador del sistema, quiero que todas las transiciones de estado inválidas sean rechazadas, para que se mantenga la integridad del ciclo de vida de la venta.

**User Story (EN):** As a system operator, I want all invalid state transitions to be rejected, so that the sale lifecycle integrity is maintained.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** LA Sales_API DEBERÁ permitir únicamente las siguientes transiciones de estado: `ACTIVE` → `COMPLETED`, `ACTIVE` → `CANCELLED`, `ACTIVE` → `FROZEN`, `FROZEN` → `ACTIVE`, `FROZEN` → `CANCELLED`, `COMPLETED` → `RETURNED`, `COMPLETED` → `PARTIALLY_RETURNED`, `PARTIALLY_RETURNED` → `PARTIALLY_RETURNED`.
   **EN:** THE Sales_API SHALL only permit the following state transitions: `ACTIVE` → `COMPLETED`, `ACTIVE` → `CANCELLED`, `ACTIVE` → `FROZEN`, `FROZEN` → `ACTIVE`, `FROZEN` → `CANCELLED`, `COMPLETED` → `RETURNED`, `COMPLETED` → `PARTIALLY_RETURNED`, `PARTIALLY_RETURNED` → `PARTIALLY_RETURNED`.

2. **ES:** SI cualquier operación intenta una transición de estado no listada en el criterio 1, ENTONCES LA Sales_API DEBERÁ devolver HTTP 422 con un mensaje identificando el estado actual y la transición solicitada inválida.
   **EN:** IF any operation attempts a state transition not listed in criterion 1, THEN THE Sales_API SHALL return HTTP 422 with a message identifying the current state and the invalid requested transition.

3. **ES:** MIENTRAS una Sale tiene estado `COMPLETED`, `RETURNED` o `CANCELLED`, LA Sales_API DEBERÁ rechazar cualquier intento de modificar SaleItems con HTTP 422.
   **EN:** WHILE a Sale has status `COMPLETED`, `RETURNED`, or `CANCELLED`, THE Sales_API SHALL reject any attempt to modify SaleItems with HTTP 422.

---

### Requisito 15: Resiliencia de APIs Externas / Requirement 15: External API Resilience

**Historia de Usuario (ES):** Como operador del sistema, quiero que la Sales API maneje los fallos de APIs externas de forma elegante, para que los cajeros reciban mensajes de error claros en lugar de excepciones no manejadas.

**User Story (EN):** As a system operator, I want the Sales API to handle external API failures gracefully, so that cashiers receive clear error messages instead of unhandled exceptions.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** SI la Product_API devuelve una respuesta de error HTTP durante cualquier operación de la Sales_API, ENTONCES LA Sales_API DEBERÁ devolver HTTP 503 con un mensaje indicando que el servicio de productos devolvió un error.
   **EN:** IF the Product_API returns an HTTP error response during any Sales_API operation, THEN THE Sales_API SHALL return HTTP 503 with a message indicating that the product service returned an error.

2. **ES:** SI la Customer_API devuelve una respuesta de error HTTP durante cualquier operación de la Sales_API, ENTONCES LA Sales_API DEBERÁ devolver HTTP 503 con un mensaje indicando que el servicio de clientes devolvió un error.
   **EN:** IF the Customer_API returns an HTTP error response during any Sales_API operation, THEN THE Sales_API SHALL return HTTP 503 with a message indicating that the customer service returned an error.

3. **ES:** SI la Product_API agota el tiempo de espera durante un decremento de stock en el checkout, ENTONCES LA Sales_API DEBERÁ devolver HTTP 503 y NO cambiar el estado de la Sale a `COMPLETED`.
   **EN:** IF the Product_API times out during a stock decrement at checkout, THEN THE Sales_API SHALL return HTTP 503 and NOT change the Sale status to `COMPLETED`.

4. **ES:** LA Sales_API DEBERÁ registrar todos los errores de APIs externas con suficiente detalle para diagnóstico, incluyendo el nombre del servicio destino, código de estado HTTP y ruta de la solicitud.
   **EN:** THE Sales_API SHALL log all external API errors with sufficient detail for diagnosis, including the target service name, HTTP status code, and request path.

---

### Requisito 16: Documentación de la API / Requirement 16: API Documentation

**Historia de Usuario (ES):** Como desarrollador que integra con la Sales API, quiero documentación interactiva de la API, para poder entender y probar todos los endpoints sin leer el código fuente.

**User Story (EN):** As a developer integrating with the Sales API, I want interactive API documentation, so that I can understand and test all endpoints without reading source code.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** LA Sales_API DEBERÁ exponer una Swagger UI en `/swagger-ui.html` impulsada por SpringDoc OpenAPI.
   **EN:** THE Sales_API SHALL expose a Swagger UI at `/swagger-ui.html` powered by SpringDoc OpenAPI.

2. **ES:** LA Sales_API DEBERÁ documentar todos los endpoints con esquemas de solicitud, esquemas de respuesta y posibles códigos de estado HTTP.
   **EN:** THE Sales_API SHALL document all endpoints with request schemas, response schemas, and possible HTTP status codes.

3. **ES:** LA Sales_API DEBERÁ documentar todos los cuerpos de respuesta de error con descripciones de campos.
   **EN:** THE Sales_API SHALL document all error response bodies with field descriptions.

---

### Requisito 17: Cobertura de Pruebas / Requirement 17: Test Coverage

**Historia de Usuario (ES):** Como ingeniero de calidad, quiero que el código base cumpla con umbrales mínimos de cobertura, para que las regresiones se detecten temprano.

**User Story (EN):** As a quality engineer, I want the codebase to meet minimum coverage thresholds, so that regressions are caught early.

#### Criterios de Aceptación / Acceptance Criteria

1. **ES:** LA Sales_API DEBERÁ alcanzar un mínimo del 80% de cobertura de líneas en todo el proyecto según lo medido por JaCoCo.
   **EN:** THE Sales_API SHALL achieve a minimum of 80% line coverage across the entire project as measured by JaCoCo.

2. **ES:** La capa de servicios de LA Sales_API DEBERÁ alcanzar un mínimo del 90% de cobertura de líneas según lo medido por JaCoCo.
   **EN:** THE Sales_API service layer SHALL achieve a minimum of 90% line coverage as measured by JaCoCo.

3. **ES:** La suite de pruebas de LA Sales_API DEBERÁ incluir pruebas unitarias usando Mockito que simulen los clientes de Product_API y Customer_API para cada método de servicio.
   **EN:** THE Sales_API test suite SHALL include unit tests using Mockito that mock the Product_API and Customer_API clients for every service method.

4. **ES:** La suite de pruebas de LA Sales_API DEBERÁ incluir pruebas de integración usando `@SpringBootTest` con una base de datos H2 en memoria y stubs WireMock para la Product_API y Customer_API.
   **EN:** THE Sales_API test suite SHALL include integration tests using `@SpringBootTest` with an H2 in-memory database and WireMock stubs for the Product_API and Customer_API.

5. **ES:** Las pruebas de integración de LA Sales_API DEBERÁN cubrir los siguientes flujos completos: venta en efectivo (crear → agregar ítems → checkout → verificar recibo), venta a crédito (crear → asociar cliente → agregar ítems → checkout → verificar referencia de crédito), congelar y reanudar (crear → agregar ítems → congelar → reanudar → checkout), devolución total (completar venta → devolución total → verificar stock restaurado), devolución parcial (completar venta → devolver subconjunto de ítems → verificar restauración parcial de stock) y cancelación (crear → agregar ítems → cancelar → verificar que no se permiten modificaciones posteriores).
   **EN:** THE Sales_API integration tests SHALL cover the following complete flows: cash sale (create → add items → checkout → verify receipt), credit sale (create → associate customer → add items → checkout → verify credit reference), freeze and resume (create → add items → freeze → resume → checkout), full return (complete sale → full return → verify stock restored), partial return (complete sale → return subset of items → verify partial stock restore), and cancellation (create → add items → cancel → verify no further modification allowed).

6. **ES:** Las pruebas unitarias de LA Sales_API DEBERÁN cubrir los siguientes casos límite: checkout sin ítems, cantidad de devolución que excede la cantidad comprada, checkout a crédito sin cliente asociado, checkout a crédito con estado de crédito no `APPROVED` y reanudar una venta no congelada.
   **EN:** THE Sales_API unit tests SHALL cover the following edge cases: checkout with no items, return quantity exceeding purchased quantity, credit checkout without associated customer, credit checkout with non-`APPROVED` credit status, and resuming a non-frozen sale.
