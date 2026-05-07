package com.pos.sales.application.service;

import com.pos.sales.adapter.external.InMemoryCustomerDirectory;
import com.pos.sales.adapter.external.InMemoryProductCatalog;
import com.pos.sales.application.calc.TotalsCalculator;
import com.pos.sales.application.exception.InvalidQuantityException;
import com.pos.sales.application.exception.InvalidSaleStateException;
import com.pos.sales.application.exception.SaleLineNotFoundException;
import com.pos.sales.application.exception.SaleNotFoundException;
import com.pos.sales.domain.model.DiscountType;
import com.pos.sales.domain.model.SaleEntity;
import com.pos.sales.domain.model.SaleLineEntity;
import com.pos.sales.domain.model.SaleStatus;
import com.pos.sales.infrastructure.persistence.SaleJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class SaleLifecycleService {

    private final SaleJpaRepository saleRepository;
    private final TotalsCalculator totalsCalculator;
    private final InMemoryProductCatalog catalog;
    private final InMemoryCustomerDirectory customers;

    public SaleLifecycleService(SaleJpaRepository saleRepository,
                                TotalsCalculator totalsCalculator,
                                InMemoryProductCatalog catalog,
                                InMemoryCustomerDirectory customers) {
        this.saleRepository = saleRepository;
        this.totalsCalculator = totalsCalculator;
        this.catalog = catalog;
        this.customers = customers;
    }

    @Transactional
    public SaleEntity createSale(String terminalId, String cashierId, String customerId) {
        var sale = new SaleEntity();
        sale.setTerminalId(terminalId);
        sale.setCashierId(cashierId);
        if (customerId != null && !customerId.isBlank()) {
            customers.requireById(customerId.trim());
            sale.setCustomerId(customerId.trim());
        }
        sale.setStatus(SaleStatus.ACTIVE);
        sale.setSubtotal(BigDecimal.ZERO);
        sale.setTax(BigDecimal.ZERO);
        sale.setDiscountAmount(BigDecimal.ZERO);
        sale.setTotal(BigDecimal.ZERO);
        return saleRepository.save(sale);
    }

    @Transactional(readOnly = true)
    public SaleEntity getSale(UUID id) {
        return saleRepository.findByIdWithLines(id).orElseThrow(() -> new SaleNotFoundException(id.toString()));
    }

    @Transactional
    public SaleEntity linkCustomer(UUID saleId, String customerId) {
        SaleEntity sale = getSaleWrite(saleId);
        ensureState(sale, SaleStatus.ACTIVE);
        if (customerId == null || customerId.isBlank()) {
            sale.setCustomerId(null);
        } else {
            customers.requireById(customerId.trim());
            sale.setCustomerId(customerId.trim());
        }
        return saleRepository.save(sale);
    }

    @Transactional
    public SaleEntity addItem(UUID saleId, String productId, String barcode, int quantity) {
        if (quantity < 1) {
            throw new InvalidQuantityException("Cantidad debe ser ≥ 1");
        }
        SaleEntity sale = getSaleWrite(saleId);
        ensureState(sale, SaleStatus.ACTIVE);
        var prod = catalog.resolve(productId, barcode);

        SaleLineEntity line = sale.getLines().stream()
                .filter(l -> l.getProductId().equals(prod.id()))
                .findFirst()
                .orElse(null);

        int targetQty = (line == null ? 0 : line.getQuantity()) + quantity;
        catalog.assertStockAvailable(prod.id(), targetQty);

        if (line == null) {
            line = new SaleLineEntity();
            line.setSale(sale);
            line.setProductId(prod.id());
            line.setProductName(prod.name());
            line.setUnitPrice(prod.unitPrice());
            line.setQuantity(quantity);
            line.setQuantityReturned(0);
            sale.getLines().add(line);
            totalsCalculator.refreshLineTotals(line);
        } else {
            line.setQuantity(targetQty);
            totalsCalculator.refreshLineTotals(line);
        }
        totalsCalculator.recalculate(sale);
        return saleRepository.save(sale);
    }

    @Transactional
    public SaleEntity updateItemQuantity(UUID saleId, UUID lineId, int quantity) {
        if (quantity < 1) {
            throw new InvalidQuantityException("Cantidad debe ser ≥ 1");
        }
        SaleEntity sale = getSaleWrite(saleId);
        ensureState(sale, SaleStatus.ACTIVE);
        SaleLineEntity line = findLine(sale, lineId);
        catalog.assertStockAvailable(line.getProductId(), quantity);
        line.setQuantity(quantity);
        totalsCalculator.refreshLineTotals(line);
        totalsCalculator.recalculate(sale);
        return saleRepository.save(sale);
    }

    @Transactional
    public SaleEntity removeLine(UUID saleId, UUID lineId) {
        SaleEntity sale = getSaleWrite(saleId);
        ensureState(sale, SaleStatus.ACTIVE);
        SaleLineEntity line = findLine(sale, lineId);
        sale.getLines().remove(line);
        totalsCalculator.recalculate(sale);
        return saleRepository.save(sale);
    }

    @Transactional
    public SaleEntity applyDiscount(UUID saleId, DiscountType discountType, BigDecimal discountValue) {
        SaleEntity sale = getSaleWrite(saleId);
        ensureState(sale, SaleStatus.ACTIVE);

        if (discountType == DiscountType.FIXED_AMOUNT && discountValue != null && discountValue.compareTo(BigDecimal.ZERO) == 0) {
            sale.setDiscountType(null);
            sale.setDiscountValue(null);
            totalsCalculator.recalculate(sale);
            return saleRepository.save(sale);
        }
        totalsCalculator.validateDiscount(sale, discountType, discountValue);
        sale.setDiscountType(discountType);
        sale.setDiscountValue(discountValue);
        totalsCalculator.recalculate(sale);
        return saleRepository.save(sale);
    }

    @Transactional
    public SaleEntity freeze(UUID saleId) {
        SaleEntity sale = getSaleWrite(saleId);
        ensureState(sale, SaleStatus.ACTIVE);
        sale.setStatus(SaleStatus.FROZEN);
        sale.setFrozenAt(Instant.now());
        return saleRepository.save(sale);
    }

    @Transactional
    public SaleEntity resume(UUID saleId) {
        SaleEntity sale = getSaleWrite(saleId);
        if (sale.getStatus() != SaleStatus.FROZEN) {
            throw new InvalidSaleStateException("Solo ventas FROZEN pueden reanudarse");
        }
        sale.setStatus(SaleStatus.ACTIVE);
        sale.setFrozenAt(null);
        return saleRepository.save(sale);
    }

    @Transactional
    public SaleEntity cancel(UUID saleId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new InvalidSaleStateException("Motivo de cancelación requerido");
        }
        if (reason.length() > 512) {
            reason = reason.substring(0, 512);
        }
        SaleEntity sale = getSaleWrite(saleId);
        if (sale.getStatus() != SaleStatus.ACTIVE && sale.getStatus() != SaleStatus.FROZEN) {
            throw new InvalidSaleStateException("Solo ACTIVE o FROZEN pueden cancelarse");
        }
        sale.setStatus(SaleStatus.CANCELLED);
        sale.setCancelReason(reason);
        sale.setCancelledAt(Instant.now());
        return saleRepository.save(sale);
    }

    @Transactional(readOnly = true)
    public java.util.List<SaleEntity> listFrozen(String terminalId) {
        return saleRepository.findByTerminalIdAndStatusOrderByFrozenAtAsc(terminalId, SaleStatus.FROZEN);
    }

    @Transactional
    public int cancelExpiredFrozen(Instant expiryThreshold, String bilingualReason) {
        var stale = saleRepository.findByStatusAndFrozenAtIsNotNullAndFrozenAtBefore(SaleStatus.FROZEN, expiryThreshold);
        int n = 0;
        for (SaleEntity sale : stale) {
            sale.setStatus(SaleStatus.CANCELLED);
            sale.setCancelReason(bilingualReason);
            sale.setCancelledAt(Instant.now());
            saleRepository.save(sale);
            n++;
        }
        return n;
    }

    private SaleEntity getSaleWrite(UUID id) {
        return saleRepository.findByIdWithLines(id).orElseThrow(() -> new SaleNotFoundException(id.toString()));
    }

    private static void ensureState(SaleEntity sale, SaleStatus expected) {
        if (sale.getStatus() != expected) {
            throw new InvalidSaleStateException("Estado ilegal para la operación. Actual: " + sale.getStatus());
        }
    }

    private SaleLineEntity findLine(SaleEntity sale, UUID lineId) {
        return sale.getLines().stream()
                .filter(l -> lineId.equals(l.getId()))
                .findFirst()
                .orElseThrow(() -> new SaleLineNotFoundException(lineId.toString()));
    }
}
