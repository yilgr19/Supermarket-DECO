package com.pos.sales.adapter.rest.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateLineQuantityRequest(@NotNull @Min(1) Integer quantity) {
}
