package com.pos.sales.adapter.rest.dto;

import java.util.List;

public record SaleDto(String id,
                      String terminalId,
                      String cashierId,
                      String customerId,
                      String status,
                      List<SaleLineDto> items,
                      double subtotal,
                      double tax,
                      double discount,
                      double total,
                      String discountType,
                      Double discountValue,
                      String frozenAt,
                      String cancelReason,
                      String createdAt,
                      String updatedAt) {
}
