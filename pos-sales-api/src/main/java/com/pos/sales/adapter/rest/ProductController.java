package com.pos.sales.adapter.rest;

import com.pos.sales.adapter.external.InMemoryProductCatalog;
import com.pos.sales.adapter.rest.dto.CatalogProductDto;
import com.pos.sales.adapter.rest.dto.CatalogProductPageDto;
import com.pos.sales.adapter.rest.dto.PaginationDto;
import com.pos.sales.adapter.rest.dto.ProductDto;
import com.pos.sales.application.exception.ProductNotFoundException;
import com.pos.sales.application.service.ProductCatalogService;
import com.pos.sales.domain.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductCatalogService catalog;
    private final InMemoryProductCatalog salesCatalog;

    public ProductController(ProductCatalogService catalog, InMemoryProductCatalog salesCatalog) {
        this.catalog = catalog;
        this.salesCatalog = salesCatalog;
    }

    @GetMapping("/search")
    public List<ProductDto> searchForPos(@RequestParam(required = false) String name) {
        return salesCatalog.searchByName(name).stream()
                .map(e -> RestMapper.toProduct(e, salesCatalog.availableStock(e.id())))
                .collect(Collectors.toList());
    }

    @GetMapping("/barcode/{barcode}")
    public ProductDto byBarcode(@PathVariable String barcode) {
        if ("0000000000000".equals(barcode)) {
            throw new ProductNotFoundException("Producto no encontrado / Product not found");
        }
        var entry = salesCatalog.byBarcodeStrict(barcode);
        return RestMapper.toProduct(entry, salesCatalog.availableStock(entry.id()));
    }

    @GetMapping
    public CatalogProductPageDto list(@RequestParam(required = false) String nombre,
                                      @RequestParam(required = false) String subcategoria,
                                      @RequestParam(required = false) String estado,
                                      @RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "10") int limit) {
        ProductStatus status = parseEstado(estado);
        Page<com.pos.sales.domain.model.ProductEntity> result =
                catalog.list(nombre, subcategoria, status, page, limit);
        List<CatalogProductDto> data = result.getContent().stream()
                .map(RestMapper::toCatalogProduct)
                .collect(Collectors.toList());
        int totalPages = result.getTotalPages();
        return new CatalogProductPageDto(
                data,
                new PaginationDto(
                        result.getNumber() + 1,
                        result.getSize(),
                        result.getTotalElements(),
                        totalPages
                )
        );
    }

    @GetMapping("/{id}")
    public Map<String, CatalogProductDto> getById(@PathVariable Long id) {
        return Map.of("data", RestMapper.toCatalogProduct(catalog.requireById(id)));
    }

    @PostMapping
    public ResponseEntity<Map<String, CatalogProductDto>> create(@RequestBody Map<String, Object> body) {
        var created = RestMapper.toCatalogProduct(catalog.create(body));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", created));
    }

    @PutMapping("/{id}")
    public Map<String, CatalogProductDto> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return Map.of("data", RestMapper.toCatalogProduct(catalog.update(id, body)));
    }

    @DeleteMapping("/{id}")
    public Map<String, Map<String, String>> delete(@PathVariable Long id) {
        catalog.delete(id);
        return Map.of("data", Map.of("message", "Producto eliminado exitosamente"));
    }

    private static ProductStatus parseEstado(String estado) {
        if (estado == null || estado.isBlank()) {
            return null;
        }
        return ProductStatus.valueOf(estado.trim().toLowerCase());
    }
}
