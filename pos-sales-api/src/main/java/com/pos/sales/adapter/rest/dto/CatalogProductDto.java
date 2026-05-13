package com.pos.sales.adapter.rest.dto;

public record CatalogProductDto(long id,
                                String nombre,
                                String descripcion,
                                String subcategoria,
                                double precio,
                                double precioxcantidad,
                                String estado,
                                String barcode,
                                int availableStock) {
}
