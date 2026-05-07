package com.pos.sales.application.service;

import com.pos.sales.adapter.external.InMemoryProductCatalog;
import com.pos.sales.application.calc.TotalsCalculator;
import com.pos.sales.application.dto.MoneyTotals;
import com.pos.sales.application.exception.InvalidSaleStateException;
import com.pos.sales.application.exception.InvalidQuantityException;
import com.pos.sales.application.exception.SaleLineNotFoundException;
import com.pos.sales.application.exception.SaleNotFoundException;
import com.pos.sales.domain.model.*;
import com.pos.sales.infrastructure.persistence.ReceiptJpaRepository;
import com.pos.sales.infrastructure.persistence.SaleJpaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ReturnService {

    private final SaleJpaRepository saleRepository;
    private final ReceiptJpaRepository receiptRepository;
    private final TotalsCalculator totalsCalculator;
    private final InMemoryProductCatalog catalog;
    private final String storeName;

    public ReturnService(SaleJpaRepository saleRepository,
                         ReceiptJpaRepository receiptRepository,
                         TotalsCalculator totalsCalculator,
                         InMemoryProductCatalog catalog,
                         @Value("${pos.sales.store-name}") String storeName) {
        this.saleRepository = saleRepository;
        this.receiptRepository = receiptRepository;
        this.totalsCalculator = totalsCalculator;
        this.catalog = catalog;
        this.storeName = storeName;
    }

    @Transactional
    public ReceiptEntity fullReturn(UUID saleId, String reason) {
        SaleEntity sale = loadSaleRequired(saleId);
        if (sale.getStatus() != SaleStatus.COMPLETED) {
            throw new InvalidSaleStateException("Solo ventas COMPLETED admiten devolución total");
        }
        if (reason == null || reason.isBlank()) {
            throw new InvalidSaleStateException("Motivo requerido");
        }

        MoneyTotals totals = totalsCalculator.totalsForReturnedLines(new ArrayList<>(sale.getLines()));
        ReceiptEntity receipt = buildBaseReturnReceipt(sale, ReceiptType.FULL_RETURN, totals, sale.getSaleTransactionId());

        attachReturnLines(sale.getLines(), receipt, reason);

        for (SaleLineEntity line : sale.getLines()) {
            catalog.adjustStock(line.getProductId(), line.getQuantity());
        }

        receipt.setCreditReference(resolveCreditMemoRef(sale.getPaymentAtCompletion()));
        ReceiptEntity persisted = receiptRepository.save(receipt);
        sale.setStatus(SaleStatus.RETURNED);
        saleRepository.save(sale);
        return persisted;
    }

    @Transactional
    public ReceiptEntity partialReturn(UUID saleId, List<PartialLine> rows) {
        SaleEntity sale = loadSaleRequired(saleId);
        if (sale.getStatus() != SaleStatus.COMPLETED && sale.getStatus() != SaleStatus.PARTIALLY_RETURNED) {
            throw new InvalidSaleStateException("Estado ilegal para devolución parcial");
        }
        if (rows == null || rows.isEmpty()) {
            throw new InvalidQuantityException("Lista de ítems vacía");
        }

        List<SaleLineEntity> phantom = new ArrayList<>();
        for (PartialLine row : rows) {
            if (row.reason() == null || row.reason().isBlank()) {
                throw new InvalidSaleStateException("Motivo por ítem obligatorio");
            }
            SaleLineEntity line = sale.getLines().stream()
                    .filter(l -> row.saleItemId().equals(l.getId().toString()))
                    .findFirst()
                    .orElseThrow(() -> new SaleLineNotFoundException(row.saleItemId()));
            int returnable = line.returnableQty();
            int q = row.quantity();
            if (q < 1) {
                throw new InvalidQuantityException("Cantidad mínima 1");
            }
            if (q > returnable) {
                throw new InvalidQuantityException("Cantidad mayor a lo devolvible para el ítem");
            }

            line.setQuantityReturned(line.getQuantityReturned() + q);
            catalog.adjustStock(line.getProductId(), q);

            phantom.add(snapshotSubset(line, q));
        }

        MoneyTotals totals = totalsCalculator.totalsForReturnedLines(phantom);
        ReceiptEntity receipt = buildBaseReturnReceipt(sale, ReceiptType.PARTIAL_RETURN, totals,
                sale.getSaleTransactionId());
        receipt.getLines().clear();
        for (int i = 0; i < rows.size(); i++) {
            PartialLine row = rows.get(i);
            SaleLineEntity snap = phantom.get(i);
            var rl = new ReceiptLineEntity();
            rl.setReceipt(receipt);
            rl.setSaleItemId(row.saleItemId());
            rl.setProductId(snap.getProductId());
            rl.setProductName(snap.getProductName());
            rl.setUnitPrice(snap.getUnitPrice());
            rl.setQuantity(snap.getQuantity());
            rl.setLineTotal(snap.getLineTotal());
            rl.setReturnReason(row.reason());
            receipt.getLines().add(rl);
        }

        boolean allReturned = sale.getLines().stream().allMatch(l -> l.returnableQty() == 0);
        sale.setStatus(allReturned ? SaleStatus.RETURNED : SaleStatus.PARTIALLY_RETURNED);
        receipt.setCreditReference(resolveCreditMemoRef(sale.getPaymentAtCompletion()));

        ReceiptEntity persisted = receiptRepository.save(receipt);
        saleRepository.save(sale);
        return persisted;
    }

    private SaleEntity loadSaleRequired(UUID id) {
        return saleRepository.findById(id).orElseThrow(() -> new SaleNotFoundException(id.toString()));
    }

    private ReceiptEntity buildBaseReturnReceipt(SaleEntity sale,
                                                 ReceiptType type,
                                                 MoneyTotals totals,
                                                 String originalTxn) {
        ReceiptEntity receipt = new ReceiptEntity();
        receipt.setTransactionId(UUID.randomUUID().toString());
        receipt.setSaleId(sale.getId());
        receipt.setReceiptType(type);
        receipt.setStoreName(storeName);
        receipt.setTerminalId(sale.getTerminalId());
        receipt.setCashierId(sale.getCashierId());
        receipt.setCustomerId(sale.getCustomerId());
        receipt.setPaymentType(sale.getPaymentAtCompletion() != null ? sale.getPaymentAtCompletion() : PaymentType.CASH);
        receipt.setSubtotal(totals.subtotal());
        receipt.setTax(totals.tax());
        receipt.setDiscount(totals.discount());
        receipt.setTotal(totals.total());
        receipt.setOriginalTransactionId(originalTxn);
        receipt.setCreatedAt(Instant.now());
        return receipt;
    }

    private void attachReturnLines(List<SaleLineEntity> lines, ReceiptEntity receipt, String reason) {
        for (SaleLineEntity line : lines) {
            var rl = new ReceiptLineEntity();
            rl.setReceipt(receipt);
            rl.setSaleItemId(line.getId().toString());
            rl.setProductId(line.getProductId());
            rl.setProductName(line.getProductName());
            rl.setUnitPrice(line.getUnitPrice());
            rl.setQuantity(line.getQuantity());
            rl.setLineTotal(line.getLineTotal());
            rl.setReturnReason(reason);
            receipt.getLines().add(rl);
        }
    }

    private SaleLineEntity snapshotSubset(SaleLineEntity source, int qty) {
        SaleLineEntity s = new SaleLineEntity();
        s.setProductId(source.getProductId());
        s.setProductName(source.getProductName());
        s.setUnitPrice(source.getUnitPrice());
        s.setQuantity(qty);
        totalsCalculator.refreshLineTotals(s);
        return s;
    }

    private String resolveCreditMemoRef(PaymentType orig) {
        if (orig == PaymentType.CREDIT) {
            return "CN-" + UUID.randomUUID().toString().substring(0, 12);
        }
        return null;
    }

    public record PartialLine(String saleItemId, int quantity, String reason) {
    }
}
