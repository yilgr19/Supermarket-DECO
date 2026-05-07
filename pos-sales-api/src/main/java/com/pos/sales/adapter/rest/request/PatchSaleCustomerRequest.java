package com.pos.sales.adapter.rest.request;

import jakarta.validation.constraints.Size;

/**
 * PATCH venta — asocia o limpia cliente (requerido para crédito con API real cuando el cliente se elige después de crear la venta).
 */
public record PatchSaleCustomerRequest(@Size(max = 128) String customerId) {
}
