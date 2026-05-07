package com.pos.sales.adapter.rest.request;

import com.pos.sales.domain.model.DiscountType;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ApplyDiscountRequest(@NotNull DiscountType discountType, BigDecimal discountValue) {
}
