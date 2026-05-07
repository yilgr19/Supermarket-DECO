package com.pos.sales.application.exception;

public class ReceiptNotFoundException extends RuntimeException {
    public ReceiptNotFoundException(String transactionId) {
        super("Recibo no encontrado / Receipt not found: " + transactionId);
    }
}
