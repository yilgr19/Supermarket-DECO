package com.pos.sales.adapter.rest.dto;

import java.util.List;

public record ReceiptDto(String id,
                         String transactionId,
                         String saleId,
                         String receiptType,
                         String storeName,
                         String terminalId,
                         String cashierId,
                         String customerId,
                         String customerName,
                         String paymentType,
                         Double amountReceived,
                         Double changeAmount,
                         String creditReference,
                         List<ReceiptLineDto> items,
                         double subtotal,
                         double tax,
                         double discount,
                         double total,
                         String originalTransactionId,
                         String createdAt) {
}
