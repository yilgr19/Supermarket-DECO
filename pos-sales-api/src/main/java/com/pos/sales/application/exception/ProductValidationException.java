package com.pos.sales.application.exception;

import java.util.List;

public class ProductValidationException extends RuntimeException {

    public record FieldDetail(String field, String message) {
    }

    private final List<FieldDetail> details;

    public ProductValidationException(String message, List<FieldDetail> details) {
        super(message);
        this.details = details;
    }

    public List<FieldDetail> getDetails() {
        return details;
    }
}
