package com.pos.sales.adapter.rest;

import com.pos.sales.adapter.external.InMemoryCustomerDirectory;
import com.pos.sales.adapter.external.InMemoryProductCatalog;
import com.pos.sales.adapter.rest.dto.*;
import com.pos.sales.domain.model.*;

import java.util.stream.Collectors;

public final class RestMapper {

    private RestMapper() {
    }

    public static SaleDto toSale(SaleEntity s) {
        List<SaleLineDto> items = s.getLines().stream()
                .map(RestMapper::toLine)
                .collect(Collectors.toList());
        Double discountVal = s.getDiscountValue() != null ? s.getDiscountValue().doubleValue() : null;
        return new SaleDto(
                s.getId().toString(),
                s.getTerminalId(),
                s.getCashierId(),
                s.getCustomerId(),
                s.getStatus().name(),
                items,
                s.getSubtotal().doubleValue(),
                s.getTax().doubleValue(),
                s.getDiscountAmount().doubleValue(),
                s.getTotal().doubleValue(),
                s.getDiscountType() != null ? s.getDiscountType().name() : null,
                discountVal,
                s.getFrozenAt() != null ? s.getFrozenAt().toString() : null,
                s.getCancelReason(),
                s.getCreatedAt().toString(),
                s.getUpdatedAt().toString()
        );
    }

    private static SaleLineDto toLine(SaleLineEntity l) {
        return new SaleLineDto(
                l.getId().toString(),
                l.getProductId(),
                l.getProductName(),
                l.getUnitPrice().doubleValue(),
                l.getQuantity(),
                l.getLineTotal().doubleValue()
        );
    }

    public static ReceiptDto toReceipt(ReceiptEntity r) {
        List<ReceiptLineDto> lines = r.getLines().stream()
                .map(RestMapper::toReceiptLine)
                .collect(Collectors.toList());
        return new ReceiptDto(
                r.getId().toString(),
                r.getTransactionId(),
                r.getSaleId().toString(),
                r.getReceiptType().name(),
                r.getStoreName(),
                r.getTerminalId(),
                r.getCashierId(),
                r.getCustomerId(),
                r.getCustomerName(),
                r.getPaymentType().name(),
                r.getAmountReceived() != null ? r.getAmountReceived().doubleValue() : null,
                r.getChangeAmount() != null ? r.getChangeAmount().doubleValue() : null,
                r.getCreditReference(),
                lines,
                r.getSubtotal().doubleValue(),
                r.getTax().doubleValue(),
                r.getDiscount().doubleValue(),
                r.getTotal().doubleValue(),
                r.getOriginalTransactionId(),
                r.getCreatedAt().toString()
        );
    }

    private static ReceiptLineDto toReceiptLine(ReceiptLineEntity l) {
        return new ReceiptLineDto(
                l.getId().toString(),
                l.getProductId(),
                l.getProductName(),
                l.getUnitPrice().doubleValue(),
                l.getQuantity(),
                l.getLineTotal().doubleValue(),
                l.getReturnReason()
        );
    }

    public static ProductDto toProduct(InMemoryProductCatalog.CatalogEntry e, int stock) {
        return new ProductDto(
                e.id(),
                e.name(),
                e.barcode(),
                e.unitPrice().doubleValue(),
                stock,
                e.category()
        );
    }

    public static CustomerDto toCustomer(InMemoryCustomerDirectory.CustomerEntry e) {
        return new CustomerDto(e.id(),
                e.fullName(),
                e.documentType(),
                e.documentNumber(),
                e.creditStatus().name());
    }
}
