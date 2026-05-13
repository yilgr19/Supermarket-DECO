package com.pos.sales.adapter.external;

import com.pos.sales.application.service.ProductCatalogService;
import com.pos.sales.domain.model.ProductEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Fachada de catálogo para el flujo de ventas (compatibilidad con servicios existentes).
 */
@Service
public class InMemoryProductCatalog {

    public record CatalogEntry(String id,
                               String name,
                               String barcode,
                               BigDecimal unitPrice,
                               String category) {
    }

    private final ProductCatalogService catalog;

    public InMemoryProductCatalog(ProductCatalogService catalog) {
        this.catalog = catalog;
    }

    public CatalogEntry resolve(String productId, String barcode) {
        return toEntry(catalog.resolveForSale(productId, barcode));
    }

    public int availableStock(String productId) {
        return catalog.availableStock(parseId(productId));
    }

    public void assertStockAvailable(String productId, int requested) {
        catalog.assertStockAvailable(parseId(productId), requested);
    }

    public void adjustStock(String productId, int delta) {
        catalog.adjustStock(parseId(productId), delta);
    }

    public List<CatalogEntry> searchByName(String name) {
        return catalog.searchActiveByName(name).stream()
                .map(this::toEntry)
                .collect(Collectors.toList());
    }

    public CatalogEntry byBarcodeStrict(String barcode) {
        return toEntry(catalog.requireActiveByBarcode(barcode));
    }

    private CatalogEntry toEntry(ProductEntity p) {
        return new CatalogEntry(
                String.valueOf(p.getId()),
                p.getNombre(),
                p.getBarcode(),
                p.getPrecio(),
                p.getSubcategoria()
        );
    }

    private static long parseId(String productId) {
        try {
            return Long.parseLong(productId);
        } catch (NumberFormatException ex) {
            throw new com.pos.sales.application.exception.ProductNotFoundException(
                    "Producto no encontrado / Product not found: " + productId);
        }
    }
}
