package com.pos.sales.application.exception;

public class CreditNotApprovedException extends RuntimeException {
    public CreditNotApprovedException() {
        super("Crédito no aprobado / Credit not approved");
    }
}
