package com.pos.sales.adapter.rest.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelSaleRequest(@NotBlank @Size(max = 512) String reason) {
}
