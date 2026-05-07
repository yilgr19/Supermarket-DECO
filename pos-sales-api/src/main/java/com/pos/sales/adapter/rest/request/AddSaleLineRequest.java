package com.pos.sales.adapter.rest.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AddSaleLineRequest(
        @Size(max = 128) String productId,
        @Size(max = 128) String barcode,
        @NotNull @Min(1) Integer quantity) {
}
