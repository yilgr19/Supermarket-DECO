package com.pos.sales.application.service;

import com.pos.sales.application.exception.ProductNotFoundException;
import com.pos.sales.application.exception.ProductValidationException;
import com.pos.sales.domain.model.ProductEntity;
import com.pos.sales.domain.model.ProductStatus;
import com.pos.sales.infrastructure.persistence.ProductJpaRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductCatalogService {

    private final ProductJpaRepository repository;

    public ProductCatalogService(ProductJpaRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    @Transactional
    void seedIfEmpty() {
        if (repository.count() > 0) {
            return;
        }
        saveValidated(buildEntity("Leche Entera", "Leche entera 1L", "Lácteos",
                bd(2400), bd(22000), ProductStatus.activo, "7501234567890", 50));
        saveValidated(buildEntity("Pan integral", "Pan integral tajado 500g", "Panadería",
                bd(1200), bd(10000), ProductStatus.activo, "7509876543210", 35));
    }

    @Transactional(readOnly = true)
    public Page<ProductEntity> list(String nombre, String subcategoria, ProductStatus estado, int page, int limit) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.max(limit, 1);
        Specification<ProductEntity> spec = buildSpec(nombre, subcategoria, estado);
        Page<ProductEntity> result = repository.findAll(spec,
                PageRequest.of(safePage - 1, safeLimit, Sort.by("nombre").ascending()));
        if (result.getTotalElements() > 0 && safePage > result.getTotalPages()) {
            return repository.findAll(spec,
                    PageRequest.of(result.getTotalPages() - 1, safeLimit, Sort.by("nombre").ascending()));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public ProductEntity requireById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("No se encontró el producto con id " + id));
    }

    @Transactional
    public ProductEntity create(Map<String, Object> body) {
        ProductEntity entity = new ProductEntity();
        applyPayload(entity, body, null);
        return saveValidated(entity);
    }

    @Transactional
    public ProductEntity update(Long id, Map<String, Object> body) {
        ProductEntity entity = requireById(id);
        applyPayload(entity, body, id);
        return saveValidated(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ProductNotFoundException("No se encontró el producto con id " + id);
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ProductEntity> searchActiveByName(String name) {
        if (name == null || name.isBlank()) {
            return List.of();
        }
        String needle = name.trim().toLowerCase(Locale.ROOT);
        return repository.findAll(buildSpec(needle, null, ProductStatus.activo));
    }

    @Transactional(readOnly = true)
    public ProductEntity requireActiveByBarcode(String barcode) {
        ProductEntity p = repository.findByBarcode(barcode.trim())
                .orElseThrow(() -> new ProductNotFoundException("Producto no encontrado / Product not found"));
        if (p.getEstado() != ProductStatus.activo) {
            throw new ProductNotFoundException("Producto no encontrado / Product not found");
        }
        return p;
    }

    @Transactional(readOnly = true)
    public ProductEntity resolveForSale(String productId, String barcode) {
        String pid = blankToNull(productId);
        String bc = blankToNull(barcode);
        if (pid == null && bc == null) {
            throw new ProductNotFoundException("productId y barcode vacíos");
        }
        if (pid != null) {
            try {
                long id = Long.parseLong(pid);
                ProductEntity byId = requireActiveById(id);
                return byId;
            } catch (NumberFormatException ignored) {
                // compat legacy ids
            }
        }
        if (bc != null) {
            return requireActiveByBarcode(bc);
        }
        throw new ProductNotFoundException("Producto no encontrado / Product not found: " + productId);
    }

    @Transactional(readOnly = true)
    public int availableStock(Long productId) {
        return repository.findById(productId).map(ProductEntity::getAvailableStock).orElse(0);
    }

    @Transactional
    public void assertStockAvailable(Long productId, int requested) {
        ProductEntity p = requireById(productId);
        if (requested > p.getAvailableStock()) {
            throw new com.pos.sales.application.exception.InsufficientStockException(
                    "Stock insuficiente / Insufficient stock",
                    List.of(new com.pos.sales.application.exception.InsufficientStockException.Item(
                            String.valueOf(productId),
                            p.getNombre(),
                            requested,
                            p.getAvailableStock()
                    )));
        }
    }

    @Transactional
    public void adjustStock(Long productId, int delta) {
        ProductEntity p = requireById(productId);
        p.setAvailableStock(Math.max(0, p.getAvailableStock() + delta));
        repository.save(p);
    }

    @Transactional(readOnly = true)
    public List<String> distinctSubcategorias() {
        return repository.findAll(Sort.by("subcategoria")).stream()
                .map(ProductEntity::getSubcategoria)
                .distinct()
                .toList();
    }

    private ProductEntity requireActiveById(long id) {
        ProductEntity p = requireById(id);
        if (p.getEstado() != ProductStatus.activo) {
            throw new ProductNotFoundException("Producto no encontrado / Product not found: " + id);
        }
        return p;
    }

    private ProductEntity saveValidated(ProductEntity entity) {
        validateEntity(entity);
        return repository.save(entity);
    }

    private static Specification<ProductEntity> buildSpec(String nombre, String subcategoria, ProductStatus estado) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (nombre != null && !nombre.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nombre")),
                        "%" + nombre.trim().toLowerCase(Locale.ROOT) + "%"));
            }
            if (subcategoria != null && !subcategoria.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("subcategoria")),
                        subcategoria.trim().toLowerCase(Locale.ROOT)));
            }
            if (estado != null) {
                predicates.add(cb.equal(root.get("estado"), estado));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void applyPayload(ProductEntity entity, Map<String, Object> body, Long currentId) {
        entity.setNombre(asString(body.get("nombre")));
        entity.setDescripcion(asString(body.get("descripcion")));
        entity.setSubcategoria(asString(body.get("subcategoria")));
        entity.setPrecio(asMoney(body.get("precio")));
        entity.setPrecioxcantidad(asMoney(body.get("precioxcantidad")));
        entity.setEstado(parseEstado(body.get("estado")));
        entity.setBarcode(resolveBarcode(body, entity, currentId));
        entity.setAvailableStock(parseStock(body.get("availableStock"), entity.getAvailableStock()));
    }

    private String resolveBarcode(Map<String, Object> body, ProductEntity entity, Long currentId) {
        Object raw = body.get("barcode");
        String barcode = raw == null || String.valueOf(raw).isBlank()
                ? entity.getBarcode()
                : String.valueOf(raw).trim();
        if (barcode == null || barcode.isBlank()) {
            barcode = "750" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        }
        if (currentId == null) {
            if (repository.findByBarcode(barcode).isPresent()) {
                throw validation("barcode", "Código de barras ya registrado");
            }
        } else if (repository.existsByBarcodeAndIdNot(barcode, currentId)) {
            throw validation("barcode", "Código de barras ya registrado");
        }
        return barcode;
    }

    private void validateEntity(ProductEntity entity) {
        List<ProductValidationException.FieldDetail> details = new ArrayList<>();
        requireText(details, "nombre", entity.getNombre());
        requireText(details, "descripcion", entity.getDescripcion());
        requireText(details, "subcategoria", entity.getSubcategoria());
        requirePositive(details, "precio", entity.getPrecio());
        requirePositive(details, "precioxcantidad", entity.getPrecioxcantidad());
        if (entity.getEstado() == null) {
            details.add(new ProductValidationException.FieldDetail("estado", "Campo obligatorio"));
        }
        if (entity.getAvailableStock() < 0) {
            details.add(new ProductValidationException.FieldDetail("availableStock", "No puede ser negativo"));
        }
        if (!details.isEmpty()) {
            throw new ProductValidationException("Datos de entrada inválidos", details);
        }
    }

    private static void requireText(List<ProductValidationException.FieldDetail> details, String field, String value) {
        if (value == null || value.isBlank()) {
            details.add(new ProductValidationException.FieldDetail(field, "Campo obligatorio"));
        }
    }

    private static void requirePositive(List<ProductValidationException.FieldDetail> details, String field, BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            details.add(new ProductValidationException.FieldDetail(field, "Debe ser un número positivo"));
        }
    }

    private static ProductEntity buildEntity(String nombre,
                                             String descripcion,
                                             String subcategoria,
                                             BigDecimal precio,
                                             BigDecimal precioxcantidad,
                                             ProductStatus estado,
                                             String barcode,
                                             int stock) {
        ProductEntity e = new ProductEntity();
        e.setNombre(nombre);
        e.setDescripcion(descripcion);
        e.setSubcategoria(subcategoria);
        e.setPrecio(precio);
        e.setPrecioxcantidad(precioxcantidad);
        e.setEstado(estado);
        e.setBarcode(barcode);
        e.setAvailableStock(stock);
        return e;
    }

    private static BigDecimal bd(long v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP);
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private static String asString(Object v) {
        return v == null ? null : String.valueOf(v).trim();
    }

    private static BigDecimal asMoney(Object v) {
        if (v == null || String.valueOf(v).isBlank()) {
            return null;
        }
        return new BigDecimal(String.valueOf(v)).setScale(2, RoundingMode.HALF_UP);
    }

    private static ProductStatus parseEstado(Object v) {
        if (v == null) {
            return null;
        }
        String s = String.valueOf(v).trim().toLowerCase(Locale.ROOT);
        if ("activo".equals(s)) {
            return ProductStatus.activo;
        }
        if ("inactivo".equals(s)) {
            return ProductStatus.inactivo;
        }
        throw validation("estado", "Solo se permite 'activo' o 'inactivo'");
    }

    private static int parseStock(Object v, int fallback) {
        if (v == null || String.valueOf(v).isBlank()) {
            return fallback;
        }
        return Math.max(0, Integer.parseInt(String.valueOf(v)));
    }

    private static ProductValidationException validation(String field, String message) {
        return new ProductValidationException("Datos de entrada inválidos",
                List.of(new ProductValidationException.FieldDetail(field, message)));
    }
}
