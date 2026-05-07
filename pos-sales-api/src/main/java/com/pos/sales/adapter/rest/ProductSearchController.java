package com.pos.sales.adapter.rest;

import com.pos.sales.adapter.external.InMemoryProductCatalog;
import com.pos.sales.adapter.rest.dto.ProductDto;
import com.pos.sales.application.exception.ProductNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/products")
public class ProductSearchController {

    private final InMemoryProductCatalog catalog;

    public ProductSearchController(InMemoryProductCatalog catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/search")
    public List<ProductDto> search(@RequestParam(required = false) String name) {
        return catalog.searchByName(name).stream()
                .map(e -> RestMapper.toProduct(e, catalog.availableStock(e.id())))
                .collect(Collectors.toList());
    }

    @GetMapping("/barcode/{barcode}")
    public ProductDto byBarcode(@PathVariable String barcode) {
        if ("0000000000000".equals(barcode)) {
            throw new ProductNotFoundException("Producto no encontrado / Product not found");
        }
        var e = catalog.byBarcodeStrict(barcode);
        return RestMapper.toProduct(e, catalog.availableStock(e.id()));
    }
}
