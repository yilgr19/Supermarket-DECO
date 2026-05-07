package com.pos.sales.adapter.rest.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PartialReturnRequest(@NotEmpty @Valid List<PartialReturnRow> items) {

    public record PartialReturnRow(
            @NotBlank String saleItemId,
            @Min(1) int quantity,
            @NotBlank @Size(max = 512) String reason) {
    }
}
