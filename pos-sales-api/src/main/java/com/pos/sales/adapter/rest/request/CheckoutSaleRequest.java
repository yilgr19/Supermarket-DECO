package com.pos.sales.adapter.rest.request;

import com.pos.sales.domain.model.PaymentType;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CheckoutSaleRequest(
        @NotNull PaymentType paymentType,
        BigDecimal amountReceived,
        /** Opcional — si viene, sustituye al cliente enlazado a la venta para crédito. */
        String customerId) {
}
