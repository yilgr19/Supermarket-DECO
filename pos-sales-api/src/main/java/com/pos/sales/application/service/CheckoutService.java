package com.pos.sales.application.service;

import com.pos.sales.adapter.external.InMemoryCustomerDirectory;
import com.pos.sales.adapter.external.InMemoryProductCatalog;
import com.pos.sales.application.exception.CreditNotApprovedException;
import com.pos.sales.application.exception.CustomerRequiredForCreditException;
import com.pos.sales.application.exception.InsufficientPaymentException;
import com.pos.sales.application.exception.InsufficientStockException;
import com.pos.sales.application.exception.InvalidSaleStateException;
import com.pos.sales.domain.model.*;
import com.pos.sales.domain.model.PaymentType;
import com.pos.sales.infrastructure.persistence.ReceiptJpaRepository;
import com.pos.sales.infrastructure.persistence.SaleJpaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CheckoutService {

    private final SaleJpaRepository saleRepository;
    private final ReceiptJpaRepository receiptRepository;
    private final InMemoryProductCatalog catalog;
    private final InMemoryCustomerDirectory customers;
    private final String storeName;

    public CheckoutService(SaleJpaRepository saleRepository,
                           ReceiptJpaRepository receiptRepository,
                           InMemoryProductCatalog catalog,
                           InMemoryCustomerDirectory customers,
                           @Value("${pos.sales.store-name}") String storeName) {
        this.saleRepository = saleRepository;
        this.receiptRepository = receiptRepository;
        this.catalog = catalog;
        this.customers = customers;
        this.storeName = storeName;
    }

    @Transactional
    public ReceiptEntity checkout(UUID saleId,
                                  com.pos.sales.domain.model.PaymentType paymentType,
                                  BigDecimal amountReceived,
                                  String bodyCustomerId) {
        SaleEntity sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new com.pos.sales.application.exception.SaleNotFoundException(saleId.toString()));

        if (sale.getStatus() != SaleStatus.ACTIVE) {
            throw new InvalidSaleStateException("Checkout solo sobre ventas ACTIVE");
        }
        if (sale.getLines().isEmpty()) {
            throw new InvalidSaleStateException("Sin ítems no se puede pagar");
        }

        verifyStockAtCheckout(sale);

        String creditCustomer = pickCustomerId(bodyCustomerId, sale.getCustomerId());
        String customerNameSnapshot = resolveCustomerName(creditCustomer);

        if (paymentType == PaymentType.CREDIT) {
            if (creditCustomer == null || creditCustomer.isBlank()) {
                throw new CustomerRequiredForCreditException();
            }
            var c = customers.requireById(creditCustomer);
            if (c.creditStatus() != com.pos.sales.domain.model.CreditStatus.APPROVED) {
                throw new CreditNotApprovedException();
            }
        }

        BigDecimal cashReceived = paymentType == PaymentType.CASH ? amountReceived : null;
        if (paymentType == PaymentType.CASH && (cashReceived == null || cashReceived.compareTo(sale.getTotal()) < 0)) {
            throw new InsufficientPaymentException("Monto insuficiente para CASH");
        }

        BigDecimal change = PaymentType.CASH == paymentType
                ? cashReceived.subtract(sale.getTotal()).setScale(2, RoundingMode.HALF_UP)
                : null;

        for (SaleLineEntity line : sale.getLines()) {
            catalog.adjustStock(line.getProductId(), -line.getQuantity());
        }

        UUID txn = UUID.randomUUID();
        ReceiptEntity receipt = new ReceiptEntity();
        receipt.setTransactionId(txn.toString());
        receipt.setSaleId(sale.getId());
        receipt.setReceiptType(ReceiptType.SALE);
        receipt.setStoreName(storeName);
        receipt.setTerminalId(sale.getTerminalId());
        receipt.setCashierId(sale.getCashierId());
        receipt.setCustomerId(creditCustomer);
        receipt.setCustomerName(customerNameSnapshot);
        receipt.setPaymentType(paymentType);
        receipt.setAmountReceived(cashReceived);
        receipt.setChangeAmount(change);
        receipt.setSubtotal(sale.getSubtotal());
        receipt.setTax(sale.getTax());
        receipt.setDiscount(sale.getDiscountAmount());
        receipt.setTotal(sale.getTotal());

        if (paymentType == PaymentType.CREDIT) {
            receipt.setCreditReference("CRED-" + UUID.randomUUID().toString().substring(0, 8));
        }

        receipt.setOriginalTransactionId(null);
        receipt.setCreatedAt(Instant.now());

        for (SaleLineEntity line : sale.getLines()) {
            var rl = new ReceiptLineEntity();
            rl.setReceipt(receipt);
            rl.setSaleItemId(line.getId().toString());
            rl.setProductId(line.getProductId());
            rl.setProductName(line.getProductName());
            rl.setUnitPrice(line.getUnitPrice());
            rl.setQuantity(line.getQuantity());
            rl.setLineTotal(line.getLineTotal());
            receipt.getLines().add(rl);
        }

        ReceiptEntity persisted = receiptRepository.save(receipt);

        sale.setStatus(SaleStatus.COMPLETED);
        sale.setCompletedAt(Instant.now());
        sale.setPaymentAtCompletion(paymentType);
        sale.setSaleTransactionId(persisted.getTransactionId());
        saleRepository.save(sale);

        return persisted;
    }

    private void verifyStockAtCheckout(SaleEntity sale) {
        List<InsufficientStockException.Item> agg = new ArrayList<>();
        for (SaleLineEntity line : sale.getLines()) {
            int avail = catalog.availableStock(line.getProductId());
            if (line.getQuantity() > avail) {
                agg.add(new InsufficientStockException.Item(line.getProductId(), line.getProductName(),
                        line.getQuantity(), avail));
            }
        }
        if (!agg.isEmpty()) {
            throw new InsufficientStockException("Stock insuficiente al cerrar venta / Insufficient stock at checkout",
                    agg);
        }
    }

    private static String pickCustomerId(String body, String onSale) {
        if (body != null && !body.isBlank()) {
            return body.trim();
        }
        return onSale;
    }

    private String resolveCustomerName(String customerId) {
        try {
            if (customerId == null || customerId.isBlank()) {
                return null;
            }
            return customers.requireById(customerId).fullName();
        } catch (Exception e) {
            return null;
        }
    }
}
