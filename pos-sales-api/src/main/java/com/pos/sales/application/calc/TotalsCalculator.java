package com.pos.sales.application.calc;

import com.pos.sales.application.exception.DiscountExceedsSubtotalException;
import com.pos.sales.application.dto.MoneyTotals;
import com.pos.sales.domain.model.DiscountType;
import com.pos.sales.domain.model.SaleEntity;
import com.pos.sales.domain.model.SaleLineEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;

@Component
public class TotalsCalculator {

    /** Basis points del impuesto (19% → 1900) */
    private final int taxBps;

    public TotalsCalculator(@Value("${pos.sales.tax-rate}") BigDecimal rate) {
        this.taxBps = rate.multiply(BigDecimal.valueOf(10_000L)).divide(BigDecimal.ONE, 0, RoundingMode.HALF_UP).intValue();
    }

    static long toCents(BigDecimal v) {
        return v.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValue();
    }

    static BigDecimal fromCents(long cents) {
        return BigDecimal.valueOf(cents).movePointLeft(2).setScale(2, RoundingMode.HALF_UP);
    }

    public void refreshLineTotals(SaleLineEntity line) {
        long grossCents = toCents(line.getUnitPrice()) * line.getQuantity();
        long lineDiscountCents = computeDiscountCents(grossCents, line.getDiscountType(), line.getDiscountValue());
        lineDiscountCents = Math.min(lineDiscountCents, grossCents);
        long netCents = grossCents - lineDiscountCents;
        line.setDiscountAmount(fromCents(lineDiscountCents));
        line.setLineTotal(fromCents(netCents));
    }

    /** Recálculo estándar de totales sobre la venta (descuentos por línea) */
    public void recalculate(SaleEntity sale) {
        sale.getLines().forEach(this::refreshLineTotals);
        long grossSubCents = sale.getLines().stream()
                .mapToLong(l -> toCents(l.getUnitPrice()) * l.getQuantity())
                .sum();
        long discountCents = sale.getLines().stream()
                .mapToLong(l -> toCents(l.getDiscountAmount()))
                .sum();
        long taxCents = (grossSubCents * taxBps) / 10000;
        long totalCents = grossSubCents + taxCents - discountCents;
        if (totalCents < 0) {
            totalCents = 0;
        }
        sale.setSubtotal(fromCents(grossSubCents));
        sale.setDiscountAmount(fromCents(discountCents));
        sale.setDiscountType(null);
        sale.setDiscountValue(null);
        sale.setTax(fromCents(taxCents));
        sale.setTotal(fromCents(totalCents));
    }

    public MoneyTotals totalsForReturnedLines(Collection<SaleLineEntity> lines) {
        long subCents = lines.stream().mapToLong(l -> toCents(l.getLineTotal())).sum();
        long taxCents = (subCents * taxBps) / 10000;
        long totalCents = subCents + taxCents;
        return new MoneyTotals(
                fromCents(subCents),
                fromCents(taxCents),
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                fromCents(totalCents)
        );
    }

    static long computeDiscountCents(long subtotalCents, DiscountType discountType, BigDecimal discountValue) {
        if (discountValue == null || discountType == null) {
            return 0;
        }
        return switch (discountType) {
            case PERCENTAGE -> {
                int pct = discountValue.intValue();
                yield (subtotalCents * pct) / 100;
            }
            case FIXED_AMOUNT -> Math.min(toCents(discountValue), subtotalCents);
        };
    }

    /** Valida si el descuento de una línea excedería su subtotal bruto */
    public void validateLineDiscount(SaleLineEntity line, DiscountType type, BigDecimal value) {
        if (type == null || value == null) {
            return;
        }
        long grossCents = toCents(line.getUnitPrice()) * line.getQuantity();
        if (type == DiscountType.FIXED_AMOUNT && value.compareTo(BigDecimal.ZERO) != 0) {
            if (toCents(value) > grossCents) {
                throw new DiscountExceedsSubtotalException();
            }
        }
    }
}
