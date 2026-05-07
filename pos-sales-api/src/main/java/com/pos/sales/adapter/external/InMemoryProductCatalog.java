package com.pos.sales.adapter.external;

import com.pos.sales.application.exception.ProductNotFoundException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Stub en memoria de Product API (.kiro pos-sales-platform) para ejecutar Sales API sin servicios externos.
 */
@Service
public class InMemoryProductCatalog {

    public record CatalogEntry(String id,
                               String name,
                               String barcode,
                               BigDecimal unitPrice,
                               String category) {
    }

    private final Map<String, CatalogEntry> byId = new ConcurrentHashMap<>();
    private final Map<String, CatalogEntry> byBarcode = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Integer> stockLevels = new ConcurrentHashMap<>();

    @PostConstruct
    void seed() {
        putEntry(new CatalogEntry("prod-1", "Leche Entera", "7501234567890",
                bd(2400), "Lácteos"));
        stockLevels.put("prod-1", 50);
        putEntry(new CatalogEntry("prod-2", "Pan integral", "7509876543210",
                bd(1200), "Panadería"));
        stockLevels.put("prod-2", 35);
    }

    private static BigDecimal bd(long v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP);
    }

    private void putEntry(CatalogEntry e) {
        byId.put(e.id(), e);
        byBarcode.put(e.barcode(), e);
    }

    public CatalogEntry resolve(String productId, String barcode) {
        String p = blankToNull(productId);
        String b = blankToNull(barcode);
        if (p == null && b == null) {
            throw new ProductNotFoundException("productId y barcode vacíos");
        }
        if (p != null && byId.containsKey(p)) {
            return byId.get(p);
        }
        if (b != null && byBarcode.containsKey(b)) {
            return byBarcode.get(b);
        }
        /* Catálogo genérico tipo MSW frontend */
        if (p != null) {
            var gen = new CatalogEntry(p, "Producto " + p, syntheticBarcodeForId(p),
                    bd(1000), "General");
            stockLevels.putIfAbsent(p, 200);
            byId.putIfAbsent(p, gen);
            return gen;
        }
        String nid = "bc-" + Objects.requireNonNull(b);
        var gen = new CatalogEntry(nid, "Producto " + b, b, bd(1000), "General");
        stockLevels.putIfAbsent(nid, 200);
        byId.putIfAbsent(nid, gen);
        byBarcode.putIfAbsent(b, gen);
        return gen;
    }

    private static String syntheticBarcodeForId(String id) {
        return ("00000000" + id).substring(Math.max(0, ("00000000" + id).length() - 13));
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    public int availableStock(String productId) {
        return Math.max(0, stockLevels.getOrDefault(productId, 0));
    }

    public void assertStockAvailable(String productId, int requested) {
        int av = availableStock(productId);
        if (requested > av) {
            CatalogEntry ce = byId.get(productId);
            String pname = ce != null ? ce.name() : productId;
            throw new com.pos.sales.application.exception.InsufficientStockException(
                    "Stock insuficiente / Insufficient stock",
                    java.util.List.of(new com.pos.sales.application.exception.InsufficientStockException.Item(
                            productId,
                            pname,
                            requested,
                            av
                    )));
        }
    }

    public void adjustStock(String productId, int delta) {
        stockLevels.compute(productId, (k, v) -> Math.max(0, (v == null ? 0 : v) + delta));
    }

    /** Búsqueda por nombre para proxy GET /products/search */
    public java.util.List<CatalogEntry> searchByName(String name) {
        if (name == null || name.isBlank()) {
            return java.util.List.of();
        }
        final String needle = name.toLowerCase(Locale.ROOT);
        return byId.values().stream()
                .distinct()
                .filter(e -> e.name().toLowerCase(Locale.ROOT).contains(needle))
                .collect(Collectors.toUnmodifiableList());
    }

    public CatalogEntry byBarcodeStrict(String barcode) {
        CatalogEntry ce = resolve(null, barcode);
        if (!bcPatternKnown(barcode) && !byBarcode.containsKey(barcode)) {
            /* resolve habrá creado genérico: ok para stub */
            return ce;
        }
        return ce;
    }

    private boolean bcPatternKnown(String barcode) {
        return byBarcode.containsKey(barcode);
    }
}
