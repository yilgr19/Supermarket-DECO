package com.pos.sales.application.exception;

public class CustomerRequiredForCreditException extends RuntimeException {
    public CustomerRequiredForCreditException() {
        super("Cliente obligatorio para pago CREDIT / Customer required for credit");
    }
}
