package com.pos.sales.adapter.rest.handler;

import com.pos.sales.application.exception.*;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({
            SaleNotFoundException.class,
            ReceiptNotFoundException.class,
            ProductNotFoundException.class,
            CustomerNotFoundException.class,
            SaleLineNotFoundException.class
    })
    public ResponseEntity<Map<String, Object>> notFound(RuntimeException ex) {
        return body(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String, Object>> conflict(InsufficientStockException ex) {
        List<Map<String, Object>> items = ex.getOutOfStockItems().stream()
                .map(it -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("productId", it.productId());
                    m.put("productName", it.productName());
                    m.put("requested", it.requested());
                    m.put("available", it.available());
                    return m;
                })
                .collect(Collectors.toList());
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("message", ex.getMessage());
        payload.put("outOfStockItems", items);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(payload);
    }

    @ExceptionHandler({
            InvalidSaleStateException.class,
            InvalidQuantityException.class,
            DiscountExceedsSubtotalException.class,
            CreditNotApprovedException.class,
            CustomerRequiredForCreditException.class,
            InsufficientPaymentException.class
    })
    public ResponseEntity<Map<String, Object>> unprocessable(RuntimeException ex) {
        return body(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> badValid(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return body(HttpStatus.BAD_REQUEST, msg.isBlank() ? "Validación fallida / Validation failed" : msg, null);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> badConstraint(ConstraintViolationException ex) {
        return body(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> illegalArg(IllegalArgumentException ex) {
        return body(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    private static ResponseEntity<Map<String, Object>> body(HttpStatus status, String message,
                                                            List<Map<String, Object>> outOfStock) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("message", message != null ? message : status.getReasonPhrase());
        if (outOfStock != null && !outOfStock.isEmpty()) {
            m.put("outOfStockItems", outOfStock);
        }
        return ResponseEntity.status(status).body(m);
    }
}
