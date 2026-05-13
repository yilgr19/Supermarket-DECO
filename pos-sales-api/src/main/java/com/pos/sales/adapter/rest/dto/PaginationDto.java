package com.pos.sales.adapter.rest.dto;

public record PaginationDto(int page, int limit, long total, int totalPages) {
}
