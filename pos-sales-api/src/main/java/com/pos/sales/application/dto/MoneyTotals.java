package com.pos.sales.application.dto;

public record MoneyTotals(java.math.BigDecimal subtotal,
                          java.math.BigDecimal tax,
                          java.math.BigDecimal discount,
                          java.math.BigDecimal total) {
}
