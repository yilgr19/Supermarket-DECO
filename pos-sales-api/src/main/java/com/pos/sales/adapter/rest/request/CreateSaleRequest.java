package com.pos.sales.adapter.rest.request;

import jakarta.validation.constraints.Size;

public record CreateSaleRequest(
        @Size(max = 128) String terminalId,
        @Size(max = 128) String customerId) {
}
