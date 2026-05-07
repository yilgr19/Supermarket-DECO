package com.pos.sales.application.exception;

import java.util.List;

public final class InsufficientStockException extends RuntimeException {

    public record Item(String productId, String productName, int requested, int available) {
    }

    private final List<Item> outOfStockItems;

    public InsufficientStockException(String message, List<Item> items) {
        super(message);
        this.outOfStockItems = items;
    }

    public List<Item> getOutOfStockItems() {
        return outOfStockItems;
    }
}
