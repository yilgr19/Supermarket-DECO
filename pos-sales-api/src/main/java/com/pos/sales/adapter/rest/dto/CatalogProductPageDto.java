package com.pos.sales.adapter.rest.dto;

import java.util.List;

public record CatalogProductPageDto(List<CatalogProductDto> data, PaginationDto pagination) {
}
