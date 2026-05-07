package com.pos.sales.application.exception;

public class SaleNotFoundException extends RuntimeException {
    public SaleNotFoundException(String id) {
        super("Venta no encontrada / Sale not found: " + id);
    }
}
