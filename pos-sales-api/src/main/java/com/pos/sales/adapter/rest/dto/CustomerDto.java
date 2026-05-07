package com.pos.sales.adapter.rest.dto;

public record CustomerDto(String id,
                          String fullName,
                          String documentType,
                          String documentNumber,
                          String creditStatus) {
}
