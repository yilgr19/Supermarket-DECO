package com.pos.sales.adapter.rest.dto;

public record SaleLineDto(String id,
                          String productId,
                          String productName,
                          double unitPrice,
                          int quantity,
                          double lineTotal,
                          double discount,
                          String discountType,
                          Double discountValue) {
}
