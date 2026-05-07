package com.pos.sales.application.exception;

public class SaleLineNotFoundException extends RuntimeException {
    public SaleLineNotFoundException(String id) {
        super("Ítem no encontrado / Line not found: " + id);
    }
}
