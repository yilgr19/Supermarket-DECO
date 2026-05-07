package com.pos.sales.application.exception;

public class DiscountExceedsSubtotalException extends RuntimeException {
    public DiscountExceedsSubtotalException() {
        super("El descuento excede el subtotal / Discount exceeds subtotal");
    }
}
