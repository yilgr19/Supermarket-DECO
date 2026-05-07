package com.pos.sales.adapter.rest.dto;

public record ProductDto(String id,
                           String name,
                           String barcode,
                           double unitPrice,
                           int availableStock,
                           String category) {
}
