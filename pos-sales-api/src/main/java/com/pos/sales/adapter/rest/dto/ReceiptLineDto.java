package com.pos.sales.adapter.rest.dto;

public record ReceiptLineDto(String id,
                             String productId,
                             String productName,
                             double unitPrice,
                             int quantity,
                             double lineTotal,
                             String returnReason) {
}
