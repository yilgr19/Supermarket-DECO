package com.pos.sales.application.calc;

import com.pos.sales.domain.model.DiscountType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class TotalsCalculatorTest {

    private TotalsCalculator calc;

    @BeforeEach
    void setUp() {
        calc = new TotalsCalculator(BigDecimal.valueOf(0.19)); // 19 %
    }

    @Test
    void computeDiscountCents_percentage() {
        long sub = 10000;
        assertThat(TotalsCalculator.computeDiscountCents(sub, DiscountType.PERCENTAGE, bd("10")))
                .isEqualTo(1000); // 10 %
    }

    @Test
    void computeDiscountCents_fixed_capped_by_subtotal() {
        long sub = 500;
        assertThat(TotalsCalculator.computeDiscountCents(sub, DiscountType.FIXED_AMOUNT, bd("1000")))
                .isEqualTo(sub);
    }

    static BigDecimal bd(String v) {
        return new BigDecimal(v);
    }

    @Test
    void recalculate_aggregatesLineDiscounts() {
        var sale = new com.pos.sales.domain.model.SaleEntity();
        var line = new com.pos.sales.domain.model.SaleLineEntity();
        line.setUnitPrice(bd("100.00"));
        line.setQuantity(2);
        line.setDiscountType(DiscountType.PERCENTAGE);
        line.setDiscountValue(bd("10"));
        sale.getLines().add(line);

        calc.recalculate(sale);

        assertThat(sale.getSubtotal()).isEqualByComparingTo(bd("200.00"));
        assertThat(sale.getDiscountAmount()).isEqualByComparingTo(bd("20.00"));
        assertThat(line.getLineTotal()).isEqualByComparingTo(bd("180.00"));
    }
}
